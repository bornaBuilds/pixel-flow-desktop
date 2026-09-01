import { FC, SVGAttributes } from "react";

export const Settings: FC<SVGAttributes<SVGElement>> = (properties) => {
  return (
    <svg
      viewBox="0 0 96 98"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...properties}
    >
      <g
        filter="url(#filter0_d_1_656)"
        stroke="#FFA173"
        strokeWidth={4}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M48 80a32 32 0 100-64 32 32 0 000 64z" />
        <path d="M48 56a8 8 0 100-16.001A8 8 0 0048 56zM48 8v8M48 88v-8M68 82.64l-4-6.92M44 41.08L28 13.36M82.64 68l-6.92-4M13.36 28l6.92 4M56 48h32M8 48h8M82.64 28l-6.92 4M13.36 68l6.92-4M68 13.36l-4 6.92M44 54.92L28 82.64" />
      </g>
      <defs>
        <filter
          id="filter0_d_1_656"
          x={-4}
          y={0}
          width={104}
          height={104}
          filterUnits="userSpaceOnUse"
          colorInterpolationFilters="sRGB"
        >
          <feFlood floodOpacity={0} result="BackgroundImageFix" />
          <feColorMatrix
            in="SourceAlpha"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feOffset dy={4} />
          <feGaussianBlur stdDeviation={2} />
          <feComposite in2="hardAlpha" operator="out" />
          <feColorMatrix values="0 0 0 0 0.121569 0 0 0 0 0.121569 0 0 0 0 0.121569 0 0 0 0.15 0" />
          <feBlend in2="BackgroundImageFix" result="effect1_dropShadow_1_656" />
          <feBlend
            in="SourceGraphic"
            in2="effect1_dropShadow_1_656"
            result="shape"
          />
        </filter>
      </defs>
    </svg>
  );
};
