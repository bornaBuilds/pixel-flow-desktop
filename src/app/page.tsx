import { Hero } from "@/components/hero";
import { Intro } from "@/components/intro";
import { CompressImage } from "./icons/CompressImage";
import { ConvertImage } from "./icons/ConvertImage";
import { Banner } from "@/components/banner";
import { HowItWorks } from "@/components/how-it-works";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "PixelFlow",
  description: "PixelFlow is a tool for preparing images for the web.",
};

export default function Home() {
  return (
    <>
      <Hero />
      <Intro
        title="Compress Images"
        subtitle="Reduce file size and boost performance across the web by utilizing cutting-edge image optimization algorithms."
        image={
          <CompressImage className="lg:size-[420px] 2xl:size-[560px] flex-shrink-0" />
        }
      />
      <Intro
        title="Convert Format"
        subtitle="Quickly and conveniently convert from any known image format, into any other - for any use or occasion."
        image={<ConvertImage className="size-[560px]" />}
        reversed
      />
      <Banner />
      <HowItWorks />
    </>
  );
}
