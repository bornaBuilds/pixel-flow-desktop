export const HEADER_TITLES = {
  default: "Drop an Image",
  error: "Invalid Format",
  pending: "Uploading",
  success: "Completed",
} as const;

export const HEADER_SUBTITLES = {
  default: "or",
  error: "Try again",
  pending: "Please wait...",
  success: "Continue and",
} as const;

export const STATUS_BUTTON_GRADIENTS = {
  default: "from-[#B27050] via-[#FFA173] to-[#B27050]",
  error: "from-[#A44848] via-[#FF7373] to-[#A44848]",
  pending: "bg-white disabled:opacity-15 text-bid-purple",
  success: "from-[#4ECA62] via-[#73FF8A] to-[#4ECA62]",
} as const;
