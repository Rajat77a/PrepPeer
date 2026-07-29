import { cn } from "@/lib/utils";

interface OrbLogoProps {
  size?: number;
  className?: string;
}

/** Mini orb mark rendered locally without a third-party media dependency. */
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
