import { BidRainbow } from "@/app/icons/BidRainbow";
import { HeroTitle } from "./HeroTitle";
import { ImagesForm } from "@/components/images-form";

export const Hero = () => {
  return (
    <main className="flex justify-end items-center flex-col h-screen relative overflow-hidden">
      <div className="flex items-center flex-col gap-16 lg:gap-6 lg:flex-row lg:justify-between px-6 lg:px-[152px] w-full">
        <HeroTitle />
        <ImagesForm />
      </div>
      <div className="w-full h-[106px] lg:h-[222px] bg-gradient-to-t from-bid-purple to-bid-purple/0 z-10" />
      <BidRainbow className="absolute -bottom-28 -right-56 md:bottom-0 md:right-0" />
    </main>
  );
};
