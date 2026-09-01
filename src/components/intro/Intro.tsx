import { FC } from "react";
import { IntroProperties } from "./types/intro";
import clsx from "clsx";

export const Intro: FC<IntroProperties> = (properties) => {
  const { title, subtitle, image, reversed } = properties;

  return (
    <div
      className={clsx(
        "mx-6 lg:mx-24 2xl:mx-[152px] flex flex-col lg:flex-row justify-center items-center gap-4 my-11 lg:my-16 overflow-hidden",
        reversed && "flex-row-reverse"
      )}
    >
      <div className="p-8 lg:p-10 2xl:p-[56px] flex flex-col gap-8 lg:gap-16 max-w-[560px] order-2 lg:order-1">
        <h3 className="font-gilroy font-semibold text-[40px] text-bid-gold order-2 lg:order-1">
          {title}
        </h3>
        <p
          className={clsx(
            "font-gilroy text-lg text-[#fefefe]/80 order-3 lg:order-2",
            reversed && "lg:text-end"
          )}
        >
          {subtitle}
        </p>
        <div
          className={clsx(
            "flex gap-4 order-1 lg:order-3",
            reversed && "lg:justify-end"
          )}
        >
          <div className="h-px w-32 bg-bid-gold" />
          <div className="h-px w-16 bg-bid-gold" />
        </div>
      </div>
      {image}
    </div>
  );
};
