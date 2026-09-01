"use client";

import { UploadCloud } from "@/app/icons/UploadCloud";
import clsx from "clsx";
import { useFileDrop } from "@/hooks/use-file-drop";
import { useEffect, useState } from "react";
import { convertImages, type OutputFormat } from "@/platform/convert";
import { downloadAllImagesAsZip } from "@/utils/download-all-images-as-zip";
import { ImagesFormPreview } from "./ImagesFormPreview";
import { UploadArrow } from "@/app/icons/UploadArrow";
import styles from "../styles/images-form.module.css";
import { Error } from "@/app/icons/Error";
import { Loading } from "@/app/icons/Loading";
import { Success } from "@/app/icons/Success";
import { FormatDropdown } from "./FormatDropdown";
import { ConvertedFile } from "../types/images-form";
import {
  HEADER_SUBTITLES,
  HEADER_TITLES,
  STATUS_BUTTON_GRADIENTS,
} from "../constants/images-form";

const HEADER_ICONS = {
  default: <UploadCloud className="max-w-[6em] w-full" />,
  error: <Error className="max-w-[6em] w-full" />,
  pending: <Loading className="max-w-[6em] w-full animate-spin" />,
  success: <Success className="max-w-[6em] w-full" />,
};

export const ImagesForm = () => {
  const {
    fileEnter,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    nonImageFile,
  } = useFileDrop();

  const [convertedFiles, setConvertedFiles] = useState<ConvertedFile[]>([]);
  const [status, setStatus] = useState<string>("default");
  const [infoText, setInfoText] = useState<string | null>(null);
  const [selectedFormat, setSelectedFormat] = useState<string>("webp");

  useEffect(() => {
    if (convertedFiles.length === 0) setStatus("default");
  }, [convertedFiles]);

  const handleFileUpload = async (files: FileList) => {
    setConvertedFiles([]);
    setInfoText(null);

    const newFiles: ConvertedFile[] = Array.from(files).map((file) => ({
      fileName: file.name,
      dataUrl: URL.createObjectURL(file),
      uploading: true,
      format: selectedFormat,
    }));

    const hasNonImageFile = Array.from(files).some(
      (file) => !file.type.startsWith("image/")
    );
    if (hasNonImageFile) {
      setInfoText("Some files are not images and will not be processed.");
      setStatus("error");
      return;
    }

    setConvertedFiles((prevFiles) => [...prevFiles, ...newFiles]);
    setStatus("pending");

    try {
      // Milestone 3 wires this to the Rust command -> Node + sharp sidecar.
      await convertImages(
        Array.from(files).map((file) => file.name),
        { format: selectedFormat as OutputFormat }
      );
      setStatus("success");
    } catch (error) {
      // NB: the `Error` icon component above shadows the global Error type.
      setInfoText(
        error instanceof globalThis.Error ? error.message : "Conversion failed."
      );
      setStatus("error");
      setConvertedFiles((prevFiles) =>
        prevFiles.map((prevFile) => ({ ...prevFile, uploading: false }))
      );
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) handleFileUpload(files);
  };

  const handleDropEvent = (e: React.DragEvent<HTMLDivElement>) => {
    if (nonImageFile) {
      e.preventDefault();
      setInfoText("Some files are not images and will not be processed.");
      return;
    }
    handleDrop(e);
    handleFileUpload(e.dataTransfer.files);
  };

  const handleUploadButtonClick = () => {
    const input = document.getElementById("images");
    input?.click();
  };

  return (
    <div
      onDragOver={(e) => {
        handleDragOver(e);
        if (nonImageFile) setStatus("error");
      }}
      onDragLeave={() => {
        handleDragLeave();
        setStatus("default");
      }}
      onDrop={handleDropEvent}
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
      {HEADER_ICONS[status as keyof typeof HEADER_ICONS]}
      <span className="text-white-text font-gilroy text-[32px]">
        {HEADER_TITLES[status as keyof typeof HEADER_TITLES]}
      </span>
      <span className="text-white-text/60 text-lg">
        {HEADER_SUBTITLES[status as keyof typeof HEADER_SUBTITLES]}
      </span>
      <button
        type="button"
        disabled={status === "pending"}
        onClick={handleUploadButtonClick}
        className={clsx(
          "px-6 py-4 bg-gradient-to-r text-bid-purple rounded-[200px] font-gilroy font-medium text-lg flex justify-between items-center gap-4 transition-all duration-300",
          STATUS_BUTTON_GRADIENTS[
            status as keyof typeof STATUS_BUTTON_GRADIENTS
          ]
        )}
      >
        Upload an Image
        <UploadArrow className="size-[18px]" />
      </button>
      <FormatDropdown
        selectedFormat={selectedFormat}
        onChange={setSelectedFormat}
      />
      <input
        type="file"
        className="sr-only"
        id="images"
        multiple
        accept="image/*"
        name="images"
        disabled={nonImageFile}
        onChange={handleInputChange}
      />
      {infoText && <span className="text-base text-red-500">{infoText}</span>}
      {convertedFiles.length > 0 && (
        <ImagesFormPreview
          images={convertedFiles}
          setConvertedFiles={setConvertedFiles}
        />
      )}
      {convertedFiles.length > 1 &&
        convertedFiles.every((file) => !file.uploading) && (
          <button
            type="button"
            className={clsx(
              "px-6 py-4 bg-gradient-to-r text-bid-purple rounded-[200px] font-gilroy font-medium text-lg flex justify-between items-center gap-4 transition-all duration-300",
              STATUS_BUTTON_GRADIENTS[
                status as keyof typeof STATUS_BUTTON_GRADIENTS
              ]
            )}
            onClick={() =>
              downloadAllImagesAsZip({
                convertedImages: convertedFiles,
                format: selectedFormat,
              })
            }
          >
            Download All ({convertedFiles.length})
            <UploadArrow className="size-[18px] rotate-180" />
          </button>
        )}
    </div>
  );
};
