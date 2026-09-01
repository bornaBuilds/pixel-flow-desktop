import { Thumbnail } from "./thumbnail-generation.types";

export type useThumbnailGenerationProperties = {
  thumbnailCount?: number;
  thumbnailSize?: number;
};

export type useThumbnailGenerationReturn = {
  fileName: string | null;
  error: string | null;
  thumbnails: Thumbnail[];
  selectedThumbnail: Thumbnail | null;
  loading: boolean;
  setSelectedThumbnail: (thumbnail: Thumbnail | null) => void;
  generateThumbnails: (resource: File | string) => Promise<void>;
};
