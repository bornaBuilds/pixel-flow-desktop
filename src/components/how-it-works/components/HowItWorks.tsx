"use client";

import { useEffect } from "react";
import { HowItWorksCard } from "./HowItWorksCard";
import "../styles/how-it-works-card.css";
import { UploadCloud } from "@/app/icons/UploadCloud";
import { Settings } from "@/app/icons/Settings";
import { Download } from "@/app/icons/Download";

export const HowItWorks = () => {
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const cards = document.getElementsByClassName("card");
      for (const card of Array.from(cards)) {
        const rect = card.getBoundingClientRect(),
          x = e.clientX - rect.left,
          y = e.clientY - rect.top;

        (card as HTMLElement).style.setProperty("--mouse-x", `${x}px`);
        (card as HTMLElement).style.setProperty("--mouse-y", `${y}px`);
      }
    };

    const cardsContainer = document.getElementById("cards");
    if (cardsContainer) {
      cardsContainer.addEventListener("mousemove", handleMouseMove);
    } else {
      console.error("Element with ID 'cards' not found");
    }

    return () => {
      if (cardsContainer) {
        cardsContainer.removeEventListener("mousemove", handleMouseMove);
      }
    };
  }, []);

  return (
    <div
      id="how-to-use"
      className="py-[42px] mx-6 md:mx-24 lg:mx-[152px] flex flex-col items-center gap-16"
    >
      <h3 className="font-gilroy text-[64px] text-[#FEFEFE] font-semibold">
        How it Works
      </h3>
      <div id="cards" className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <HowItWorksCard
          icon={<UploadCloud className="size-[96px] my-[57px]" />}
          title="Upload"
          description="Start by uploading your files"
        />
        <HowItWorksCard
          icon={<Settings className="size-[96px] my-[57px]" />}
          title="Choose Settings"
          description="Change the format and quality"
        />
        <HowItWorksCard
          icon={<Download className="size-[96px] my-[57px] stroke-bid-gold" />}
          title="Download"
          description="Either individually or in one .ZIP"
        />
      </div>
    </div>
  );
};
