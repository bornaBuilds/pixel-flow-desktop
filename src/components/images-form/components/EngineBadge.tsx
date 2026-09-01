"use client";

import { useEffect, useState } from "react";
import { engineStatus } from "@/platform/engine";

type State =
  | { kind: "checking" }
  | { kind: "ok"; sharp: string; vips: string }
  | { kind: "failed"; message: string };

/**
 * Shows whether the sharp sidecar is alive. Temporary-ish: once the converter
 * is wired up in Milestone 3 this becomes the failure surface for it.
 */
export const EngineBadge = () => {
  const [state, setState] = useState<State>({ kind: "checking" });

  useEffect(() => {
    let cancelled = false;
    engineStatus()
      .then((status) => {
        if (cancelled) return;
        setState({
          kind: "ok",
          sharp: status.roundTrip.sharp,
          vips: status.roundTrip.vips,
        });
      })
      .catch((error: unknown) => {
        if (cancelled) return;
        setState({
          kind: "failed",
          message:
            error instanceof globalThis.Error ? error.message : String(error),
        });
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (state.kind === "checking") {
    return (
      <span className="text-xs text-white-text/40">Checking image engine…</span>
    );
  }

  if (state.kind === "failed") {
    return (
      <span className="text-xs text-red-400">
        Image engine unavailable — {state.message}
      </span>
    );
  }

  return (
    <span className="text-xs text-white-text/40">
      Image engine ready · sharp {state.sharp} · libvips {state.vips}
    </span>
  );
};
