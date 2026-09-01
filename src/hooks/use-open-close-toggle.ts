import { useCallback, useState } from "react";
import type { useOpenCloseToggleReturn } from "../types/use-open-close-toggle.types";

export function useOpenCloseToggle(
  initialState = false,
  callbacks?: { onOpen?: () => void; onClose?: () => void }
): useOpenCloseToggleReturn {
  const { onOpen, onClose } = callbacks ?? {};

  const [opened, setOpened] = useState(initialState);

  const open = useCallback(() => {
    setOpened((isOpened) => {
      if (!isOpened) {
        onOpen?.();

        return true;
      }

      return isOpened;
    });
  }, [onOpen]);

  const close = useCallback(() => {
    setOpened((isOpened) => {
      if (isOpened) {
        onClose?.();

        return false;
      }

      return isOpened;
    });
  }, [onClose]);

  const toggle = useCallback(() => {
    if (opened) {
      close();
    } else {
      open();
    }
  }, [opened, open, close]);

  return [opened, { open, close, toggle }] as const;
}
