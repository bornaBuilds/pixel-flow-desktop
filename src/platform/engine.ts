import { invoke } from "@tauri-apps/api/core";

export interface EngineStatus {
  ready: { op: string; sharp: string; vips: string } | null;
  roundTrip: { ok: boolean; sharp: string; vips: string };
}

/**
 * Asks the Rust side to round-trip a frame through the Node + sharp sidecar.
 *
 * This is the check that matters for a packaged build: sharp resolving its
 * native module and libvips loading only really proves out in the bundle,
 * because dev resolves resource paths from a different directory.
 */
export async function engineStatus(): Promise<EngineStatus> {
  // invoke() reads window.__TAURI_INTERNALS__ and can throw synchronously
  // outside a Tauri webview; keep that a rejected promise, not a render crash.
  try {
    return await invoke<EngineStatus>("engine_status");
  } catch (error) {
    throw error instanceof Error ? error : new Error(String(error));
  }
}
