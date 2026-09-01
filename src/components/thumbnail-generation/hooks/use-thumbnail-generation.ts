"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Thumbnail } from "../types/thumbnail-generation.types";
import {
  useThumbnailGenerationProperties,
  useThumbnailGenerationReturn,
} from "../types/use-thumbnail-generation.types";
import {
  ALL_FORMATS,
  BlobSource,
  CanvasSink,
  Input,
  UrlSource,
} from "mediabunny";
import { canvasToBlob } from "../utils/canvas-to-blob";

const THUMBNAIL_COUNT = 16;
const THUMBNAIL_SIZE = 200;

export function useThumbnailGeneration(
  properties?: useThumbnailGenerationProperties
): useThumbnailGenerationReturn {
  const { thumbnailCount = THUMBNAIL_COUNT, thumbnailSize = THUMBNAIL_SIZE } =
    properties || {
      thumbnailCount: THUMBNAIL_COUNT,
      thumbnailSize: THUMBNAIL_SIZE,
    };

  const [loading, setLoading] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [thumbnails, setThumbnails] = useState<Thumbnail[]>([]);
  const [selectedThumbnail, setSelectedThumbnail] = useState<Thumbnail | null>(
    null
  );

  // Revoke all object URLs when component unmounts or thumbnails change
  useEffect(() => {
    return () => {
      thumbnails.forEach((thumbnail) => URL.revokeObjectURL(thumbnail.url));
    };
  }, [thumbnails]);

  const generateThumbnails = useCallback(async (resource: File | string) => {
    setLoading(true);
    setError(null);
    setThumbnails([]);
    setSelectedThumbnail(null);

    const fileName = resource instanceof File ? resource.name : resource;
    setFileName(fileName);

    try {
      const source =
        resource instanceof File
          ? new BlobSource(resource)
          : new UrlSource(resource);

      const input = new Input({
        source,
        formats: ALL_FORMATS,
      });

      const videoTrack = await input.getPrimaryVideoTrack();
      if (!videoTrack) {
        throw new Error("File has no video track");
      }

      if (videoTrack.codec === null) {
        throw new Error("Unsupported video codec");
      }

      if (!(await videoTrack.canDecode())) {
        throw new Error("Unable to decode the video track.");
      }

      // Compute width and height of the thumbnails such that the larger dimension is equal to THUMBNAIL_SIZE
      const width =
        videoTrack.displayWidth > videoTrack.displayHeight
          ? thumbnailSize
          : Math.floor(
              (thumbnailSize * videoTrack.displayWidth) /
                videoTrack.displayHeight
            );
      const height =
        videoTrack.displayHeight > videoTrack.displayWidth
          ? thumbnailSize
          : Math.floor(
              (thumbnailSize * videoTrack.displayHeight) /
                videoTrack.displayWidth
            );

      // Prepare the timestamps for the thumbnails, equally spaced between the first and last timestamp of the video
      const firstTimestamp = await videoTrack.getFirstTimestamp();
      const lastTimestamp = await videoTrack.computeDuration();
      const timestamps = Array.from(
        { length: thumbnailCount },
        (_, index) =>
          firstTimestamp +
          (index * (lastTimestamp - firstTimestamp)) / thumbnailCount
      );

      // Create CanvasSink for extracting resized frames from the video track
      const sink = new CanvasSink(videoTrack, {
        width: Math.floor(width + window.devicePixelRatio),
        height: Math.floor(height + window.devicePixelRatio),
        fit: "fill",
      });

      // batch up thumbnails to avoid rerender-per-frame
      const next: Thumbnail[] = [];
      const fileNameStem =
        typeof resource === "string"
          ? resource.split("/").pop() || "thumbnail"
          : resource.name || "thumbnail";

      for await (const wrappedCanvas of sink.canvasesAtTimestamps(timestamps)) {
        if (!wrappedCanvas) continue;

        const canvas = wrappedCanvas.canvas as
          | HTMLCanvasElement
          | OffscreenCanvas;
        const blob = await canvasToBlob(canvas);
        const url = URL.createObjectURL(blob);

        next.push({
          url,
          timestamp: wrappedCanvas.timestamp.toFixed(2),
          width,
          height,
          fileNameStem,
        });
      }

      setThumbnails(next);
      setLoading(false);
    } catch (error) {
      console.error("Error generating thumbnails:", error);
      setError(String(error));
      setLoading(false);
      return;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const niceName = useMemo(() => {
    if (!fileName) return null;
    try {
      return fileName.split("?")[0].split("/").pop() || fileName;
    } catch {
      return fileName;
    }
  }, [fileName]);

  return {
    fileName: niceName,
    error,
    thumbnails,
    selectedThumbnail,
    setSelectedThumbnail,
    generateThumbnails,
    loading,
  };
}
