"use client";

import { cn } from "@/lib/utils";

interface OrbLogoProps {
  size?: number;
  className?: string;
}

/** Mini 3D hero orb mark, optimized for small logo/card placements. */
export function OrbLogo({ size = 34, className }: OrbLogoProps) {
  return (
    <div
      className={cn("orb-logo relative shrink-0", className)}
      style={{ width: size, height: size }}
      aria-hidden
    >
      <div className="orb-logo-fallback absolute inset-0" />
    </div>
  );
}
