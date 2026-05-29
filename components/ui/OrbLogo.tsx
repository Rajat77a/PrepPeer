"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface OrbLogoProps {
  size?: number;
  className?: string;
}

/** Mini 3D hero orb mark using the same orb source as the hero where supported. */
export function OrbLogo({ size = 34, className }: OrbLogoProps) {
  const [videoFailed, setVideoFailed] = useState(false);
  const [canPlayOrbVideo, setCanPlayOrbVideo] = useState(false);

  useEffect(() => {
    const isIOSLike =
      /iPad|iPhone|iPod/.test(window.navigator.userAgent) ||
      (window.navigator.platform === "MacIntel" &&
        window.navigator.maxTouchPoints > 1);

    setCanPlayOrbVideo(!isIOSLike);
  }, []);

  return (
    <div
      className={cn("orb-logo relative shrink-0", className)}
      style={{ width: size, height: size }}
      aria-hidden
    >
      <div className="orb-logo-fallback absolute inset-0" />
      {canPlayOrbVideo && !videoFailed && (
        <video
          autoPlay
          loop
          muted
          playsInline
          className="orb-logo-video absolute inset-0 h-full w-full"
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
