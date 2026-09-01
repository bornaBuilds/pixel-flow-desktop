import { FC, SVGAttributes } from "react";

export const Error: FC<SVGAttributes<SVGElement>> = (properties) => {
  return (
    <svg
      viewBox="0 0 96 96"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...properties}
    >
      <path
        d="M72 24L24 72M24 24l48 48"
        stroke="#FF7373"
        strokeWidth={4}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
