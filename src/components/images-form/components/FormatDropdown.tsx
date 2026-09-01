import { FC, useRef, useState } from "react";
import { FormatDropdownProperties } from "../types/format-dropdown";
import { IMAGE_FORMATS } from "../constants/format-dropdown";
import { useOutsideClick } from "@/hooks/use-outside-click";

export const FormatDropdown: FC<FormatDropdownProperties> = (properties) => {
  const { selectedFormat, onChange } = properties;

  const containerReference = useRef<HTMLDivElement>(null);

  const [isOpen, setIsOpen] = useState(false);

  function toggleDropdown() {
    setIsOpen((prev) => !prev);
  }

  useOutsideClick(containerReference, () => setIsOpen(false));

  return (
    <div className="absolute top-6 right-6 lg:right-8 lg:top-8">
      <div className="relative" ref={containerReference}>
        <button
          onClick={toggleDropdown}
          className="px-4 py-2.5 uppercase flex items-center gap-3 rounded-[200px] text-[#fefefe] font-gilroy border border-[#fefefe] opacity-50 bg-transparent"
        >
          {selectedFormat}
          <svg
            className={`w-4 h-4 transition-transform duration-200 ${
              isOpen ? "transform rotate-180" : ""
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M6 9l6 6 6-6"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
        {isOpen && (
          <div className="absolute right-0 z-10 w-full mt-2 rounded-md bg-[#fefefe]/10 font-gilroy border border-[#fefefe]">
            {IMAGE_FORMATS.map((format) => {
              if (format.value === selectedFormat) return null;

              return (
                <button
                  key={format.value}
                  onClick={() => {
                    onChange(format.value);
                    setIsOpen(false);
                  }}
                  className="block w-full px-4 py-2 text-left text-sm text-[#fefefe] hover:bg-bid-purple/50"
                >
                  {format.label}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
