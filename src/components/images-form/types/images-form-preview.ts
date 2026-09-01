import { Dispatch, SetStateAction } from "react";
import { ConvertItem } from "./images-form";

export type ImagesFormPreviewProperties = {
  items: ConvertItem[];
  setItems: Dispatch<SetStateAction<ConvertItem[]>>;
};
