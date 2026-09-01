import { FooterLeft } from "./FooterLeft";
import { FooterRight } from "./FooterRight";

export const Footer = () => {
  return (
    <footer>
      <div className="w-full px-6 md:px-20 lg:px-[152px] py-12 lg:py-[42px] flex flex-col max-lg:divide-y lg:flex-row lg:divide-x divide-bid-gold max-lg:gap-12 mt-16">
        <FooterLeft />
        <FooterRight />
      </div>
    </footer>
  );
};
