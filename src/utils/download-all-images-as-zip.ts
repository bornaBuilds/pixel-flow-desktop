import JSZip from "jszip";
import { saveAs } from "file-saver";

type DownloadAllImagesAsZipProperties = {
  convertedImages: {
    fileName: string;
    dataUrl: string;
    uploading: boolean;
    format?: string;
  }[];
  format?: string;
};

export const downloadAllImagesAsZip = (
  properties: DownloadAllImagesAsZipProperties
) => {
  const { convertedImages, format } = properties;

  const zip = new JSZip();

  convertedImages.forEach(({ fileName, dataUrl, format: imgFormat }) => {
    const fileNameWithoutExtension = fileName.substring(
      0,
      fileName.lastIndexOf(".")
    );
    const chosenFormat = imgFormat || format || "webp";
    const extension = chosenFormat === "jpeg" ? "jpg" : chosenFormat;
    const resizedFileName = `${fileNameWithoutExtension}(resized).${extension}`;

    // Extract the base64 data from the data URL
    const base64Regex = new RegExp(
      `^data:image/${chosenFormat === "jpeg" ? "jpeg|jpg" : extension};base64,`
    );
    const base64Data = dataUrl.replace(base64Regex, "");

    // Add the file to the ZIP using base64 data
    zip.file(resizedFileName, base64Data, { base64: true });
  });

  // Set zip file extension
  const zipExtension = format ? (format === "jpeg" ? "jpg" : format) : "webp";
  zip.generateAsync({ type: "blob" }).then((content) => {
    saveAs(content, `converted_images_${zipExtension}.zip`);
  });
};
