import { Thumbnail } from "./thumbnail-generation.types";

export type GeneratedThumbnailsListProperties = {
  fileName: string | null;
  thumbnails: Thumbnail[];
  setSelectedThumbnail: (thumbnail: Thumbnail | null) => void;
  openPreviewDialog: () => void;
};
