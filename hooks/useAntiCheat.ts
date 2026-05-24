"use client";

import { useState, useEffect, useCallback, useRef } from "react";

interface AntiCheatState {
  pasteDetected: boolean;
  pasteCharCount: number;
  tabSwitchCount: number;
  timeElapsed: number;
  fastSubmitDetected: boolean;
}

interface UseAntiCheatReturn {
  /** Props to spread onto the textarea element */
  textareaProps: {
    onKeyDown: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
    onContextMenu: (e: React.MouseEvent<HTMLTextAreaElement>) => void;
    onPaste: (e: React.ClipboardEvent<HTMLTextAreaElement>) => void;
  };
  /** Current anti-cheat state */
  state: AntiCheatState;
  /** Number of tab-switch strikes (0-3) */
  strikeCount: number;
  /** Whether the warning modal should be shown */
  showWarningModal: boolean;
  /** Dismiss the warning modal */
  dismissWarning: () => void;
  /** Whether the session should be auto-submitted (3rd strike) */
  shouldAutoSubmit: boolean;
  /** Formatted timer string (MM:SS) */
  timerDisplay: string;
  /** Time elapsed in seconds */
  timeElapsed: number;
  /** Reset timer for new question */
  resetTimer: () => void;
  /** Get submission metadata for current answer */
  getSubmissionMeta: () => {
    timeToSubmitSeconds: number;
    pasteDetected: boolean;
    pasteCharCount: number;
    fastSubmit: boolean;
  };
}

const PASTE_CHAR_THRESHOLD = 80;
const FAST_SUBMIT_THRESHOLD_SECONDS = 15;

export function useAntiCheat(): UseAntiCheatReturn {
  const [state, setState] = useState<AntiCheatState>({
    pasteDetected: false,
    pasteCharCount: 0,
    tabSwitchCount: 0,
    timeElapsed: 0,
    fastSubmitDetected: false,
  });

  const [showWarningModal, setShowWarningModal] = useState(false);
  const [shouldAutoSubmit, setShouldAutoSubmit] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const questionStartTime = useRef<number>(Date.now());

  // ── Layer 1: Keyboard Disabling ─────────────────────────
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      // Block Ctrl+V (Paste), Ctrl+C (Copy), Ctrl+A (Select All)
      if (
        (e.ctrlKey || e.metaKey) &&
        (e.key === "v" || e.key === "V" || e.key === "c" || e.key === "C" || e.key === "a" || e.key === "A")
      ) {
        e.preventDefault();
        return;
      }
    },
    []
  );

  // ── Layer 1: Right-Click Disabling ──────────────────────
  const handleContextMenu = useCallback(
    (e: React.MouseEvent<HTMLTextAreaElement>) => {
      e.preventDefault();
    },
    []
  );

  // ── Layer 2: Paste Event Detection (Silent) ─────────────
  const handlePaste = useCallback(
    (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
      e.preventDefault(); // Also prevent the paste itself

      const pastedText = e.clipboardData.getData("text");
      if (pastedText.length >= PASTE_CHAR_THRESHOLD) {
        setState((prev) => ({
          ...prev,
          pasteDetected: true,
          pasteCharCount: prev.pasteCharCount + pastedText.length,
        }));
      }
    },
    []
  );

  // ── Layer 3: Tab Switch + App Switch Detection ──────────
  // visibilitychange catches tab switches & minimize.
  // window blur/focus catches Alt+Tab, taskbar clicks, switching apps.
  // Debounce prevents double-counting when both fire together.
  const lastSwitchTime = useRef<number>(0);
  const DEBOUNCE_MS = 1000;

  const recordSwitch = useCallback(() => {
    const now = Date.now();
    if (now - lastSwitchTime.current < DEBOUNCE_MS) return; // debounce
    lastSwitchTime.current = now;

    setState((prev) => {
      const newCount = prev.tabSwitchCount + 1;

      if (newCount >= 3) {
        setShouldAutoSubmit(true);
        return { ...prev, tabSwitchCount: newCount };
      }

      setShowWarningModal(true);
      return { ...prev, tabSwitchCount: newCount };
    });
  }, []);

  useEffect(() => {
    // Fires when user switches browser tabs or minimizes
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        // User RETURNED to this tab
        recordSwitch();
      }
    };

    // Fires when browser window loses focus (Alt+Tab, clicking another app)
    const handleWindowBlur = () => {
      // Window lost focus — user went to another app
      // We record the strike immediately on blur (not on return)
      // so even if they don't come back, it's counted
      recordSwitch();
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("blur", handleWindowBlur);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("blur", handleWindowBlur);
    };
  }, [recordSwitch]);

  // ── Layer 4: Answer Timer ───────────────────────────────
  useEffect(() => {
    timerRef.current = setInterval(() => {
      setState((prev) => ({
        ...prev,
        timeElapsed: Math.floor((Date.now() - questionStartTime.current) / 1000),
      }));
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const resetTimer = useCallback(() => {
    questionStartTime.current = Date.now();
    setState((prev) => ({
      ...prev,
      timeElapsed: 0,
      fastSubmitDetected: false,
      // Reset paste state per question
      pasteDetected: false,
      pasteCharCount: 0,
    }));
  }, []);

  const dismissWarning = useCallback(() => {
    setShowWarningModal(false);
  }, []);

  // Format timer display
  const minutes = Math.floor(state.timeElapsed / 60);
  const seconds = state.timeElapsed % 60;
  const timerDisplay = `${minutes.toString().padStart(2, "0")}:${seconds
    .toString()
    .padStart(2, "0")}`;

  // Get metadata for answer submission
  const getSubmissionMeta = useCallback(() => {
    const elapsed = Math.floor(
      (Date.now() - questionStartTime.current) / 1000
    );
    return {
      timeToSubmitSeconds: elapsed,
      pasteDetected: state.pasteDetected,
      pasteCharCount: state.pasteCharCount,
      fastSubmit: elapsed < FAST_SUBMIT_THRESHOLD_SECONDS,
    };
  }, [state.pasteDetected, state.pasteCharCount]);

  return {
    textareaProps: {
      onKeyDown: handleKeyDown,
      onContextMenu: handleContextMenu,
      onPaste: handlePaste,
    },
    state,
    strikeCount: state.tabSwitchCount,
    showWarningModal,
    dismissWarning,
    shouldAutoSubmit,
    timerDisplay,
    timeElapsed: state.timeElapsed,
    resetTimer,
    getSubmissionMeta,
  };
}
