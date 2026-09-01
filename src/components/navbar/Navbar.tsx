import Link from "next/link";

export const Navbar = () => {
  return (
    <nav className="flex items-center justify-center gap-16 sticky top-0 py-[42px] bg-bid-purple/70 w-full z-50 px-20 backdrop-blur-sm">
      <Link href="/" className="font-sans font-bold text-3xl">
        <span className="text-[#FEFEFE]">Pixel</span>
        <span className="text-bid-gold">Flow</span>
      </Link>
      <hr className="max-w-[561px] w-full border-t border-t-[#FEFEFE] max-lg:hidden" />
      <ul className="flex gap-3 text-[#FEFEFE] max-lg:hidden text-nowrap">
        <a href="#how-to-use">How to Use</a>
        <a href="#pricing">Pricing</a>
        <Link href="/thumbnail-generator">Thumbnail Generator</Link>
        <a href="https://github.com/SparklingBalz" target="_blank">
          Github
        </a>
      </ul>
    </nav>
  );
};
