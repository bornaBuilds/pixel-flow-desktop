import { FC, SVGAttributes } from "react";

export const GithubLogo: FC<SVGAttributes<SVGElement>> = (properties) => {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...properties}
    >
      <path
        d="M10 14.667V12a3.2 3.2 0 00-.667-2.333c2 0 4-1.334 4-3.667a3.602 3.602 0 00-.666-2.333 4.93 4.93 0 000-2.334s-.667 0-2 1a14.347 14.347 0 00-5.334 0c-1.333-1-2-1-2-1-.2.767-.2 1.567 0 2.334A3.602 3.602 0 002.667 6c0 2.333 2 3.667 4 3.667A3.144 3.144 0 006 12v2.667M6 12c-3.007 1.333-3.333-1.333-4.667-1.333"
        stroke="#FFA173"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
