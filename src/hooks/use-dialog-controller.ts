"use client";

import { useRef, type ElementRef } from "react";
import { useBodyScrollLock } from "../hooks/use-body-scroll-lock";
import { useOpenCloseToggle } from "../hooks/use-open-close-toggle";
import type {
  UseDialogControllerProperties,
  UseDialogControllerReturn,
} from "../types/use-dialog-controller.types";

export function useDialogController(
  properties?: UseDialogControllerProperties
): UseDialogControllerReturn {
  const {
    shouldDisableScrolling,
    shouldEnableScrolling,
    renderWithRegularStackingContext,
  } = properties || {
    shouldDisableScrolling: true,
    shouldEnableScrolling: true,
    renderWithRegularStackingContext: false,
  };

  const dialogReference = useRef<ElementRef<"dialog">>(null);

  const { allowScroll, blockScroll } = useBodyScrollLock();

  const [isDialogOpen, { open: openDialog, close: closeDialog }] =
    useOpenCloseToggle(false, {
      onOpen: () => {
        if (dialogReference.current) {
          if (renderWithRegularStackingContext) {
            dialogReference.current.show();
          } else {
            dialogReference.current.showModal();
          }

          if (shouldDisableScrolling) {
            blockScroll();
          }
        }
      },
      onClose: () => {
        if (dialogReference.current) {
          dialogReference.current.close();

          if (shouldEnableScrolling) {
            allowScroll();
          }
        }
      },
    });

  return {
    dialogReference,
    controls: {
      isDialogOpen,
      openDialog,
      closeDialog,
    },
  };
}
