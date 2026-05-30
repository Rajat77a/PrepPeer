"use client";

import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  glowColor?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, glowColor = "#38bdf8", ...props }, ref) => {
    const radius = 155;
    const containerRef = React.useRef<HTMLDivElement | null>(null);
    const gradientRef = React.useRef<HTMLDivElement | null>(null);
    const [mousePosition, setMousePosition] = React.useState({ x: 0, y: 0 });

    useGSAP(
      () => {
        gsap.set(gradientRef.current, {
          background: `radial-gradient(0px circle at ${mousePosition.x}px ${mousePosition.y}px, ${glowColor}, transparent 80%)`,
        });
      },
      { scope: containerRef, dependencies: [glowColor, mousePosition.x, mousePosition.y] }
    );

    function setGradient(e: React.MouseEvent, size: number, duration: number) {
      if (!containerRef.current) return;

      const { left, top } = containerRef.current.getBoundingClientRect();
      const x = e.clientX - left;
      const y = e.clientY - top;
      setMousePosition({ x, y });

      gsap.to(gradientRef.current, {
        background: `radial-gradient(${size}px circle at ${x}px ${y}px, ${glowColor}, transparent 80%)`,
        duration,
        ease: "power2.out",
      });
    }

    return (
      <div
        ref={containerRef}
        className="group/input relative rounded-[18px] p-[2px] transition duration-300"
        onMouseMove={(e) => setGradient(e, radius, 0.12)}
        onMouseEnter={(e) => setGradient(e, radius, 0.28)}
        onMouseLeave={() => {
          gsap.to(gradientRef.current, {
            background: `radial-gradient(0px circle at ${mousePosition.x}px ${mousePosition.y}px, ${glowColor}, transparent 80%)`,
            duration: 0.28,
            ease: "power2.out",
          });
        }}
      >
        <div ref={gradientRef} className="absolute inset-0 rounded-[18px]" />
        <input
          type={type}
          className={cn(
            "relative z-10 flex h-12 w-full rounded-[17px] border border-white/10 bg-[#06101d]/85 px-4 py-3 font-inter text-sm text-white outline-none transition duration-300",
            "placeholder:text-white/30 group-hover/input:shadow-[0_0_30px_rgba(56,189,248,0.18)] focus:border-[#38bdf8]/70 focus:bg-[#07182a] focus:shadow-[0_0_0_3px_rgba(56,189,248,0.18),0_0_34px_rgba(56,189,248,0.2)]",
            "disabled:cursor-not-allowed disabled:opacity-50",
            className
          )}
          ref={ref}
          {...props}
        />
      </div>
    );
  }
);
Input.displayName = "Input";

export { Input };
