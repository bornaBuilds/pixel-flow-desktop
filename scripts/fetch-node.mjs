#!/usr/bin/env node
// Downloads the stock Node runtime for a target triple and drops just the
// binary into src-tauri/binaries/pixelflow-node-<triple>[.exe], which is the
// exact name Tauri's externalBin expects.
//
// Deliberately NOT named "node": Tauri installs externalBin into /usr/bin on
// Linux, so that name would collide with the system nodejs package.
//
// Not committed to git: ~100 MB per platform. CI runs this per matrix job.
//
// Usage: node scripts/fetch-node.mjs [target-triple]   (defaults to the host)

import { execFileSync } from "node:child_process";
import { createWriteStream } from "node:fs";
import { chmodSync, copyFileSync, existsSync, mkdirSync, mkdtempSync, rmSync, statSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { Readable } from "node:stream";
import { pipeline } from "node:stream/promises";
import { NODE_VERSION, hostTriple, resolveTarget, megabytes } from "./targets.mjs";

const { triple, target } = resolveTarget(process.argv);

const root = path.resolve(import.meta.dirname, "..");
const outDir = path.join(root, "src-tauri", "binaries");
const outFile = path.join(outDir, `pixelflow-node-${triple}${target.exeSuffix}`);

if (existsSync(outFile) && !process.env.FORCE) {
  console.error(`✓ ${path.relative(root, outFile)} already present (FORCE=1 to refetch)`);
  process.exit(0);
}

const stem = `node-v${NODE_VERSION}-${target.nodeDist}`;
const url = `https://nodejs.org/dist/v${NODE_VERSION}/${stem}.${target.archive}`;
const work = mkdtempSync(path.join(tmpdir(), "pf-node-"));

try {
  console.error(`↓ ${url}`);
  const archive = path.join(work, `node.${target.archive}`);
  // Node's own fetch, so this needs no curl/wget on any runner.
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`${response.status} ${response.statusText} for ${url}`);
  }
  await pipeline(Readable.fromWeb(response.body), createWriteStream(archive));

  console.error("↳ extracting");
  const member = `${stem}/${target.binaryInArchive}`;
  // bsdtar (macOS, and Windows 10+ where it is simply `tar`) reads zip as well
  // as tar. GNU tar on Linux cannot, but Linux targets are never zip.
  try {
    execFileSync("tar", ["-xf", archive, "-C", work, member], { stdio: "inherit" });
  } catch (error) {
    if (target.archive !== "zip") throw error;
    execFileSync("unzip", ["-q", "-o", archive, member, "-d", work], { stdio: "inherit" });
  }

  mkdirSync(outDir, { recursive: true });
  copyFileSync(path.join(work, member), outFile);
  chmodSync(outFile, 0o755);

  const before = statSync(outFile).size;
  // Windows PE binaries are already minimal, and cross-stripping a Mach-O from
  // Linux is not safe, so only strip when the host can do it natively.
  if (!target.exeSuffix && triple === hostTriple()) {
    try {
      execFileSync("strip", [outFile], { stdio: "ignore" });
    } catch {
      console.error("  (strip unavailable, shipping unstripped)");
    }
  }
  const after = statSync(outFile).size;
  console.error(
    `✓ ${path.relative(root, outFile)} ${megabytes(after)}` +
      (after < before ? ` (stripped from ${megabytes(before)})` : "")
  );
} finally {
  rmSync(work, { recursive: true, force: true });
}
