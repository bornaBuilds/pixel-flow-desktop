import { Dispatch, SetStateAction } from "react";

export type ImagesFormPreviewProperties = {
  images: {
    fileName: string;
    dataUrl: string;
    uploading: boolean;
  }[];
  setConvertedFiles: Dispatch<
    SetStateAction<
      {
        fileName: string;
        dataUrl: string;
        uploading: boolean;
      }[]
    >
  >;
};
