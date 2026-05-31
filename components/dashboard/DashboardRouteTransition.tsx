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
      className="relative min-h-screen transform-gpu overflow-hidden"
      initial={{ opacity: 0, y: 10, filter: "blur(8px)" }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
    >
      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute left-0 top-0 z-20 h-px w-full origin-left bg-gradient-to-r from-transparent via-[#006cff] to-transparent"
        initial={{ scaleX: 0, opacity: 0 }}
        animate={{ scaleX: [0, 1, 0.15], opacity: [0, 1, 0] }}
        transition={{ duration: 0.42, ease: "easeOut" }}
      />
      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute -top-24 left-[-20%] z-10 h-40 w-[45%] rotate-12 bg-[#006cff]/10 blur-3xl"
        initial={{ x: "-20%", opacity: 0 }}
        animate={{ x: "260%", opacity: [0, 0.5, 0] }}
        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      />
      {children}
    </motion.div>
  );
}
