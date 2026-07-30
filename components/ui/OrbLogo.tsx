"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

interface OrbLogoProps {
  size?: number;
  className?: string;
}

/** Mini version of the locally hosted animated hero orb. */
export function OrbLogo({ size = 34, className }: OrbLogoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || typeof IntersectionObserver === "undefined") return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          void video.play().catch(() => {
            // The static orb underneath remains visible if autoplay is blocked.
          });
        } else {
          video.pause();
        }
      },
      { rootMargin: "80px" },
    );

    observer.observe(video);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      className={cn("orb-logo relative shrink-0", className)}
      style={{ width: size, height: size }}
      aria-hidden
    >
      <div className="orb-logo-fallback absolute inset-0 z-0" />
      <video
        ref={videoRef}
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
        className="orb-logo-video absolute inset-0 z-[1] h-full w-full"
      >
        <source src="/media/orb-purple.webm" type="video/webm" />
      </video>
    </div>
  );
}
