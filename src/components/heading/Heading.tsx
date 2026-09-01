import { HeadingProperties } from "./Heading.types";

export const Heading = (properties: HeadingProperties) => {
  const { title, subtitle, button, buttonLink } = properties;

  return (
    <div className="flex flex-col gap-6 items-center">
      <h1 className="text-5xl font-black text-center">{title}</h1>
      <p className="text-xl text-center max-w-2xl">{subtitle}</p>
      {button && buttonLink ? (
        <a
          href={buttonLink}
          className="px-3 py-4 text-lg bg-bid-gold text-center"
        >
          {button}
        </a>
      ) : null}
    </div>
  );
};
