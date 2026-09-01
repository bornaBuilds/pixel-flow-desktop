import os from "node:os";
import { stat } from "node:fs/promises";
import sharp from "sharp";

// libvips keeps its own worker pool. Leave a core for the UI process.
sharp.concurrency(Math.max(1, Math.min(4, os.cpus().length - 1)));

/** sharp's own defaults, so output matches the web app when no quality is given. */
const DEFAULT_QUALITY = { webp: 80, jpeg: 80, avif: 50, png: 100 };

const EXTENSION = { webp: "webp", jpeg: "jpg", png: "png", avif: "avif" };

export function extensionFor(format) {
  return EXTENSION[format] ?? "webp";
}

export async function convert({
  input,
  output,
  format = "webp",
  quality,
  maxWidth,
  maxHeight,
}) {
  const q = quality ?? DEFAULT_QUALITY[format] ?? 80;
  const { size: bytesIn } = await stat(input);

  let pipeline = sharp(input, {
    // A slightly corrupt file should fail that file, not the whole batch.
    failOn: "none",
    limitInputPixels: 268402689,
    // Keeps multi-frame GIF/WebP animated; the web app silently flattened them.
    animated: true,
  }).rotate(); // applies EXIF orientation, which the web app dropped

  // The web app hardcoded .resize(3840, 2160, { fit: "cover" }), which cropped
  // to 16:9 and upscaled small images. Default is now "leave it alone", and any
  // bound only ever shrinks.
  if (maxWidth || maxHeight) {
    pipeline = pipeline.resize(maxWidth ?? null, maxHeight ?? null, {
      fit: "inside",
      withoutEnlargement: true,
    });
  }

  switch (format) {
    case "jpeg":
      pipeline = pipeline.jpeg({ quality: q, mozjpeg: true });
      break;
    case "png":
      pipeline = pipeline.png({ compressionLevel: 9 });
      break;
    case "avif":
      pipeline = pipeline.avif({ quality: q, effort: 4 });
      break;
    case "webp":
      pipeline = pipeline.webp({ quality: q });
      break;
    default:
      throw new Error(`Unsupported format: ${format}`);
  }

  const info = await pipeline.toFile(output);
  return {
    output,
    bytesIn,
    bytesOut: info.size,
    width: info.width,
    height: info.height,
  };
}

export function versions() {
  return { sharp: sharp.versions.sharp, vips: sharp.versions.vips };
}
