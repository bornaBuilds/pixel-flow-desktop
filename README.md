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

```bash
pnpm desktop:build
```

Always smoke-test the **bundled** app, not just `tauri dev` — resource paths
resolve differently and dev will pass while the bundle fails.

## Status

| Milestone | State |
|---|---|
| 1 — window opens, static export, thumbnails work | ✅ done |
| 2 — Node + sharp sidecar spawns from a bundle | ⬜ next |
| 3 — converter end-to-end, native pick/drop/save | not started |
| 4 — CI matrix, all four targets | not started |
| 5 — signing, notarization, updater | not started |

The image converter is intentionally stubbed until Milestone 3; see
`src/platform/convert.ts`.
