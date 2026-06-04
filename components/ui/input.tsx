"use client";

import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  glowColor?: string;
  variant?: "light" | "dark";
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, glowColor = "#061059", variant = "light", ...props }, ref) => {
    const radius = 190;
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
        className="group/input relative overflow-hidden rounded-full p-[2px] transition duration-300"
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
        <div ref={gradientRef} className="absolute inset-0 rounded-full" />
        <input
          type={type}
          className={cn(
            "relative z-10 flex h-12 w-full rounded-full px-4 py-3 font-inter text-sm outline-none backdrop-blur-xl transition duration-300",
            variant === "dark"
              ? "border border-[#7ed7ff]/45 bg-[#041833]/88 text-white shadow-[inset_0_1px_2px_rgba(255,255,255,0.12),inset_0_-16px_40px_rgba(0,108,255,0.10),0_16px_46px_rgba(0,11,34,0.32)] placeholder:text-[#b8d5f7]/68 group-hover/input:border-[#bdf1ff]/80 group-hover/input:bg-[#06214a]/92 group-hover/input:shadow-[inset_0_1px_2px_rgba(255,255,255,0.18),inset_0_-18px_44px_rgba(0,108,255,0.16),0_0_42px_rgba(73,196,255,0.38),0_18px_58px_rgba(0,11,34,0.38)] focus:border-[#d6fbff] focus:bg-[#061f48] focus:shadow-[0_0_0_3px_rgba(98,217,255,0.22),0_0_58px_rgba(73,196,255,0.42),inset_0_1px_2px_rgba(255,255,255,0.18)]"
              : "border border-white/80 bg-white/82 text-[#07111f] shadow-[inset_0_1px_2px_rgba(255,255,255,0.95),0_16px_40px_rgba(0,132,255,0.08)] placeholder:text-[#7b8da3]/70 group-hover/input:shadow-[inset_0_1px_2px_rgba(255,255,255,0.95),0_0_42px_rgba(6,16,89,0.24)] focus:border-[#006cff]/45 focus:bg-white focus:shadow-[0_0_0_3px_rgba(6,16,89,0.16),0_0_46px_rgba(0,132,255,0.22)]",
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
