/**
 * Tauri boundary for image conversion.
 *
 * Milestone 1: stub. The web app POSTed each file to /api/upload, which cannot
 * exist under `output: 'export'`. Milestone 3 replaces the body of this module
 * with an `invoke("convert_images")` call into the Rust command that proxies to
 * the Node + sharp sidecar. The signature here is the contract both sides
 * implement, so nothing above this file changes again.
 */

export type OutputFormat = "webp" | "jpeg" | "png" | "avif";

export interface ConvertOptions {
  format: OutputFormat;
  /** 1..100. Undefined => engine default (webp/jpeg 80, avif 50). */
  quality?: number;
  /** Undefined => keep original dimensions. Never upscales, never crops. */
  maxWidth?: number;
  maxHeight?: number;
}

export interface ConvertedImage {
  /** Index into the batch. Correlating by filename collides on duplicate basenames. */
  index: number;
  fileName: string;
  /** Absolute path on disk; render with convertFileSrc(). */
  outputPath: string;
  bytesIn: number;
  bytesOut: number;
  width: number;
  height: number;
}

export class ConversionUnavailableError extends Error {
  constructor() {
    super("Image conversion is not wired up yet (Milestone 3).");
    this.name = "ConversionUnavailableError";
  }
}

export async function convertImages(
  paths: string[],
  options: ConvertOptions
): Promise<ConvertedImage[]> {
  // Validated here so Milestone 3 inherits the guard rather than adding it later.
  if (paths.length === 0) return [];
  if (options.quality !== undefined && (options.quality < 1 || options.quality > 100)) {
    throw new RangeError(`quality must be 1..100, got ${options.quality}`);
  }
  throw new ConversionUnavailableError();
}
