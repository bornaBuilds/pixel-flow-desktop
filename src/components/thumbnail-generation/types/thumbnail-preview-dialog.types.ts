import { RefObject } from "react";
import { Thumbnail } from "./thumbnail-generation.types";

export type ThumbnailPreviewDialogProperties = {
  dialogReference: RefObject<HTMLDialogElement>;
  close: () => void;
  thumbnail: Thumbnail | null;
  fileName: string | null;
  setSelectedThumbnail: (thumbnail: Thumbnail | null) => void;
};
