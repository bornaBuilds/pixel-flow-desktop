import { FC, SVGAttributes } from "react";

export const Loading: FC<SVGAttributes<SVGElement>> = (properties) => {
  return (
    <svg
      viewBox="0 0 96 96"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...properties}
    >
      <path
        d="M84 48a36 36 0 11-24.876-34.24"
        stroke="#FFF373"
        strokeWidth={3}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
