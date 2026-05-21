"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useLenis } from "@/components/ui/SmoothScroll";

export interface NavSectionItem {
  label: string;
  href: string;
  sectionId?: string;
}

interface NavSectionLinkProps {
  item: NavSectionItem;
  active?: boolean;
  onNavigate?: () => void;
  compact?: boolean;
}

export function NavSectionLink({
  item,
  active,
  onNavigate,
  compact = false,
}: NavSectionLinkProps) {
  const pathname = usePathname();
  const lenis = useLenis();
  const isHome = pathname === "/";
  const isHash = item.href.startsWith("#");
  const sectionId = item.sectionId ?? item.href.replace("#", "");

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (!isHome || !isHash) return;

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
    onNavigate?.();
  };

  return (
    <Link
      href={isHome && isHash ? item.href : isHash ? `/${item.href}` : item.href}
      onClick={handleClick}
      className="relative shrink-0 whitespace-nowrap py-1"
    >
      <motion.span
        className={cn(
          "font-inter font-medium block",
          compact ? "text-xs sm:text-sm" : "text-sm",
          active ? "text-text" : "text-muted"
        )}
        whileHover={{ color: "#0A0A0F" }}
        transition={{ duration: 0.2 }}
      >
        {item.label}
      </motion.span>
      <motion.div
        className="absolute bottom-0 left-0 h-[1.5px] bg-blue"
        initial={false}
        animate={{ width: active ? "100%" : "0%" }}
        whileHover={{ width: "100%" }}
        transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
      />
    </Link>
  );
}
