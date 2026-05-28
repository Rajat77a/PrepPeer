"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { EASE_OUT } from "@/lib/motion";
import { Button } from "@/components/ui/Button";
import { HashLinkButton } from "@/components/ui/HashLinkButton";
import TypingText from "@/components/sections/TypingText";

const heroVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 1, y: 28 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: EASE_OUT },
  },
};

const orbVariants = {
  hidden: { opacity: 1, scale: 0.92, y: 20 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { duration: 1.1, ease: EASE_OUT, delay: 0.2 },
  },
};

const orbHoverVariants = {
  rest: {},
  hover: {},
};

const mysteryRingVariants = {
  rest: { scale: 1, opacity: 0.5 },
  hover: {
    scale: 1.12,
    opacity: 0.95,
    transition: { duration: 0.35, ease: EASE_OUT },
  },
};

const mysteryCardVariants = {
  rest: {
    scale: 1,
    y: 0,
    boxShadow: "0 16px 40px rgba(27,43,94,0.45)",
  },
  hover: {
    scale: 1.08,
    y: -6,
    boxShadow: "0 24px 52px rgba(49,154,255,0.42)",
    transition: { type: "spring" as const, stiffness: 380, damping: 22 },
  },
};

const mysteryHashVariants = {
  rest: { scale: 1, x: 0 },
  hover: {
    scale: 1.06,
    x: -2,
    transition: { type: "spring" as const, stiffness: 400, damping: 20 },
  },
};

const mysteryGlyphVariants = {
  rest: { scale: 1, opacity: 0.88 },
  hover: {
    scale: 1.28,
    opacity: 1,
    transition: { type: "spring" as const, stiffness: 420, damping: 16 },
  },
};

const mysteryCaptionVariants = {
  rest: { opacity: 0.75, y: 0 },
  hover: {
    opacity: 1,
    y: -1,
    transition: { duration: 0.25, ease: EASE_OUT },
  },
};

function MysteryRankValue() {
  return (
    <div className="flex items-center justify-center gap-0.5 my-0.5 min-h-[36px] sm:min-h-[44px]">
      <motion.span
        variants={mysteryHashVariants}
        className="font-fustat font-extrabold text-2xl sm:text-3xl md:text-4xl text-white leading-none"
      >
        #
      </motion.span>
      <motion.span
        variants={mysteryGlyphVariants}
        className="font-fustat font-extrabold text-2xl sm:text-3xl md:text-4xl text-[#7DFFD9] leading-none hero-mystery-glyph-glow hero-mystery-glyph"
      >
        ?
      </motion.span>
    </div>
  );
}

function HeroMysteryBadge() {
  return (
    <div className="absolute -bottom-2 -left-2 sm:-bottom-3 sm:-left-3 z-[3] hero-mystery-badge">
      <motion.span
        className="hero-mystery-ring"
        variants={mysteryRingVariants}
        aria-hidden
      />
      <motion.span
        className="hero-mystery-ring hero-mystery-ring--delayed"
        variants={mysteryRingVariants}
        aria-hidden
      />
      <motion.div
        variants={mysteryCardVariants}
        className="relative flex flex-col items-center rounded-2xl sm:rounded-[18px] px-3 py-2.5 sm:px-4 sm:py-3 min-w-[88px] sm:min-w-[104px] bg-[#1B2B5E] border border-[rgba(255,255,255,0.25)] overflow-hidden hero-mystery-card"
      >
        <div className="hero-mystery-shimmer" aria-hidden />
        <span className="relative font-inter text-[10px] sm:text-xs font-semibold text-[rgba(255,255,255,0.75)] uppercase tracking-wide">
          Score
        </span>
        <div className="relative">
          <MysteryRankValue />
        </div>
        <motion.span
          variants={mysteryCaptionVariants}
          className="relative font-inter text-[10px] sm:text-xs font-medium text-[#60B1FF]"
        >
          unlock rank
        </motion.span>
      </motion.div>
    </div>
  );
}

