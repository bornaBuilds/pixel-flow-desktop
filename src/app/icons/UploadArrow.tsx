import { FC, SVGAttributes } from "react";

export const UploadArrow: FC<SVGAttributes<SVGElement>> = (properties) => {
  return (
    <svg
      viewBox="0 0 18 18"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...properties}
    >
      <path
        d="M3.75 9L9 3.75 14.25 9M9 14.25V3.75"
        stroke="#1D1C2C"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
