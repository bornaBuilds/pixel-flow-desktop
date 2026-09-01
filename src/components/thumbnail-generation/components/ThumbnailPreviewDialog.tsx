import { FC, useState } from "react";
import { ThumbnailPreviewDialogProperties } from "../types/thumbnail-preview-dialog.types";
import { saveBlobAs, revealSaved, fileNameStem } from "@/platform/files";

export const ThumbnailPreviewDialog: FC<ThumbnailPreviewDialogProperties> = (
  properties
) => {
  const { dialogReference, close, thumbnail, fileName, setSelectedThumbnail } =
    properties;

  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const handleSave = async () => {
    if (!thumbnail) return;
    setSaving(true);
    setSaveError(null);
    try {
      // The grid holds blob: URLs, so fetch reads straight from memory.
      const blob = await (await fetch(thumbnail.url)).blob();
      const stem = fileNameStem(fileName ?? thumbnail.fileNameStem);
      const saved = await saveBlobAs(
        blob,
        `${stem}-${thumbnail.timestamp}s.jpg`,
        [{ name: "JPEG image", extensions: ["jpg", "jpeg"] }]
      );
      if (saved) await revealSaved(saved);
    } catch (error) {
      setSaveError(
        error instanceof Error ? error.message : "Could not save the image."
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <dialog
      ref={dialogReference}
      className="rounded-2xl p-0 w-[min(92vw,900px)] backdrop:bg-black/50"
      onClose={() => {
        close();
        setSelectedThumbnail(null);
        setSaveError(null);
      }}
    >
      {thumbnail && (
        <div className="flex flex-col">
          <div className="flex items-center justify-between p-4 border-b border-zinc-200 dark:border-zinc-800">
            <div className="flex items-center gap-2">
              <span className="font-semibold">
                {fileName ?? thumbnail.fileNameStem}
              </span>
              <span className="text-zinc-500">• {thumbnail.timestamp}s</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="px-3 py-1.5 rounded-lg bg-bid-gold text-white font-medium hover:opacity-90 disabled:opacity-60"
              >
                {saving ? "Saving…" : "Save as…"}
              </button>
              <button
                type="button"
                className="px-3 py-1.5 rounded-lg bg-bid-creme hover:opacity-90 text-bid-purple"
                onClick={() => {
                  close();
                  setSelectedThumbnail(null);
                  setSaveError(null);
                }}
              >
                Close
              </button>
            </div>
          </div>

          {saveError && (
            <p className="px-4 pt-3 text-sm text-red-500">{saveError}</p>
          )}

          <div className="p-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={thumbnail.url}
              alt={`Preview at ${thumbnail.timestamp} seconds`}
              className="w-full h-auto rounded-b-2xl object-contain"
              width={thumbnail.width}
              height={thumbnail.height}
            />
          </div>
        </div>
      )}
    </dialog>
  );
};
