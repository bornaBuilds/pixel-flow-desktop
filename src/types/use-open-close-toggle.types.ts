export type useOpenCloseToggleReturn = readonly [
  boolean,
  {
    readonly open: () => void;
    readonly close: () => void;
    readonly toggle: () => void;
  }
];
