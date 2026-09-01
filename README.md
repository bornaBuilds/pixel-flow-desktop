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
