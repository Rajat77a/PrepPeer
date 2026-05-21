"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useLenis } from "@/components/ui/SmoothScroll";

interface HashLinkButtonProps {
  href: string;
  children: React.ReactNode;
  className?: string;
}

export function HashLinkButton({
  href,
  children,
  className,
}: HashLinkButtonProps) {
  const pathname = usePathname();
  const lenis = useLenis();
  const isHash = href.startsWith("#");
  const sectionId = href.replace("#", "");

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (pathname !== "/" || !isHash) return;
    e.preventDefault();
    const target = document.getElementById(sectionId);
    if (!target) return;

    const top = target.getBoundingClientRect().top + window.scrollY - 100;

    if (lenis) {
      lenis.scrollTo(top, { duration: 1.2 });
    } else {
      window.scrollTo({ top, behavior: "smooth" });
    }

    target.classList.remove("section-nav-flash");
    void target.offsetWidth;
    target.classList.add("section-nav-flash");
  };

  const linkHref = pathname === "/" && isHash ? href : isHash ? `/${href}` : href;

  return (
    <motion.div
      whileHover={{ scale: 1.05, backgroundColor: "rgba(255,255,255,0.75)" }}
      whileTap={{ scale: 0.97 }}
      transition={{ duration: 0.2 }}
      style={{ willChange: "transform" }}
    >
      <Link
        href={linkHref}
        onClick={handleClick}
        className={cn(
          "inline-flex items-center justify-center gap-2 px-[22px] py-3.5 rounded-2xl",
          "bg-[rgba(255,255,255,0.4)] border border-[rgba(0,0,0,0.08)]",
          "shadow-[inset_0px_2px_4px_rgba(255,255,255,0.5)]",
          "font-inter font-medium text-[15px] text-text cursor-pointer",
          className
        )}
      >
        {children}
      </Link>
    </motion.div>
  );
}
