import { FC, SVGAttributes } from "react";

export const Close: FC<SVGAttributes<SVGElement>> = (properties) => {
  return (
    <svg
      viewBox="0 0 12 12"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...properties}
    >
      <path
        d="M9 3L3 9M3 3l6 6"
        stroke="#1D1C2C"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
