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

Tag and push; the matrix builds every target and opens a **draft** release.

```bash
git tag v0.1.0 && git push origin v0.1.0
```

| Runner | Target | Bundles |
|---|---|---|
| `ubuntu-22.04` | `x86_64-unknown-linux-gnu` | deb, rpm, AppImage |
| `windows-latest` | `x86_64-pc-windows-msvc` | nsis |
| `macos-latest` | `aarch64-apple-darwin` | dmg |
| `macos-15-intel` | `x86_64-apple-darwin` | dmg |

Builds run unsigned unless these repository secrets are set. macOS without
them still produces a usable DMG for testing, it just will not pass Gatekeeper
on someone else's machine.

| Secret | For |
|---|---|
| `APPLE_CERTIFICATE` | Developer ID cert, base64 of the .p12 |
| `APPLE_CERTIFICATE_PASSWORD` | that .p12's password |
| `KEYCHAIN_PASSWORD` | any throwaway value; unlocks the CI keychain |
| `APPLE_SIGNING_IDENTITY` | e.g. `Developer ID Application: Name (TEAMID)` |
| `APPLE_ID`, `APPLE_PASSWORD`, `APPLE_TEAM_ID` | notarization; `APPLE_PASSWORD` is an app-specific password |

Windows is unsigned for now, so SmartScreen will warn on first run. That needs
an OV/EV certificate wired to `bundle.windows.signCommand`; reputation accrues
per certificate, so buy it earlier than you plan to use it.

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
