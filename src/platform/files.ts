import { save } from "@tauri-apps/plugin-dialog";
import { writeFile } from "@tauri-apps/plugin-fs";
import { revealItemInDir } from "@tauri-apps/plugin-opener";

/**
 * Native "save as" for data that originates in the webview (canvas blobs).
 *
 * `<a download>` is inert inside a Tauri webview — the sandbox blocks
 * navigator-initiated downloads — so every save has to go through a real
 * dialog plus an explicit write.
 *
 * Returns the chosen path, or null if the user cancelled.
 */
export async function saveBlobAs(
  blob: Blob,
  defaultFileName: string,
  filters?: { name: string; extensions: string[] }[]
): Promise<string | null> {
  const path = await save({ defaultPath: defaultFileName, filters });
  if (!path) return null;

  const bytes = new Uint8Array(await blob.arrayBuffer());
  // The dialog plugin adds the picked path to the fs scope, so this write is
  // allowed even though the location is outside the static scope.
  await writeFile(path, bytes);
  return path;
}

/** Open the OS file manager with the item selected. */
export async function revealSaved(path: string): Promise<void> {
  try {
    await revealItemInDir(path);
  } catch {
    // Not fatal - the file is written either way.
  }
}

/** Strip the extension from a filename, keeping any dots in the stem. */
export function fileNameStem(name: string): string {
  return name.replace(/\.[^/.]+$/, "");
}