interface HeroOrbProps {
  linkRef: React.RefObject<HTMLAnchorElement>;
  onHoverStart: () => void;
  onHoverEnd: () => void;
  onOrbClick: (e: React.MouseEvent<HTMLAnchorElement>) => void;
}

function HeroOrb({ linkRef, onHoverStart, onHoverEnd, onOrbClick }: HeroOrbProps) {
  const [videoFailed, setVideoFailed] = useState(false);

  return (
    <motion.div variants={orbVariants} className="shrink-0 transform-gpu">
      <Link
        ref={linkRef}
        href="/interview"
        aria-label="Start free interview"
        onClick={onOrbClick}
        onMouseEnter={onHoverStart}
        onMouseLeave={onHoverEnd}
        onFocus={onHoverStart}
        onBlur={onHoverEnd}
        className="hero-orb-hit relative inline-block cursor-pointer overflow-visible pl-8 pb-10 sm:pl-10 sm:pb-12 md:pl-12 md:pb-14"
      >
        <motion.div
          data-orb-core
          className="relative w-[108px] h-[108px] sm:w-[160px] sm:h-[160px] md:w-[210px] md:h-[210px] lg:w-[280px] lg:h-[280px] xl:w-[300px] xl:h-[300px]"
          initial="rest"
          whileHover="hover"
          variants={orbHoverVariants}
        >
          <div
            className="orb-fallback absolute inset-[8%] z-[1] rounded-full"
            style={{
              background:
                "radial-gradient(circle at 35% 32%, #89CFFF 0%, #319AFF 30%, #0057CC 60%, #001F66 100%)",
              boxShadow:
                "0 0 80px rgba(49,154,255,0.45), inset 0 0 40px rgba(255,255,255,0.15)",
            }}
          />
          {!videoFailed && (
            <video
              autoPlay
              loop
              muted
              playsInline
              className="absolute right-0 bottom-0 z-[2] h-full w-full object-cover orb-video"
              onError={() => setVideoFailed(true)}
            >
              <source
                src="https://future.co/images/homepage/glassy-orb/orb-purple.webm"
                type="video/webm"
              />
            </video>
          )}
          <HeroMysteryBadge />
        </motion.div>
      </Link>
    </motion.div>
  );
}

