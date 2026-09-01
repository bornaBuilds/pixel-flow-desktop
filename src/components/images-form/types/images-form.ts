export type ConvertItemStatus = "queued" | "converting" | "done" | "error";

export type ConvertItem = {
  /** Stable per-item key. Two files can share a basename across folders, and
   *  the web version correlated by filename and silently overwrote one. */
  id: string;
  /** Position in the batch; how progress events correlate back. */
  index: number;
  sourcePath: string;
  fileName: string;
  status: ConvertItemStatus;
  outputPath?: string;
  bytesIn?: number;
  bytesOut?: number;
  width?: number;
  height?: number;
  message?: string;
};
