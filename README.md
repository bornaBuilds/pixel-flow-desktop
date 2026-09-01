# pixel-flow-desktop

Tauri v2 desktop port of [PixelFlow](https://github.com/bornaBuilds/pixel-flow) — convert
images and pull thumbnails out of video, entirely offline.

- **Image conversion** runs locally through **sharp**, shipped as a Node sidecar.
- **Video thumbnails** run in the webview via WebCodecs (`mediabunny`) — no ffmpeg.

## Prerequisites

Rust (stable) and Node 20.9+ / pnpm. On Debian/Ubuntu/Pop!_OS also:

```bash
sudo apt install -y libwebkit2gtk-4.1-dev libjavascriptcoregtk-4.1-dev libsoup-3.0-dev \
  librsvg2-dev libssl-dev libdbus-1-dev libgtk-3-dev pkg-config build-essential \
  patchelf xdg-utils file
```

## Develop

```bash
pnpm install
pnpm desktop:dev
```

## Build

The sidecar is not in git (~100 MB Node runtime + ~21 MB sharp/libvips per
platform). Fetch and assemble it for your target first:

```bash
node scripts/fetch-node.mjs      # -> src-tauri/binaries/pixelflow-node-<triple>
node scripts/build-sidecar.mjs   # -> src-tauri/resources/sidecar/
pnpm desktop:build
```

Both scripts default to the host triple; pass one explicitly to cross-prepare
(`node scripts/build-sidecar.mjs x86_64-pc-windows-msvc`).

Always smoke-test the **bundled** app, not just `tauri dev` — resource paths
resolve differently and dev will pass while the bundle fails.

## Release

Bump the version, commit, then tag:

```bash
pnpm version:set 0.2.0
git commit -am "Release v0.2.0"
git tag -a v0.2.0 -m "v0.2.0"
git push && git push origin v0.2.0
```

Push the tag explicitly. `git push --follow-tags` pushes only *annotated*
tags, so it silently skips a plain `git tag v0.2.0` and the release workflow
never fires.

The matrix then builds every target and opens a **draft** release.

The version lives in `tauri.conf.json`, `package.json` and `Cargo.toml`;
`pnpm version:check` asserts they agree and CI enforces it. Tauri reads
`tauri.conf.json`, and that value becomes both the release title and the
installer filenames — a git tag on its own does not change it. The release
workflow re-derives it from the tag anyway, so forgetting the bump gets you
correctly-named artifacts, just a stale number in the repo.

| Runner | Target | Bundles |
|---|---|---|
| `ubuntu-22.04` | `x86_64-unknown-linux-gnu` | deb, rpm, AppImage |
| `windows-latest` | `x86_64-pc-windows-msvc` | nsis |

Windows is unsigned for now, so SmartScreen will warn on first run. That needs
an OV/EV certificate wired to `bundle.windows.signCommand`; reputation accrues
per certificate, so buy it earlier than you plan to use it.

### macOS

Not built yet, by choice. Nothing in the Rust or sidecar code is
platform-specific, `scripts/sign-macos-inner.sh` is kept, and
`src-tauri/entitlements.plist` already carries the JIT and
`disable-library-validation` entitlements the Node/V8 sidecar needs under
hardened runtime. Re-adding it means two matrix entries
(`macos-latest` for arm64, `macos-15-intel` for x64 — `macos-13` no longer
exists), the certificate import step, and running the inner-signing script
before `tauri build`, because Tauri signs `externalBin` but **not**
`bundle.resources` and notarization rejects any unsigned Mach-O.

Its last attempt failed inside `tauri build --bundles dmg` after compiling
cleanly, so the cause is in bundling or signing, not the app.

## Status

| Milestone | State |
|---|---|
| 1 — window opens, static export, thumbnails work | ✅ done |
| 2 — Node + sharp sidecar spawns from a bundle | ✅ done |
| 3 — converter end-to-end, native pick/drop/save | ✅ done |
| 4 — CI matrix, all four targets | ⬜ next |
| 5 — signing, notarization, updater | not started |

Everything crossing into Tauri lives in `src/platform/`: `convert.ts`
(batch conversion + progress channel), `files.ts` (native pickers and saves),
`drag-drop.ts` (path-yielding drag and drop), `engine.ts` (sidecar health).
