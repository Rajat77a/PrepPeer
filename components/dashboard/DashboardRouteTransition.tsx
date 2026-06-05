"use client";

import { motion } from "framer-motion";
import { usePathname } from "next/navigation";

export function DashboardRouteTransition({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <motion.div
      key={pathname}
      className="relative min-h-screen transform-gpu overflow-hidden bg-[radial-gradient(circle_at_18%_12%,rgba(0,108,255,0.14),transparent_30%),radial-gradient(circle_at_82%_20%,rgba(125,255,217,0.12),transparent_28%),linear-gradient(180deg,#f8fcff_0%,#edf7ff_48%,#ffffff_100%)]"
      initial={{ opacity: 0.92, x: 18, filter: "blur(10px)" }}
      animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
      transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
    >
      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute left-0 top-0 z-20 h-px w-full origin-left bg-gradient-to-r from-transparent via-[#006cff] to-transparent"
        initial={{ scaleX: 0, opacity: 0 }}
        animate={{ scaleX: [0, 1, 0.2], opacity: [0, 1, 0] }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      />
      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute -top-28 left-[-24%] z-10 h-48 w-[50%] rotate-12 bg-[linear-gradient(90deg,transparent,rgba(0,108,255,0.18),rgba(155,212,255,0.32),transparent)] blur-2xl"
        initial={{ x: "-22%", opacity: 0 }}
        animate={{ x: "260%", opacity: [0, 0.75, 0] }}
        transition={{ duration: 0.62, ease: [0.16, 1, 0.3, 1] }}
      />
      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute right-6 top-6 z-10 h-20 w-20 rounded-full border border-[#006cff]/16 bg-white/30 shadow-[0_20px_60px_rgba(0,108,255,0.16)] backdrop-blur-xl"
        initial={{ scale: 0.88, opacity: 0, rotate: -10 }}
        animate={{ scale: 1, opacity: [0, 0.55, 0], rotate: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      />
      {children}
    </motion.div>
  );
}
