"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

interface OrbLogoProps {
  size?: number;
  className?: string;
}

/** Mini 3D hero orb — clipped inside a circle, no rank badge */
export function OrbLogo({ size = 34, className }: OrbLogoProps) {
  const [videoFailed, setVideoFailed] = useState(false);

  return (
    <div
      className={cn("orb-logo relative shrink-0 rounded-full", className)}
      style={{ width: size, height: size }}
      aria-hidden
    >
      <div className="orb-logo-fallback absolute inset-0 rounded-full" />
      {!videoFailed && (
        <video
          autoPlay
          loop
          muted
          playsInline
          className="orb-logo-video absolute inset-0 w-full h-full rounded-full"
          onError={() => setVideoFailed(true)}
        >
          <source
            src="https://future.co/images/homepage/glassy-orb/orb-purple.webm"
            type="video/webm"
          />
        </video>
      )}
    </div>
  );
}
