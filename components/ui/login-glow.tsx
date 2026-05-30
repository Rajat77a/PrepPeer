"use client";

import { useEffect, useRef } from "react";

export default function LoginGlow() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationId = 0;
    const orbs = [
      { x: 0.68, y: 0.3, r: 0.42, color: "#006cff", speed: 0.0003, phase: 0 },
      { x: 0.57, y: 0.62, r: 0.36, color: "#1d4ed8", speed: 0.0002, phase: 2 },
      { x: 0.74, y: 0.52, r: 0.3, color: "#0ea5e9", speed: 0.0004, phase: 4 },
    ];

    const resize = () => {
      const scale = window.devicePixelRatio || 1;
      canvas.width = window.innerWidth * scale;
      canvas.height = window.innerHeight * scale;
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      ctx.setTransform(scale, 0, 0, scale, 0, 0);
    };

    const draw = (time: number) => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      ctx.clearRect(0, 0, width, height);

      orbs.forEach((orb) => {
        const dx = Math.sin(time * orb.speed + orb.phase) * 0.08;
        const dy = Math.cos(time * orb.speed * 1.3 + orb.phase) * 0.06;
        const cx = (orb.x + dx) * width;
        const cy = (orb.y + dy) * height;
        const radius = orb.r * Math.max(width, height);
        const gradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius);

        gradient.addColorStop(0, `${orb.color}55`);
        gradient.addColorStop(0.5, `${orb.color}22`);
        gradient.addColorStop(1, "transparent");

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(cx, cy, radius, 0, Math.PI * 2);
        ctx.fill();
      });

      animationId = requestAnimationFrame(draw);
    };

    resize();
    window.addEventListener("resize", resize);
    animationId = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 z-0 h-full w-full"
    />
  );
}
