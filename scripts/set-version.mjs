#!/usr/bin/env node
// Sets the app version across every file that carries one.
//
// The git tag is only a ref: Tauri takes the version from tauri.conf.json, and
// that value is what ends up in the release title AND the installer filenames.
// Tagging v0.1.2 without touching it produces PixelFlow_0.1.0_amd64.deb inside
// a release called "PixelFlow 0.1.0".
//
// Usage: node scripts/set-version.mjs 0.1.2
//        node scripts/set-version.mjs --check    (verify the three agree)

import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const files = {
  tauri: path.join(root, "src-tauri", "tauri.conf.json"),
  pkg: path.join(root, "package.json"),
  cargo: path.join(root, "src-tauri", "Cargo.toml"),
};

const readJsonVersion = (file) => JSON.parse(readFileSync(file, "utf8")).version;
const readCargoVersion = (file) =>
  readFileSync(file, "utf8").match(/^version\s*=\s*"([^"]+)"/m)?.[1];

const current = {
  "tauri.conf.json": readJsonVersion(files.tauri),
  "package.json": readJsonVersion(files.pkg),
  "Cargo.toml": readCargoVersion(files.cargo),
};

const arg = process.argv[2];

if (!arg || arg === "--check") {
  const unique = [...new Set(Object.values(current))];
  for (const [name, v] of Object.entries(current)) console.log(`  ${name.padEnd(18)} ${v}`);
  if (unique.length !== 1) {
    console.error(`\n✗ versions disagree: ${unique.join(", ")}`);
    process.exit(1);
  }
  console.log(`\n✓ all agree on ${unique[0]}`);
  process.exit(0);
}

// Accept "v0.1.2" or "0.1.2".
const version = arg.replace(/^v/, "");
if (!/^\d+\.\d+\.\d+(-[0-9A-Za-z.-]+)?$/.test(version)) {
  console.error(`✗ "${version}" is not a semver version`);
  process.exit(1);
}

for (const key of ["tauri", "pkg"]) {
  const file = files[key];
  const raw = readFileSync(file, "utf8");
  const data = JSON.parse(raw);
  data.version = version;
  // Preserve two-space indentation and the trailing newline.
  writeFileSync(file, JSON.stringify(data, null, 2) + "\n");
}

// Only the first `version =` in Cargo.toml is the package's own; dependency
// entries further down must not be touched.
const cargo = readFileSync(files.cargo, "utf8");
writeFileSync(
  files.cargo,
  cargo.replace(/^version\s*=\s*"[^"]+"/m, `version = "${version}"`)
);

console.log(`✓ set version to ${version} in tauri.conf.json, package.json, Cargo.toml`);
