import { FC } from "react";
import { HowItWorksCardProperties } from "../types/how-it-works-card";

export const HowItWorksCard: FC<HowItWorksCardProperties> = (properties) => {
  const { icon, title, description } = properties;

  return (
    <div className="w-full rounded-[32px] border border-[#fefefe]/20 relative flex flex-col justify-between items-center card">
      {icon}
      <div className="px-6 py-8 flex flex-col items-center gap-4">
        <h4 className="font-gilroy font-semibold text-[32px] text-bid-gold">
          {title}
        </h4>
        <span className="font-gilroy text-lg text-[#fefefe]">
          {description}
        </span>
      </div>
    </div>
  );
};
