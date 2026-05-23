"use client";

import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, X } from "lucide-react";

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
            className="relative max-w-md w-full mx-6 rounded-3xl overflow-hidden"
            style={{
              background: "#fff",
              boxShadow: "0 32px 80px rgba(0,0,0,0.2)",
            }}
          >
            {/* Top accent bar */}
            <div
              style={{
                height: "4px",
                background: isLastWarning
                  ? "linear-gradient(90deg, #FF6B3D, #FF4444)"
                  : "linear-gradient(90deg, #FFBE3D, #FF801E)",
              }}
            />

            <div className="p-8">
              {/* Icon */}
              <div
                className="flex items-center justify-center mx-auto mb-5"
                style={{
                  width: "56px",
                  height: "56px",
                  borderRadius: "16px",
                  background: isLastWarning
                    ? "rgba(255,107,61,0.1)"
                    : "rgba(255,190,61,0.1)",
                }}
              >
                <AlertTriangle
                  size={28}
                  strokeWidth={1.8}
                  color={isLastWarning ? "#FF6B3D" : "#FFBE3D"}
                />
              </div>

              {/* Title */}
              <h3
                className="font-fustat text-center mb-3"
                style={{ fontWeight: 800, fontSize: "20px", color: "#0A0A0F" }}
              >
                {isLastWarning ? "Final Warning" : "Tab Switch Detected"}
              </h3>

              {/* Description */}
              <p
                className="font-inter text-center mb-2"
                style={{
                  fontSize: "15px",
                  color: "#6B7280",
                  lineHeight: 1.65,
                }}
              >
                {isLastWarning
                  ? "You've switched tabs twice during this session. One more tab switch will automatically submit your session."
                  : "You left the PrepPeer tab during your interview session. This has been recorded."}
              </p>

              {/* Strike counter */}
              <div className="flex items-center justify-center gap-2 my-5">
                {[1, 2].map((s) => (
                  <div
                    key={s}
                    className="flex items-center justify-center rounded-full"
                    style={{
                      width: "32px",
                      height: "32px",
                      background:
                        s <= strikeCount
                          ? isLastWarning
                            ? "rgba(255,107,61,0.15)"
                            : "rgba(255,190,61,0.15)"
                          : "rgba(0,0,0,0.04)",
                      border: `1.5px solid ${
                        s <= strikeCount
                          ? isLastWarning
                            ? "rgba(255,107,61,0.4)"
                            : "rgba(255,190,61,0.4)"
                          : "rgba(0,0,0,0.08)"
                      }`,
                    }}
                  >
                    <span
                      className="font-inter"
                      style={{
                        fontSize: "12px",
                        fontWeight: 700,
                        color:
                          s <= strikeCount
                            ? isLastWarning
                              ? "#CC4422"
                              : "#996600"
                            : "#C0C0C0",
                      }}
                    >
                      {s}
                    </span>
                  </div>
                ))}
              </div>

              <p
                className="font-inter text-center"
                style={{
                  fontSize: "13px",
                  fontWeight: 600,
                  color: isLastWarning ? "#CC4422" : "#996600",
                }}
              >
                Warning: {strikeCount} of 2 strikes used
              </p>

              {/* Dismiss button */}
              <button
                onClick={onDismiss}
                className="w-full mt-6 cursor-pointer"
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
                onMouseOver={(e) =>
                  (e.currentTarget.style.transform = "scale(1.02)")
                }
                onMouseOut={(e) =>
                  (e.currentTarget.style.transform = "scale(1)")
                }
              >
                I understand — continue session
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
