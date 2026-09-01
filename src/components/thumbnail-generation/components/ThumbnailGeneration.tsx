"use client";
import { useDialogController } from "@/hooks/use-dialog-controller";
import { ThumbnailPreviewDialog } from "./ThumbnailPreviewDialog";
import { useThumbnailGeneration } from "../hooks/use-thumbnail-generation";
import { GeneratedThumbnailsList } from "./GeneratedThumbnailsList";
import { ThumbnailsListSkeleton } from "./ThumbnailsListSkeleton";

export const ThumbnailGeneration = () => {
  const {
    error,
    fileName,
    generateThumbnails,
    selectedThumbnail,
    setSelectedThumbnail,
    thumbnails,
    loading,
  } = useThumbnailGeneration();

  const {
    dialogReference,
    controls: { closeDialog, openDialog },
  } = useDialogController();

  function onUrlButtonClick() {
    const url = prompt(
      "Please enter a URL of a media file. Note that it must be HTTPS and support cross-origin requests, so have the" +
        " right CORS headers set.",
      "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"
    );

    if (!url) {
      return;
    }

    void generateThumbnails(url);
  }

  return (
    <div className="flex flex-col gap-8 max-w-4xl">
      <div className="flex justify-center items-center gap-5 flex-wrap">
        <label className="px-6 py-4 bg-bid-gold text-white font-gilroy cursor-pointer">
          <span>Select local file</span>
          <input
            type="file"
            className="hidden"
            accept="video/*,video/x-matroska,audio/*,audio/aac"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (!file) {
                return;
              }
              void generateThumbnails(file);
            }}
          />
        </label>
        <button
          type="button"
          className="px-6 py-4 bg-bid-creme text-bid-purple font-gilroy"
          onClick={onUrlButtonClick}
        >
          Load remote url
        </button>
      </div>

      {loading ? <ThumbnailsListSkeleton /> : null}

      {thumbnails.length > 0 && !error ? (
        <GeneratedThumbnailsList
          fileName={fileName}
          thumbnails={thumbnails}
          setSelectedThumbnail={setSelectedThumbnail}
          openPreviewDialog={() => openDialog()}
        />
      ) : null}

      {error ? (
        <p className="text-red-500 text-2xl font-gilroy font-semibold">
          {error}
        </p>
      ) : null}

      <ThumbnailPreviewDialog
        dialogReference={dialogReference}
        close={() => closeDialog()}
        thumbnail={selectedThumbnail}
        fileName={fileName}
        setSelectedThumbnail={setSelectedThumbnail}
      />
    </div>
  );
};
