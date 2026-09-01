export const canvasToBlob = async (
  canvas: OffscreenCanvas | HTMLCanvasElement
) => {
  if ("convertToBlob" in canvas) {
    // OffscreenCanvas
    return await (canvas as OffscreenCanvas).convertToBlob({
      type: "image/jpeg",
      quality: 0.92,
    });
  }

  // HTMLCanvasElement
  const element = canvas as HTMLCanvasElement;
  const blob = await new Promise<Blob>((res, rej) =>
    element.toBlob(
      (b) => (b ? res(b) : rej(new Error("Canvas toBlob() failed"))),
      "image/jpeg",
      0.92
    )
  );
  return blob;
};
