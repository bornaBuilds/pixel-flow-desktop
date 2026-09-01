import { ArrowUp } from "@/app/icons/ArrowUp";
import { RotatedStar } from "@/app/icons/RotatedStar";
import { Star } from "@/app/icons/Star";

export const Banner = () => {
  return (
    <div
      id="pricing"
      className="my-8 lg:px-20 2xl:px-[152px] bg-bid-gold py-8 lg:py-16 flex max-lg:gap-[150px] lg:justify-between items-center relative overflow-hidden flex-col lg:flex-row"
    >
      <div className="flex flex-col max-lg:items-center px-8 max-lg:py-6 max-lg:border-t-[3px] lg:border-l-[3px] border-bid-purple">
        <h3 className="font-gilroy font-semibold text-[28px] lg:text-[64px] text-bid-purple">
          Start Optimizing
        </h3>
        <p className="font-gilroy font-semibold text-xl text-center lg:text-[32px] text-bid-purple">
          Head back to the top and get started
        </p>
      </div>
      <a
        href="#"
        className="px-12 lg:px-8 py-5 lg:py-6 flex gap-6 bg-bid-purple items-center rounded-[200px] z-10"
      >
        <span className="font-gilroy font-semibold text-xl lg:text-[32px] text-[#fefefe]">
          Start Today for Free
        </span>
        <ArrowUp className="size-6 lg:size-8" />
      </a>
      <Star className="absolute lg:w-full lg:h-full max-lg:-bottom-1/3 max-lg:hidden lg:-right-[calc(50%+40px)] xl:-right-1/4" />
      <RotatedStar className="lg:hidden absolute -bottom-32 w-full h-full" />
    </div>
  );
};
