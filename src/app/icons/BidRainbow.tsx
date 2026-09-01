import { FC, SVGAttributes } from "react";

export const BidRainbow: FC<SVGAttributes<SVGElement>> = (properties) => {
  return (
    <svg
      width={808}
      height={528}
      viewBox="0 0 808 528"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...properties}
    >
      <g opacity={0.5} fillRule="evenodd" clipRule="evenodd">
        <path
          d="M556.5 1113c307.346 0 556.5-249.154 556.5-556.5S863.846 0 556.5 0 0 249.154 0 556.5 249.154 1113 556.5 1113zm-.001-222.601c184.408 0 333.9-149.492 333.9-333.899 0-184.408-149.492-333.9-333.9-333.9s-333.9 149.492-333.9 333.9c0 184.407 149.492 333.899 333.9 333.899z"
          fill="url(#paint0_linear_1_106)"
        />
        <path
          d="M556.5 1001.7c245.877 0 445.2-199.323 445.2-445.2 0-245.877-199.323-445.2-445.2-445.2-245.878 0-445.2 199.323-445.2 445.2 0 245.877 199.322 445.2 445.2 445.2zm333.832-445.134c0-184.407-149.492-333.899-333.9-333.899s-333.9 149.492-333.9 333.899c0 184.408 149.492 333.9 333.9 333.9s333.9-149.492 333.9-333.9z"
          fill="url(#paint1_linear_1_106)"
        />
      </g>
      <defs>
        <linearGradient
          id="paint0_linear_1_106"
          x1={556.5}
          y1={0}
          x2={556.5}
          y2={1113}
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#B37050" />
          <stop offset={0.5} stopColor="#FFA173" />
          <stop offset={1} stopColor="#B27050" />
        </linearGradient>
        <linearGradient
          id="paint1_linear_1_106"
          x1={111.3}
          y1={556.5}
          x2={1001.7}
          y2={556.5}
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#B37050" />
          <stop offset={0.5} stopColor="#FFA173" />
          <stop offset={1} stopColor="#B27050" />
        </linearGradient>
      </defs>
    </svg>
  );
};
