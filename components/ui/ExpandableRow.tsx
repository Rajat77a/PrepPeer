"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface ExpandableRowProps {
  number: string;
  title: string;
  description: string;
  tags: string[];
}

export default function ExpandableRow({
  number,
  title,
  description,
  tags,
}: ExpandableRowProps) {
  const [open, setOpen] = useState(number === "01");

  return (
    <div className="border-b border-[rgba(0,0,0,0.06)] last:border-b-0">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-4 px-5 sm:px-6 py-5 text-left hover:bg-[rgba(0,132,255,0.04)] transition-colors cursor-pointer"
      >
        <span className="font-fustat font-extrabold text-lg text-blue w-10 shrink-0">
          {number}
        </span>
        <span className="font-fustat font-bold text-base sm:text-lg text-text flex-1">
          {title}
        </span>
        <ChevronDown
          size={20}
          className={cn(
            "text-muted shrink-0 transition-transform duration-300",
            open && "rotate-180"
          )}
        />
      </button>

      <div
        className={cn(
          "grid transition-[grid-template-rows] duration-300 ease-out",
          open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        )}
      >
        <div className="overflow-hidden">
          <div className="px-5 sm:px-6 pb-5 pt-0 pl-[4.5rem] sm:pl-[5.5rem]">
            <p className="font-inter text-[15px] text-muted leading-[1.65] mb-4 max-w-2xl">
              {description}
            </p>
            <p className="font-inter text-xs text-muted">
              {tags.join(" · ")}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
