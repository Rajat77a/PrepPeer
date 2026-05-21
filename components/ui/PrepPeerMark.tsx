"use client";

import { useId } from "react";

interface PrepPeerMarkProps {
  size?: number;
  className?: string;
}

/** PrepPeer brand mark — rising rank bars + peer nodes */
export function PrepPeerMark({ size = 32, className }: PrepPeerMarkProps) {
  const gradId = `pp-logo-grad-${useId().replace(/:/g, "")}`;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden
    >
      <defs>
        <linearGradient
          id={gradId}
          x1="4"
          y1="4"
          x2="28"
          y2="28"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#60B1FF" />
          <stop offset="1" stopColor="#0084FF" />
        </linearGradient>
      </defs>
      <rect width="32" height="32" rx="8" fill={`url(#${gradId})`} />
      <path
        d="M7 20V14M12 20V10M17 20V13M22 20V7"
        stroke="white"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <circle cx="10.5" cy="24.5" r="2.5" fill="white" fillOpacity="0.95" />
      <circle cx="21.5" cy="24.5" r="2.5" fill="white" fillOpacity="0.95" />
      <path
        d="M13 24.5h6"
        stroke="white"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeOpacity="0.7"
      />
    </svg>
  );
}
