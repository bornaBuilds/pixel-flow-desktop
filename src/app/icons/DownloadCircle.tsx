import { FC, SVGAttributes } from "react";

export const DownloadCircle: FC<SVGAttributes<SVGElement>> = (properties) => {
  return (
    <svg
      viewBox="0 0 66 66"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...properties}
    >
      <rect
        x={1}
        y={1}
        width={64}
        height={64}
        rx={32}
        stroke="#FEFEFE"
        strokeWidth={2}
      />
      <path
        d="M38.25 33L33 38.25 27.75 33M33 27.75v10.5"
        stroke="#FEFEFE"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
