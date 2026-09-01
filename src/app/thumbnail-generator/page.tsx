import { ThumbnailGeneration } from "@/components/thumbnail-generation";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "PixelFlow | Thumbnail Generator",
  description: "Extract and generate thumbnails from your video easily.",
};

export default function ThumbnailGeneratorPage() {
  return (
    <div className="min-h-screen flex flex-col items-center gap-8 max-md:mx-5">
      <div className="flex flex-col gap-4 items-center">
        <h1 className="text-4xl font-bold font-gilroy text-bid-gold tracking-wide text-center">
          Thumbnail Generator
        </h1>
        <h2 className="text-lg text-center">
          Select a media file, and{" "}
          <span className="font-gilroy">
            Pixel
            <span className="text-bid-gold">Flow</span>
          </span>{" "}
          will extract video thumbnails for it.
        </h2>
      </div>
      <ThumbnailGeneration />
    </div>
  );
}
