import Link from "next/link";
import { OrbLogo } from "./OrbLogo";

interface LogoProps {
  variant?: "dark" | "light";
  size?: "sm" | "md";
}

export function Logo({ variant = "dark", size = "sm" }: LogoProps) {
  const textColor = variant === "light" ? "text-white" : "text-text";
  const orbSize = size === "md" ? 40 : 34;

  return (
    <Link href="/" className="flex items-center gap-2.5 cursor-pointer group">
      <div className="shrink-0 rounded-full transition-transform duration-300 ease-out group-hover:scale-105">
        <OrbLogo size={orbSize} />
      </div>
      <span
        className={`font-fustat font-bold ${size === "md" ? "text-xl" : "text-[17px]"} ${textColor}`}
      >
        PrepPeer
      </span>
    </Link>
  );
}
