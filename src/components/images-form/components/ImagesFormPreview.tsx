import Image from "next/image";
import { ImagesFormPreviewProperties } from "../types/images-form-preview";
import { DownloadCircle } from "@/app/icons/DownloadCircle";
import { Close } from "@/app/icons/Close";
import "../styles/images-form-preview.css";

export const ImagesFormPreview = (properties: ImagesFormPreviewProperties) => {
  const { images: convertedFiles, setConvertedFiles } = properties;

  const handleRemoveFile = (fileName: string) => {
    setConvertedFiles((prevFiles) =>
      prevFiles.filter((file) => file.fileName !== fileName)
    );
  };

  return (
    <div className="flex gap-6 items-center justify-start overflow-x-auto w-full pb-6 pt-6 custom-scrollbar">
      {convertedFiles.map(({ fileName, dataUrl, uploading }) => {
        const fileNameWithoutExtension = fileName.substring(
          0,
          fileName.lastIndexOf(".")
        );
        const resizedFileName = `${fileNameWithoutExtension}(resized).webp`;

        return (
          <div
            key={fileName}
            className="aspect-square basis-[calc(33.33%-24px)] flex-grow-0 flex-shrink-0 relative group"
          >
            <div className="relative w-full h-full rounded-lg overflow-hidden">
              {uploading ? (
                <>
                  <Image
                    src={dataUrl}
                    alt={fileName}
                    fill
                    className="object-cover object-center z-[-1]"
                  />
                  <div className="flex items-center justify-center w-full h-full bg-bid-purple/70">
                    <span className="w-20 aspect-square rounded-full border-2 border-bid-gold border-t-0 animate-spin" />
                  </div>
                </>
              ) : (
                <>
                  <Image
                    src={dataUrl}
                    alt={resizedFileName}
                    fill
                    className="object-cover object-center z-[-1]"
                  />
                  <a
                    href={dataUrl}
                    download={resizedFileName}
                    className="w-full h-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-b from-bid-purple/0 to-bid-purple/80"
                  >
                    <span className="sr-only">Download {resizedFileName}</span>
                    <DownloadCircle className="size-[66px]" />
                  </a>
                </>
              )}
            </div>
            <button
              type="button"
              onClick={() => handleRemoveFile(fileName)}
              className="absolute right-0 top-0 z-50 group-hover:-right-3 group-hover:-top-3 size-0 duration-500 group-hover:size-6 bg-[#FF7373] transition-all duration-300 rounded-full group-hover:border-4 border-bid-purple flex justify-center items-center"
            >
              <Close className="size-3" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
