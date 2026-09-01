"use client";

import { UploadCloud } from "@/app/icons/UploadCloud";
import clsx from "clsx";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ImagesFormPreview } from "./ImagesFormPreview";
import { UploadArrow } from "@/app/icons/UploadArrow";
import styles from "../styles/images-form.module.css";
import { Error } from "@/app/icons/Error";
import { Loading } from "@/app/icons/Loading";
import { Success } from "@/app/icons/Success";
import { FormatDropdown } from "./FormatDropdown";
import { EngineBadge } from "./EngineBadge";
import { QualityControls, QualitySettings } from "./QualityControls";
import { ConvertItem } from "../types/images-form";
import {
  HEADER_SUBTITLES,
  HEADER_TITLES,
  STATUS_BUTTON_GRADIENTS,
} from "../constants/images-form";
import {
  convertImages,
  type ConvertEvent,
  type OutputFormat,
} from "@/platform/convert";
import {
  pickImages,
  saveAllConvertedTo,
  revealSaved,
  baseName,
} from "@/platform/files";
import { useTauriFileDrop } from "@/platform/drag-drop";

const HEADER_ICONS = {
  default: <UploadCloud className="max-w-[6em] w-full" />,
  error: <Error className="max-w-[6em] w-full" />,
  pending: <Loading className="max-w-[6em] w-full animate-spin" />,
  success: <Success className="max-w-[6em] w-full" />,
};

type Status = "default" | "error" | "pending" | "success";

export const ImagesForm = () => {
  const dropZone = useRef<HTMLDivElement>(null);

  const [items, setItems] = useState<ConvertItem[]>([]);
  const [status, setStatus] = useState<Status>("default");
  const [infoText, setInfoText] = useState<string | null>(null);
  const [selectedFormat, setSelectedFormat] = useState<OutputFormat>("webp");
  const [settings, setSettings] = useState<QualitySettings>({ quality: 80 });

  // Guards against a second batch's events landing in the first batch's state.
  const activeBatch = useRef(0);

  useEffect(() => {
    if (items.length === 0) setStatus("default");
  }, [items]);

  const patch = (index: number, changes: Partial<ConvertItem>) =>
    setItems((previous) =>
      previous.map((item) =>
        item.index === index ? { ...item, ...changes } : item
      )
    );

  const runConversion = useCallback(
    async (paths: string[]) => {
      if (paths.length === 0) return;

      const batch = activeBatch.current + 1;
      activeBatch.current = batch;

      setInfoText(null);
      setItems(
        paths.map((sourcePath, index) => ({
          id: `${batch}:${index}`,
          index,
          sourcePath,
          fileName: baseName(sourcePath),
          status: "queued" as const,
        }))
      );
      setStatus("pending");

      const handle = (event: ConvertEvent) => {
        if (activeBatch.current !== batch) return;
        switch (event.event) {
          case "fileStart":
            patch(event.data.index, { status: "converting" });
            break;
          case "fileDone":
            patch(event.data.index, {
              status: "done",
              outputPath: event.data.outputPath,
              bytesIn: event.data.bytesIn,
              bytesOut: event.data.bytesOut,
              width: event.data.width,
              height: event.data.height,
            });
            break;
          case "fileError":
            patch(event.data.index, {
              status: "error",
              message: event.data.message,
            });
            break;
          case "finished":
            // Unlike the web version, a partial failure is reported as such
            // instead of flipping to "success" with files stuck spinning.
            setStatus(event.data.failed > 0 ? "error" : "success");
            if (event.data.failed > 0) {
              setInfoText(
                `${event.data.failed} of ${
                  event.data.failed + event.data.succeeded
                } images could not be converted.`
              );
            }
            break;
          default:
            break;
        }
      };

      try {
        await convertImages(
          paths,
          {
            format: selectedFormat,
            quality: settings.quality,
            maxWidth: settings.maxWidth,
            maxHeight: settings.maxHeight,
          },
          handle
        );
      } catch (error) {
        if (activeBatch.current !== batch) return;
        setStatus("error");
        setInfoText(
          error instanceof globalThis.Error
            ? error.message
            : "Conversion failed."
        );
        setItems((previous) =>
          previous.map((item) =>
            item.status === "done" ? item : { ...item, status: "error" }
          )
        );
      }
    },
    [selectedFormat, settings]
  );

  const { fileEnter, nonImageFile } = useTauriFileDrop(dropZone, runConversion);

  useEffect(() => {
    if (nonImageFile) {
      setInfoText("Some files were not images and were skipped.");
    }
  }, [nonImageFile]);

  const handlePick = async () => {
    try {
      const paths = await pickImages();
      await runConversion(paths);
    } catch (error) {
      setStatus("error");
      setInfoText(
        error instanceof globalThis.Error
          ? error.message
          : "Could not open the file picker."
      );
    }
  };

  const converted = useMemo(
    () => items.filter((item) => item.status === "done" && item.outputPath),
    [items]
  );

  const handleSaveAll = async () => {
    try {
      const result = await saveAllConvertedTo(
        converted.map((item) => item.outputPath!)
      );
      if (!result) return;
      if (result.failed.length > 0) {
        setInfoText(`Saved ${result.saved}, failed ${result.failed.length}.`);
      } else {
        await revealSaved(result.directory);
      }
    } catch (error) {
      setInfoText(
        error instanceof globalThis.Error
          ? error.message
          : "Could not save the images."
      );
    }
  };

  const busy = status === "pending";

  return (
    <div
      ref={dropZone}
      className={clsx(
        "flex flex-col justify-center items-center gap-4 select-none backdrop-blur-xl z-20",
        "px-8 py-12 max-w-[560px] w-full",
        "rounded-[32px] dashed-border",
        "transition-all duration-300",
        "relative",
        styles[`images-form-background-${status}`],
        fileEnter && styles["glow-shadow"],
        nonImageFile && styles["glow-shadow-error"]
      )}
    >
      {HEADER_ICONS[status]}
      <span className="text-white-text font-gilroy text-[32px]">
        {HEADER_TITLES[status]}
      </span>
      <span className="text-white-text/60 text-lg">
        {HEADER_SUBTITLES[status]}
      </span>
      <button
        type="button"
        disabled={busy}
        onClick={handlePick}
        className={clsx(
          "px-6 py-4 bg-gradient-to-r text-bid-purple rounded-[200px] font-gilroy font-medium text-lg flex justify-between items-center gap-4 transition-all duration-300",
          STATUS_BUTTON_GRADIENTS[status]
        )}
      >
        Choose Images
        <UploadArrow className="size-[18px]" />
      </button>

      <FormatDropdown
        selectedFormat={selectedFormat}
        onChange={(format) => setSelectedFormat(format as OutputFormat)}
      />

      <QualityControls
        value={settings}
        onChange={setSettings}
        disabled={busy}
      />

      {infoText && <span className="text-base text-red-500">{infoText}</span>}
      <EngineBadge />

      {items.length > 0 && (
        <ImagesFormPreview items={items} setItems={setItems} />
      )}

      {converted.length > 1 && !busy && (
        <button
          type="button"
          className={clsx(
            "px-6 py-4 bg-gradient-to-r text-bid-purple rounded-[200px] font-gilroy font-medium text-lg flex justify-between items-center gap-4 transition-all duration-300",
            STATUS_BUTTON_GRADIENTS[status]
          )}
          onClick={handleSaveAll}
        >
          Save All ({converted.length})
          <UploadArrow className="size-[18px] rotate-180" />
        </button>
      )}
    </div>
  );
};
