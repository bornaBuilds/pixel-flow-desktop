import type { ElementRef, RefObject } from "react";

type DialogControllerControls = {
  isDialogOpen: boolean;
  openDialog: () => void;
  closeDialog: () => void;
};

export type UseDialogControllerProperties = {
  shouldEnableScrolling?: boolean;
  shouldDisableScrolling?: boolean;
  renderWithRegularStackingContext?: boolean;
};

export type UseDialogControllerReturn = {
  dialogReference: RefObject<ElementRef<"dialog">>;
  controls: DialogControllerControls;
};
