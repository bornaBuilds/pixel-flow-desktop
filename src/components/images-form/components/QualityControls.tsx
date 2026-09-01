"use client";

import { ChangeEvent } from "react";

export type QualitySettings = {
  quality: number;
  maxWidth?: number;
  maxHeight?: number;
};

type Properties = {
  value: QualitySettings;
  onChange: (next: QualitySettings) => void;
  disabled?: boolean;
};

const parseDimension = (raw: string): number | undefined => {
  const n = Number.parseInt(raw, 10);
  return Number.isFinite(n) && n > 0 ? n : undefined;
};

export const QualityControls = ({ value, onChange, disabled }: Properties) => {
  const handleQuality = (event: ChangeEvent<HTMLInputElement>) =>
    onChange({ ...value, quality: Number(event.target.value) });

  return (
    <div className="w-full flex flex-col gap-3 text-white-text/80">
      <label className="flex items-center gap-3 text-sm">
        <span className="w-16 shrink-0">Quality</span>
        <input
          type="range"
          min={1}
          max={100}
          step={1}
          value={value.quality}
          onChange={handleQuality}
          disabled={disabled}
          className="flex-1 accent-bid-gold"
        />
        <span className="w-10 text-right tabular-nums">{value.quality}</span>
      </label>

      <div className="flex items-center gap-3 text-sm">
        <span className="w-16 shrink-0">Max size</span>
        <input
          type="number"
          min={1}
          placeholder="width"
          value={value.maxWidth ?? ""}
          disabled={disabled}
          onChange={(e) =>
            onChange({ ...value, maxWidth: parseDimension(e.target.value) })
          }
          className="w-24 bg-white/5 rounded-lg px-3 py-1.5 outline-none focus:ring-1 ring-bid-gold placeholder:text-white-text/30"
        />
        <span className="text-white-text/30">x</span>
        <input
          type="number"
          min={1}
          placeholder="height"
          value={value.maxHeight ?? ""}
          disabled={disabled}
          onChange={(e) =>
            onChange({ ...value, maxHeight: parseDimension(e.target.value) })
          }
          className="w-24 bg-white/5 rounded-lg px-3 py-1.5 outline-none focus:ring-1 ring-bid-gold placeholder:text-white-text/30"
        />
      </div>
      <p className="text-xs text-white-text/40">
        Leave blank to keep the original dimensions. Images are only ever
        scaled down, never cropped or enlarged.
      </p>
    </div>
  );
};
