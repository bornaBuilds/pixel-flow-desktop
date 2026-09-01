import Link from "next/link";
import { FOOTER_LINKS } from "./constants/footer";

export const FooterLeft = () => {
  return (
    <div className="w-full lg:w-1/2 flex flex-col gap-8 lg:gap-12 p-6 max-lg:items-center">
      <Link href="/" className="font-sans font-bold text-3xl w-fit">
        <span className="text-[#FEFEFE]">Pixel</span>
        <span className="text-bid-gold">Flow</span>
      </Link>
      <nav className="flex gap-3 items-center">
        {FOOTER_LINKS.map((link) => (
          <>
            <a
              href={link.href}
              key={link.href}
              className="font-gilroy text-lg text-[#FEFEFE]/60 hover:text-[#FEFEFE] transition-colors"
            >
              {link.link}
            </a>
            <div className="size-0.5 rounded-full bg-bid-gold last:hidden" />
          </>
        ))}
      </nav>
    </div>
  );
};
