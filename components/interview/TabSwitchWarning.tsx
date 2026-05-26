"use client";

import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle } from "lucide-react";

interface TabSwitchWarningProps {
  strikeCount: number;
  onDismiss: () => void;
  visible: boolean;
}

export function TabSwitchWarning({
  strikeCount,
  onDismiss,
  visible,
}: TabSwitchWarningProps) {
  if (!visible) return null;

  const isLastWarning = strikeCount >= 2;
  const progress = Math.min(strikeCount, 2);
  const accent = isLastWarning ? "#FF6B3D" : "#FFBE3D";
  const accentDark = isLastWarning ? "#CC4422" : "#996600";
  const title = isLastWarning ? "Final Warning" : "Tab Switch Detected";
  const message = isLastWarning
    ? "You've switched tabs twice during this session. One more tab switch will automatically submit your session."
    : "You left the PrepPeer tab during your interview session. This has been recorded.";

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="fixed inset-0 z-[300] flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)" }}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            className="relative mx-6 w-full max-w-md overflow-hidden rounded-3xl"
            style={{
              background: "#fff",
              boxShadow: "0 32px 80px rgba(0,0,0,0.2)",
            }}
          >
            <div
              style={{
                height: "4px",
                background: isLastWarning
                  ? "linear-gradient(90deg, #FF6B3D, #FF4444)"
                  : "linear-gradient(90deg, #FFBE3D, #FF801E)",
              }}
            />

            <div className="p-8">
              <div className="mb-5 flex items-center justify-center gap-3">
                <span
                  className="h-px flex-1"
                  style={{ background: `linear-gradient(90deg, transparent, ${accent})` }}
                />
                <AlertTriangle size={24} strokeWidth={1.8} color={accent} />
                <span
                  className="h-px flex-1"
                  style={{ background: `linear-gradient(90deg, ${accent}, transparent)` }}
                />
              </div>

              <h3
                className="mb-3 text-center font-fustat"
                style={{ fontWeight: 800, fontSize: "20px", color: "#0A0A0F" }}
              >
                {title}
              </h3>

              <p
                className="mb-2 text-center font-inter"
                style={{
                  fontSize: "15px",
                  color: "#6B7280",
                  lineHeight: 1.65,
                }}
              >
                {message}
              </p>

              <div className="my-6">
                <div className="relative h-[3px] overflow-hidden rounded-full bg-black/10">
                  <motion.div
                    className="absolute inset-y-0 left-0 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${progress * 50}%` }}
                    transition={{ duration: 0.35, ease: "easeOut" }}
                    style={{ background: accent }}
                  />
                </div>

                <div className="mt-3 grid grid-cols-2 gap-4 text-center font-inter text-[12px] font-semibold">
                  <span style={{ color: progress >= 1 ? accentDark : "#9CA3AF" }}>
                    First switch recorded
                  </span>
                  <span style={{ color: progress >= 2 ? accentDark : "#9CA3AF" }}>
                    Final warning reached
                  </span>
                </div>
              </div>

              <p
                className="text-center font-inter"
                style={{
                  fontSize: "13px",
                  fontWeight: 600,
                  color: accentDark,
                }}
              >
                {isLastWarning
                  ? "Next switch will complete the session."
                  : "Stay on this page to keep the session active."}
              </p>

              <button
                onClick={onDismiss}
                className="mt-6 w-full cursor-pointer"
                style={{
                  padding: "14px",
                  borderRadius: "12px",
                  background: isLastWarning ? "#FF6B3D" : "#0084FF",
                  color: "#fff",
                  fontFamily: "var(--font-inter)",
                  fontWeight: 600,
                  fontSize: "15px",
                  border: "none",
                  transition: "transform 0.2s",
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = "scale(1.02)";
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = "scale(1)";
                }}
              >
                I understand - continue session
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
