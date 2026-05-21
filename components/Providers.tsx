"use client";

import { ReactLenis } from "lenis/react";
import { PageTransition } from "@/components/ui/PageTransition";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ReactLenis
      root
      options={{
        duration: 1.15,
        smoothWheel: true,
        touchMultiplier: 1.2,
      }}
    >
      <PageTransition>{children}</PageTransition>
    </ReactLenis>
  );
}
