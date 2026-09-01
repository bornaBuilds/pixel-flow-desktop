/* eslint-disable @next/next/no-img-element */
import { FC } from "react";
import { GeneratedThumbnailsListProperties } from "../types/generated-thumbnails-list.types";

export const GeneratedThumbnailsList: FC<GeneratedThumbnailsListProperties> = (
  properties
) => {
  const { fileName, thumbnails, setSelectedThumbnail, openPreviewDialog } =
    properties;

  return (
    <>
      <h3 className="text-center">{fileName}</h3>
      <hr className="w-full h-px border-t border-t-white/30" />

      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
        {thumbnails.map((thumbnail, index) => {
          const label = `${thumbnail.timestamp}s`;
          return (
            <button
              type="button"
              key={`${label}-${index}`}
              className="group relative rounded-lg overflow-hidden bg-zinc-100 aspect-video"
              onClick={() => {
                setSelectedThumbnail(thumbnail);
                openPreviewDialog();
              }}
              title={`Open ${label}`}
            >
              <img
                src={thumbnail.url}
                alt={`Thumbnail at ${label}`}
                className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-[1.02]"
                width={thumbnail.width}
                height={thumbnail.height}
                loading="lazy"
              />
              <span className="absolute bottom-1 right-1 text-white text-xs font-semibold bg-black/50 px-1 py-0.5 rounded">
                {label}
              </span>
            </button>
          );
        })}
      </div>
    </>
  );
};
