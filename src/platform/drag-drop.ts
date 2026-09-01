"use client";

import { RefObject, useEffect, useState } from "react";
import { getCurrentWebview } from "@tauri-apps/api/webview";
import type { UnlistenFn } from "@tauri-apps/api/event";
import { IMAGE_EXTENSIONS } from "./files";

const IMAGE_SET = new Set(IMAGE_EXTENSIONS);

function hasImageExtension(path: string): boolean {
  const ext = path.split(".").pop()?.toLowerCase();
  return !!ext && IMAGE_SET.has(ext);
}

/**
 * Tauri-native drag and drop, returning absolute paths.
 *
 * Deliberately not HTML5 DnD: that hands back File objects with no path, which
 * would mean reading whole files into the webview only to pass them back to
 * Rust.
 *
 * Three things differ from the DOM version this replaces:
 *
 *  1. The event is window-global. There is no per-element targeting, so every
 *     dropzone would light up at once unless we hit-test the position here.
 *  2. Coordinates are physical pixels, so they must be divided by
 *     devicePixelRatio before comparing against a CSS-pixel bounding rect.
 *  3. There is no MIME type, and paths may be directories. `file.type
 *     .startsWith("image/")` is gone, so we validate by extension.
 *
 * Returns the same { fileEnter, nonImageFile } shape the old hook did, so the
 * glow/error styling in the JSX is untouched.
 */
export function useTauriFileDrop(
  zoneReference: RefObject<HTMLElement>,
  onDrop: (paths: string[]) => void
) {
  const [fileEnter, setFileEnter] = useState(false);
  const [nonImageFile, setNonImageFile] = useState(false);

  useEffect(() => {
    let unlisten: UnlistenFn | undefined;
    let disposed = false;

    const isInsideZone = (position: { x: number; y: number }) => {
      const rect = zoneReference.current?.getBoundingClientRect();
      if (!rect) return false;
      const ratio = window.devicePixelRatio || 1;
      const x = position.x / ratio;
      const y = position.y / ratio;
      return (
        x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom
      );
    };

    // getCurrentWebview() reads window.__TAURI_INTERNALS__ and throws
    // *synchronously* when that is absent, so a promise .catch() is not enough:
    // outside Tauri (plain `next dev` in a browser) an unguarded call takes the
    // whole page down.
    try {
      getCurrentWebview()
        .onDragDropEvent(({ payload }) => {
          if (payload.type === "over") {
            setFileEnter(isInsideZone(payload.position));
            return;
          }

          if (payload.type === "drop") {
            const inside = isInsideZone(payload.position);
            setFileEnter(false);
            if (!inside) return;

            const images = payload.paths.filter(hasImageExtension);
            setNonImageFile(images.length !== payload.paths.length);
            if (images.length > 0) onDrop(images);
            return;
          }

          // "leave" / "enter"
          setFileEnter(false);
          setNonImageFile(false);
        })
        .then((fn) => {
          if (disposed) fn();
          else unlisten = fn;
        })
        .catch(() => {});
    } catch {
      // No Tauri webview here; the picker button still works.
    }

    return () => {
      disposed = true;
      unlisten?.();
    };
  }, [onDrop, zoneReference]);

  return { fileEnter, nonImageFile, clearNonImageFile: () => setNonImageFile(false) };
}
