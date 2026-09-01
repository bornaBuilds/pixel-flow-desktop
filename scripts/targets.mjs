// Single source of truth for the platforms we ship.
//
// `sharp` picks its native package at runtime from process.platform/arch, so
// the npm cpu/os/libc flags below must match the Rust target triple exactly.
// Note win32 has no separate @img/sharp-libvips-* package: libvips is linked
// statically there, which is why Windows bundles are ~8 MB smaller.

export const NODE_VERSION = "24.20.0"; // Krypton LTS

export const TARGETS = {
  "x86_64-pc-windows-msvc": {
    nodeDist: "win-x64",
    archive: "zip",
    binaryInArchive: "node.exe",
    exeSuffix: ".exe",
    npm: { os: "win32", cpu: "x64" },
  },
  "x86_64-apple-darwin": {
    nodeDist: "darwin-x64",
    archive: "tar.gz",
    binaryInArchive: "bin/node",
    exeSuffix: "",
    npm: { os: "darwin", cpu: "x64" },
  },
  "aarch64-apple-darwin": {
    nodeDist: "darwin-arm64",
    archive: "tar.gz",
    binaryInArchive: "bin/node",
    exeSuffix: "",
    npm: { os: "darwin", cpu: "arm64" },
  },
  "x86_64-unknown-linux-gnu": {
    nodeDist: "linux-x64",
    archive: "tar.xz",
    binaryInArchive: "bin/node",
    exeSuffix: "",
    npm: { os: "linux", cpu: "x64", libc: "glibc" },
  },
  "aarch64-unknown-linux-gnu": {
    nodeDist: "linux-arm64",
    archive: "tar.xz",
    binaryInArchive: "bin/node",
    exeSuffix: "",
    npm: { os: "linux", cpu: "arm64", libc: "glibc" },
  },
};

export function hostTriple() {
  const { execSync } = require("node:child_process");
  return execSync("rustc --print host-tuple").toString().trim();
}
