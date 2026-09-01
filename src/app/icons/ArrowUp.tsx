import { FC, SVGAttributes } from "react"


export const ArrowUp: FC<SVGAttributes<SVGElement>> = (properties) => {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...properties}
    >
      <path
        d="M16 25.333V6.667M6.667 16L16 6.667 25.333 16"
        stroke="#FEFEFE"
        strokeWidth={3}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

