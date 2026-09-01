import { invoke, Channel, convertFileSrc } from "@tauri-apps/api/core";

export type OutputFormat = "webp" | "jpeg" | "png" | "avif";

export interface ConvertOptions {
  format: OutputFormat;
  /** 1..100. Undefined => engine default (webp/jpeg 80, avif 50). */
  quality?: number;
  /** Undefined => keep original size. Bounds only ever shrink, never crop. */
  maxWidth?: number;
  maxHeight?: number;
}

export type ConvertEvent =
  | {
      event: "started";
      data: { batchId: string; total: number; outputDir: string };
    }
  | { event: "fileStart"; data: { index: number; fileName: string } }
  | {
      event: "fileDone";
      data: {
        index: number;
        fileName: string;
        outputPath: string;
        bytesIn: number;
        bytesOut: number;
        width: number;
        height: number;
      };
    }
  | {
      event: "fileError";
      data: { index: number; fileName: string; message: string };
    }
  | {
      event: "finished";
      data: { batchId: string; succeeded: number; failed: number };
    };

export interface BatchHandle {
  batchId: string;
  outputDir: string;
}

/**
 * Convert a batch of images through the Rust command and its sharp sidecar.
 *
 * Results stream back per file over a Channel rather than a global event, so a
 * second batch cannot cross-talk into the first batch's handler. Progress is
 * keyed by index, not filename: two files with the same basename are ordinary
 * (different folders), and the web version silently overwrote one with the
 * other.
 *
 * No image bytes cross IPC — outputs land in the app cache and come back as
 * paths.
 */
export async function convertImages(
  paths: string[],
  options: ConvertOptions,
  onEvent: (event: ConvertEvent) => void
): Promise<BatchHandle> {
  if (paths.length === 0) {
    throw new RangeError("No images to convert.");
  }
  if (
    options.quality !== undefined &&
    (options.quality < 1 || options.quality > 100)
  ) {
    throw new RangeError(`quality must be 1..100, got ${options.quality}`);
  }

  const channel = new Channel<ConvertEvent>();
  channel.onmessage = onEvent;

  return invoke<BatchHandle>("convert_images", {
    paths,
    options,
    onEvent: channel,
  });
}

/** Turn an on-disk path into something the webview can render. */
export function previewSrc(path: string): string {
  return convertFileSrc(path);
}