export function Hero() {
  const sectionRef = useRef<HTMLElement>(null);
  const orbLinkRef = useRef<HTMLAnchorElement>(null);
  const [orbHovered, setOrbHovered] = useState(false);
  const [navGlowPx, setNavGlowPx] = useState({ x: 0, y: 0 });

  const syncGlowOrigin = useCallback(() => {
    const link = orbLinkRef.current;
    if (!link) return;

    const core =
      (link.querySelector("[data-orb-core]") as HTMLElement | null) ?? link;
    const coreRect = core.getBoundingClientRect();

    setNavGlowPx({
      x: coreRect.left + coreRect.width * 0.5,
      y: coreRect.top + coreRect.height * 0.46,
    });
  }, []);

  useEffect(() => {
    syncGlowOrigin();
    window.addEventListener("resize", syncGlowOrigin);
    window.addEventListener("scroll", syncGlowOrigin, { passive: true });
    return () => {
      window.removeEventListener("resize", syncGlowOrigin);
      window.removeEventListener("scroll", syncGlowOrigin);
    };
  }, [syncGlowOrigin]);

  const handleOrbHoverStart = () => {
    syncGlowOrigin();
    setOrbHovered(true);
  };

  const handleOrbHoverEnd = () => {
    setOrbHovered(false);
  };

  const handleOrbClick = () => {
    syncGlowOrigin();
    setOrbHovered(true);
  };

  const showPageGlow = orbHovered;

  return (
    <section
      ref={sectionRef}
      id="home"
      className="relative overflow-visible bg-white pt-24 pb-14 md:pt-28 md:pb-16 min-h-screen flex flex-col justify-center"
    >
      {/* Fixed circular bloom at orb centre — not clipped, expands evenly */}
      <AnimatePresence>
        {showPageGlow && (
          <motion.div
            key="orb-page-glow"
            className="hero-orb-page-glow-anchor pointer-events-none"
            style={{ left: navGlowPx.x, top: navGlowPx.y }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35, ease: EASE_OUT }}
            aria-hidden
          >
            <motion.div
              className="hero-orb-page-glow-halo"
              initial={{ scale: 0.12, opacity: 0 }}
              animate={{ scale: 1, opacity: 0.9 }}
              exit={{ scale: 0.12, opacity: 0 }}
              transition={{ duration: 1.05, ease: EASE_OUT, delay: 0.04 }}
            />
            <motion.div
              className="hero-orb-page-glow-core"
              initial={{ scale: 0.18, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.18, opacity: 0 }}
              transition={{ duration: 0.9, ease: EASE_OUT }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative z-10 max-w-[1320px] mx-auto px-6 md:px-12 w-full">
        <motion.div
          variants={heroVariants}
          initial="hidden"
          animate="visible"
          className="flex flex-col"
        >
          <motion.div
            variants={itemVariants}
            className="flex items-center gap-2.5 mb-6"
          >
            <span className="text-star text-base tracking-wide">★★★★★</span>
            <span className="font-inter font-medium text-sm text-text">
              Rated 4.9/5 by 2700+ students
            </span>
          </motion.div>

          <div className="flex items-center gap-3 sm:gap-6 md:gap-10 mb-6 md:mb-8 overflow-visible">
            <motion.h1
              variants={itemVariants}
              className="hero-h1 text-text flex-1 min-w-0"
            >
              <span className="block">Know your rank as</span>
              <TypingText />
            </motion.h1>
            <HeroOrb
              linkRef={orbLinkRef}
              onHoverStart={handleOrbHoverStart}
              onHoverEnd={handleOrbHoverEnd}
              onOrbClick={handleOrbClick}
            />
          </div>

          <motion.p
            variants={itemVariants}
            className="font-inter text-lg leading-[1.55] tracking-[-0.5px] text-muted max-w-[560px] mb-5"
          >
            PrepPeer runs AI mock interviews tailored to your role and company
            type — then ranks you against thousands of real candidates.{" "}
            <strong className="text-text font-medium">Not just feedback.</strong>{" "}
            A rank.
          </motion.p>

          <motion.div
            variants={itemVariants}
            className="flex flex-col sm:flex-row gap-4"
          >
            <Button
              href="/interview"
              variant="primary"
              showArrow
              className="hero-cta-primary relative min-h-[62px] min-w-[290px] overflow-hidden px-7 text-[15px] sm:px-8"
            >
              <span className="hero-cta-label">Start Interview</span>
            </Button>
            <HashLinkButton
              href="#leaderboard-preview"
              className="hero-cta-secondary group relative min-h-[62px] min-w-[230px] overflow-hidden px-7 text-[15px] sm:px-8"
            >
              <span className="relative z-10 inline-flex items-center gap-2.5">
                <span className="hero-cta-label">Leaderboard</span>
                <ArrowRight
                  size={16}
                  className="text-blue transition-transform duration-300 group-hover:translate-x-1"
                />
              </span>
            </HashLinkButton>
          </motion.div>

          <motion.div
            variants={itemVariants}
            className="hero-proof-rail mt-8 grid max-w-[680px] grid-cols-1 gap-3 font-inter sm:grid-cols-3"
          >
            <span className="hero-proof-item">
              <strong>12,400+</strong>
              <span>mock interviews benchmarked</span>
            </span>
            <span className="hero-proof-item">
              <strong>347</strong>
              <span>role-matched peers in view</span>
            </span>
            <span className="hero-proof-item">
              <strong>4</strong>
              <span>signals behind every rank</span>
            </span>
          </motion.div>
        </motion.div>
      </div>

    </section>
  );
}
