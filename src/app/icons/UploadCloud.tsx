import { FC, SVGAttributes } from "react";

export const UploadCloud: FC<SVGAttributes<SVGElement>> = (properties) => {
  return (
    <svg
      width={96}
      height={96}
      viewBox="0 0 96 96"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...properties}
    >
      <g
        filter="url(#filter0_d_2_275)"
        stroke="#FFA173"
        strokeWidth={4}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M48 52v32M16 59.596A28 28 0 1162.84 32H70a18 18 0 0110 32.968" />
        <path d="M32 68l16-16 16 16" />
      </g>
      <defs>
        <filter
          id="filter0_d_2_275"
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
          <feBlend in2="BackgroundImageFix" result="effect1_dropShadow_2_275" />
          <feBlend
            in="SourceGraphic"
            in2="effect1_dropShadow_2_275"
            result="shape"
          />
        </filter>
      </defs>
    </svg>
  );
};
