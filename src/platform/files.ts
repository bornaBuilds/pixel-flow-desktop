import { invoke } from "@tauri-apps/api/core";
import { open, save } from "@tauri-apps/plugin-dialog";
import { writeFile } from "@tauri-apps/plugin-fs";
import { revealItemInDir } from "@tauri-apps/plugin-opener";

export const IMAGE_EXTENSIONS = [
  "png", "jpg", "jpeg", "webp", "avif", "gif", "tif", "tiff", "bmp", "svg",
];

/**
 * Native picker. A Tauri webview hands `<input type=file>` a File with no
 * path, and the whole point here is to pass paths to Rust, so the hidden input
 * is gone.
 */
export async function pickImages(): Promise<string[]> {
  const picked = await open({
    multiple: true,
    directory: false,
    filters: [{ name: "Images", extensions: IMAGE_EXTENSIONS }],
  });
  if (!picked) return [];
  return Array.isArray(picked) ? picked : [picked];
}

export async function pickFolder(): Promise<string | null> {
  const picked = await open({ directory: true, multiple: false });
  return typeof picked === "string" ? picked : null;
}

/** Copy one converted file out of the app cache to a user-chosen path. */
export async function saveConvertedAs(
  sourcePath: string,
  defaultFileName: string
): Promise<string | null> {
  const extension = defaultFileName.split(".").pop() ?? "";
  const destination = await save({
    defaultPath: defaultFileName,
    filters: extension
      ? [{ name: extension.toUpperCase(), extensions: [extension] }]
      : undefined,
  });
  if (!destination) return null;
  return invoke<string>("save_converted", {
    source: sourcePath,
    destination,
  });
}

export interface SaveAllResult {
  saved: number;
  failed: string[];
  directory: string;
}

/** Copy a whole batch into a folder the user picks. */
export async function saveAllConvertedTo(
  sourcePaths: string[]
): Promise<SaveAllResult | null> {
  const directory = await pickFolder();
  if (!directory) return null;
  return invoke<SaveAllResult>("save_all_converted", {
    sources: sourcePaths,
    directory,
  });
}

/**
 * Save data that originates in the webview (canvas blobs). `<a download>` is
 * inert inside a Tauri webview, so every save goes through a real dialog.
 */
export async function saveBlobAs(
  blob: Blob,
  defaultFileName: string,
  filters?: { name: string; extensions: string[] }[]
): Promise<string | null> {
  const path = await save({ defaultPath: defaultFileName, filters });
  if (!path) return null;
  await writeFile(path, new Uint8Array(await blob.arrayBuffer()));
  return path;
}

export async function revealSaved(path: string): Promise<void> {
  try {
    await revealItemInDir(path);
  } catch {
    // Not fatal - the file is written either way.
  }
}

export function fileNameStem(name: string): string {
  return name.replace(/\.[^/.]+$/, "");
}

export function baseName(path: string): string {
  return path.split(/[/\\]/).pop() ?? path;
}
