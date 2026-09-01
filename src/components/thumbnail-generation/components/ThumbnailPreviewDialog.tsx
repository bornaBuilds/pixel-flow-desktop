import { FC } from "react";
import { ThumbnailPreviewDialogProperties } from "../types/thumbnail-preview-dialog.types";

export const ThumbnailPreviewDialog: FC<ThumbnailPreviewDialogProperties> = (
  properties
) => {
  const { dialogReference, close, thumbnail, fileName, setSelectedThumbnail } =
    properties;

  return (
    <dialog
      ref={dialogReference}
      className="rounded-2xl p-0 w-[min(92vw,900px)] backdrop:bg-black/50"
      onClose={() => {
        close();
        setSelectedThumbnail(null);
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
              <a
                href={thumbnail.url}
                download={`${(fileName ?? thumbnail.fileNameStem).replace(
                  /\.[^/.]+$/,
                  ""
                )}-${thumbnail.timestamp}s.jpg`}
                className="px-3 py-1.5 rounded-lg bg-bid-gold text-white font-medium hover:opacity-90"
              >
                Download
              </a>
              <button
                className="px-3 py-1.5 rounded-lg bg-bid-creme hover:opacity-90 text-bid-purple"
                onClick={() => {
                  close();
                  setSelectedThumbnail(null);
                }}
              >
                Close
              </button>
            </div>
          </div>

          <div className="p-4">
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
