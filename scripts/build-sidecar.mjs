#!/usr/bin/env node
// Assembles src-tauri/resources/sidecar/ for one target triple:
//
//   index.cjs                     the bundled service (sharp left external)
//   node_modules/sharp/**         the JS wrapper
//   node_modules/@img/sharp-*/**  the native addon + libvips for THIS target
//
// sharp is deliberately NOT compiled in. pkg, Node SEA and `bun build --compile`
// all embed a virtual filesystem, and libvips ships as a *separate* shared
// library (libvips-cpp.so.42 / .dylib) that the dynamic loader must find as a
// real file on disk. Shipping a plain node_modules tree as a Tauri resource is
// what makes this work at all.
//
// Usage: node scripts/build-sidecar.mjs [target-triple]   (defaults to the host)

import { execFileSync, execSync } from "node:child_process";
import { mkdirSync, rmSync, writeFileSync, existsSync } from "node:fs";
import path from "node:path";
import { TARGETS } from "./targets.mjs";

const triple = process.argv[2] || execSync("rustc --print host-tuple").toString().trim();
const target = TARGETS[triple];
if (!target) {
  console.error(`Unknown target "${triple}". Known: ${Object.keys(TARGETS).join(", ")}`);
  process.exit(1);
}

const root = path.resolve(import.meta.dirname, "..");
const outDir = path.join(root, "src-tauri", "resources", "sidecar");

const sharpVersion = JSON.parse(
  execSync("cat sidecar/package.json", { cwd: root }).toString()
).dependencies.sharp;

console.error(`▸ building sidecar for ${triple} (sharp ${sharpVersion})`);

rmSync(outDir, { recursive: true, force: true });
mkdirSync(outDir, { recursive: true });

// 1. Bundle the service. --external:sharp is mandatory: bundling it breaks the
//    runtime lookup of @img/sharp-<platform>-<arch>.
console.error("↳ esbuild");
execFileSync(
  "pnpm",
  [
    "exec", "esbuild", "sidecar/src/index.mjs",
    "--bundle",
    "--platform=node",
    "--format=cjs",
    "--target=node20",
    "--external:sharp",
    `--outfile=${path.join(outDir, "index.cjs")}`,
    "--log-level=warning",
  ],
  { cwd: root, stdio: "inherit" }
);

// 2. Install sharp for the TARGET platform, not the build host.
//    npm, not pnpm: pnpm's symlinked store does not survive being copied into
//    an app bundle.
console.error(`↳ npm install sharp (${JSON.stringify(target.npm)})`);
writeFileSync(
  path.join(outDir, "package.json"),
  JSON.stringify({ name: "pixel-flow-sidecar-runtime", private: true, dependencies: { sharp: sharpVersion } }, null, 2) + "\n"
);
const flags = [`--os=${target.npm.os}`, `--cpu=${target.npm.cpu}`];
if (target.npm.libc) flags.push(`--libc=${target.npm.libc}`);
execFileSync(
  "npm",
  ["install", "--prefix", outDir, "--include=optional", "--no-audit", "--no-fund", "--silent", ...flags, `sharp@${sharpVersion}`],
  { cwd: root, stdio: "inherit" }
);

// 3. Fail loudly here rather than at runtime in a packaged app.
const expected = `@img/sharp-${target.npm.os}-${target.npm.cpu}`;
if (!existsSync(path.join(outDir, "node_modules", expected))) {
  console.error(`✗ ${expected} missing after install — sharp would fail at runtime`);
  process.exit(1);
}
// Windows links libvips statically, so it has no separate libvips package.
if (target.npm.os !== "win32") {
  const vips = `@img/sharp-libvips-${target.npm.os}-${target.npm.cpu}`;
  if (!existsSync(path.join(outDir, "node_modules", vips))) {
    console.error(`✗ ${vips} missing after install — libvips would not load`);
    process.exit(1);
  }
}

// The WASM fallback is ~9 MB and is never reached: every target we ship has a
// native @img/sharp-<os>-<cpu> build, which sharp prefers.
rmSync(path.join(outDir, "node_modules", "@img", "sharp-wasm32"), {
  recursive: true,
  force: true,
});

const size = execSync(`du -sh "${outDir}" | cut -f1`).toString().trim();
console.error(`✓ ${path.relative(root, outDir)} ready (${size})`);
