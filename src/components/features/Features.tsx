import Image from "next/image";
import compressIllustration from "../../../public/images/compress.png";
import formatConverter from "../../../public/images/format_converter.avif";

export const Features = () => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-12 max-w-4xl mt-20 md:mt-36 w-full">
      <div className="flex flex-col gap-4 items-center w-full">
        <div className="relative w-full h-[320px]">
          <Image
            src={compressIllustration}
            alt="Compression Illustration"
            fill
            className="object-cover object-center"
          />
        </div>
        <div className="flex flex-col gap-4 items-center">
          <p className="font-bold text-2xl text-center mt-8">Compress Images</p>
          <p className="text-center">
            Optimize images to help reduce file size and boost performance.
          </p>
        </div>
      </div>
      <div className="flex flex-col gap-4 items-center">
        <div className="relative w-full h-[320px]">
          <Image
            src={formatConverter}
            alt="Concerted file image"
            fill
            className="object-cover object-center"
          />
        </div>
        <div className="flex flex-col gap-4 items-center">
          <p className="font-bold text-2xl text-center mt-8">Convert Format</p>
          <p className="text-center">
            Use modern image formats for more efficient, reduced file sizes.
          </p>
        </div>
      </div>
    </div>
  );
};
