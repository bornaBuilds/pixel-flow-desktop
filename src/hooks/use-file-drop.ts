import { useState, useCallback } from "react";

export const useFileDrop = () => {
  const [file, setFile] = useState<string>();
  const [fileEnter, setFileEnter] = useState(false);
  const [nonImageFile, setNonImageFile] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setFileEnter(true);

    const items = Array.from(e.dataTransfer.items);
    const hasNonImageFile = items.some(
      (item) => item.kind === "file" && !item.type.startsWith("image/")
    );
    setNonImageFile(hasNonImageFile);
  }, []);

  const handleDragLeave = useCallback(() => {
    setFileEnter(false);
    setNonImageFile(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setFileEnter(false);
    setNonImageFile(false);

    if (e.dataTransfer.items) {
      Array.from(e.dataTransfer.items).forEach((item, i) => {
        if (item.kind === "file") {
          const file = item.getAsFile();
          if (file) {
            const blobUrl = URL.createObjectURL(file);
            setFile(blobUrl);
          }
          console.log(`items file[${i}].name = ${file?.name}`);
        }
      });
    } else {
      Array.from(e.dataTransfer.files).forEach((file, i) => {
        console.log(`files file[${i}].name = ${file.name}`);
      });
    }
  }, []);

  return {
    file,
    fileEnter,
    nonImageFile,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    setFile,
  };
};
