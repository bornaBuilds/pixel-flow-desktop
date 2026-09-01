#!/usr/bin/env node
// Downloads the stock Node runtime for a target triple and drops just the
// binary into src-tauri/binaries/node-<triple>[.exe], which is the exact name
// Tauri's externalBin expects.
//
// Not committed to git: ~100 MB per platform. CI runs this per matrix job.
//
// Usage: node scripts/fetch-node.mjs [target-triple]   (defaults to the host)

import { execFileSync, execSync } from "node:child_process";
import { mkdirSync, existsSync, rmSync, copyFileSync, statSync, chmodSync } from "node:fs";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { NODE_VERSION, TARGETS } from "./targets.mjs";

const triple = process.argv[2] || execSync("rustc --print host-tuple").toString().trim();
const target = TARGETS[triple];
if (!target) {
  console.error(`Unknown target "${triple}". Known: ${Object.keys(TARGETS).join(", ")}`);
  process.exit(1);
}

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
  execFileSync("curl", ["-fsSL", "-o", archive, url], { stdio: ["ignore", "ignore", "inherit"] });

  console.error("↳ extracting");
  const member = `${stem}/${target.binaryInArchive}`;
  if (target.archive === "zip") {
    execFileSync("unzip", ["-q", "-o", archive, member, "-d", work], { stdio: "inherit" });
  } else {
    execFileSync("tar", ["-xf", archive, "-C", work, member], { stdio: "inherit" });
  }

  mkdirSync(outDir, { recursive: true });
  copyFileSync(path.join(work, member), outFile);
  chmodSync(outFile, 0o755);

  const before = statSync(outFile).size;
  // Windows binaries are already minimal, and cross-stripping a Mach-O from
  // Linux is not safe, so only strip when the host can do it natively.
  const canStrip =
    !target.exeSuffix &&
    triple === execSync("rustc --print host-tuple").toString().trim();
  if (canStrip) {
    try {
      execFileSync("strip", [outFile], { stdio: "ignore" });
    } catch {
      console.error("  (strip unavailable, shipping unstripped)");
    }
  }
  const after = statSync(outFile).size;
  const mb = (n) => (n / 1024 / 1024).toFixed(0);
  console.error(
    `✓ ${path.relative(root, outFile)} ${mb(after)} MB` +
      (after < before ? ` (stripped from ${mb(before)} MB)` : "")
  );
} finally {
  rmSync(work, { recursive: true, force: true });
}
