import { GithubLogo } from "@/app/icons/GithubLogo";

export const FooterRight = () => {
  return (
    <div className="w-full lg:w-1/2 flex flex-col items-center lg:items-end p-6 gap-8 lg:gap-12">
      <span className="font-gilroy font-semibold text-bid-gold text-[32px]">
        Contact Us
      </span>
      <div className="flex flex-col gap-4">
        <a
          href="https://github.com/SparklingBalz"
          className="flex gap-2 items-center"
        >
          <GithubLogo className="size-4" />
          <span className="font-gilroy text-lg text-[#FEFEFE]">
            Borna Gadanec
          </span>
        </a>
        <a
          href="https://github.com/DamjanKlobucar"
          className="flex gap-2 items-center"
        >
          <GithubLogo className="size-4" />
          <span className="font-gilroy text-lg text-[#FEFEFE]">
            Damjan Klobučar
          </span>
        </a>
      </div>
    </div>
  );
};
