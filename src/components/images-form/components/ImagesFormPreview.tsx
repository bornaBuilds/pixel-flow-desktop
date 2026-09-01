"use client";

import { useState } from "react";
import { ImagesFormPreviewProperties } from "../types/images-form-preview";
import { DownloadCircle } from "@/app/icons/DownloadCircle";
import { Close } from "@/app/icons/Close";
import { previewSrc } from "@/platform/convert";
import { saveConvertedAs, revealSaved } from "@/platform/files";
import "../styles/images-form-preview.css";

const formatBytes = (n: number) =>
  n >= 1024 * 1024
    ? `${(n / 1024 / 1024).toFixed(1)} MB`
    : `${Math.max(1, Math.round(n / 1024))} KB`;

/** Converting to a less efficient format legitimately grows the file (AVIF ->
 *  WebP, say). Say so rather than clamping it to a misleading "0% smaller". */
const sizeDelta = (bytesIn: number, bytesOut: number) => {
  if (!bytesIn) return null;
  const percent = Math.round((1 - bytesOut / bytesIn) * 100);
  if (percent === 0) return "about the same size";
  return percent > 0 ? `${percent}% smaller` : `${-percent}% larger`;
};

export const ImagesFormPreview = (properties: ImagesFormPreviewProperties) => {
  const { items, setItems } = properties;
  const [saveError, setSaveError] = useState<string | null>(null);

  const handleRemove = (id: string) =>
    setItems((previous) => previous.filter((item) => item.id !== id));

  const handleSave = async (
    outputPath: string,
    fileName: string
  ): Promise<void> => {
    setSaveError(null);
    try {
      const saved = await saveConvertedAs(outputPath, fileName);
      if (saved) await revealSaved(saved);
    } catch (error) {
      setSaveError(
        error instanceof globalThis.Error
          ? error.message
          : "Could not save the image."
      );
    }
  };

  return (
    <div className="w-full">
      {saveError && (
        <p className="text-sm text-red-400 pb-2">{saveError}</p>
      )}
      <div className="flex gap-6 items-center justify-start overflow-x-auto w-full pb-6 pt-6 custom-scrollbar">
        {items.map((item) => {
          // The converted file has the chosen format's extension, not the
          // source's - the web version hardcoded ".webp" here regardless.
          const savedName = item.outputPath
            ? item.outputPath.split(/[/\\]/).pop() ?? item.fileName
            : item.fileName;

          const busy = item.status === "queued" || item.status === "converting";
          const src = item.outputPath
            ? previewSrc(item.outputPath)
            : previewSrc(item.sourcePath);

          return (
            <div
              key={item.id}
              className="aspect-square basis-[calc(33.33%-24px)] flex-grow-0 flex-shrink-0 relative group"
            >
              <div className="relative w-full h-full rounded-lg overflow-hidden bg-white/5">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={src}
                  alt={savedName}
                  className="absolute inset-0 w-full h-full object-cover object-center"
                />

                {busy && (
                  <div className="absolute inset-0 flex items-center justify-center bg-bid-purple/70">
                    <span className="w-20 aspect-square rounded-full border-2 border-bid-gold border-t-0 animate-spin" />
                  </div>
                )}

                {item.status === "error" && (
                  <div className="absolute inset-0 flex items-center justify-center bg-bid-purple/85 p-3">
                    <span className="text-xs text-red-400 text-center line-clamp-4">
                      {item.message ?? "Conversion failed"}
                    </span>
                  </div>
                )}

                {item.status === "done" && item.outputPath && (
                  <button
                    type="button"
                    onClick={() => handleSave(item.outputPath!, savedName)}
                    className="absolute inset-0 w-full h-full flex flex-col gap-2 items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-b from-bid-purple/0 to-bid-purple/80"
                  >
                    <span className="sr-only">Save {savedName}</span>
                    <DownloadCircle className="size-[66px]" />
                    {item.bytesIn && item.bytesOut ? (
                      <span className="text-xs text-white-text/90">
                        {formatBytes(item.bytesIn)} →{" "}
                        {formatBytes(item.bytesOut)}
                        {(() => {
                          const delta = sizeDelta(item.bytesIn, item.bytesOut);
                          return delta ? ` (${delta})` : null;
                        })()}
                      </span>
                    ) : null}
                  </button>
                )}
              </div>

              <button
                type="button"
                onClick={() => handleRemove(item.id)}
                className="absolute right-0 top-0 z-50 group-hover:-right-3 group-hover:-top-3 size-0 duration-500 group-hover:size-6 bg-[#FF7373] transition-all rounded-full group-hover:border-4 border-bid-purple flex justify-center items-center"
              >
                <Close className="size-3" />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
