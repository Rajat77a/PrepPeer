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
  textareaProps: {
    onKeyDown: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
    onContextMenu: (e: React.MouseEvent<HTMLTextAreaElement>) => void;
    onPaste: (e: React.ClipboardEvent<HTMLTextAreaElement>) => void;
    onCopy: (e: React.ClipboardEvent<HTMLTextAreaElement>) => void;
    onCut: (e: React.ClipboardEvent<HTMLTextAreaElement>) => void;
  };
  state: AntiCheatState;
  strikeCount: number;
  showWarningModal: boolean;
  dismissWarning: () => void;
  shouldAutoSubmit: boolean;
  timerDisplay: string;
  timeElapsed: number;
  resetTimer: () => void;
  getSubmissionMeta: () => {
    timeToSubmitSeconds: number;
    pasteDetected: boolean;
    pasteCharCount: number;
    fastSubmit: boolean;
  };
}

const PASTE_CHAR_THRESHOLD = 80;
const FAST_SUBMIT_THRESHOLD_SECONDS = 15;
const DEBOUNCE_MS = 1000;
const BLOCKED_KEYS = new Set(["a", "c", "v", "x"]);

export function useAntiCheat(active: boolean = false): UseAntiCheatReturn {
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
  const lastSwitchTime = useRef<number>(0);
  const wasActive = useRef(false);

  const blockShortcut = useCallback((e: KeyboardEvent | React.KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && BLOCKED_KEYS.has(e.key.toLowerCase())) {
      e.preventDefault();
    }
  }, []);

  // ── Layer 1: Keyboard Disabling ─────────────────────────
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      blockShortcut(e);
    },
    [blockShortcut]
  );

  // ── Layer 1: Right-Click Disabling ──────────────────────
  const handleContextMenu = useCallback(
    (e: React.MouseEvent<HTMLTextAreaElement>) => {
      e.preventDefault();
    },
    []
  );

  // ── Layer 2: Paste Event Detection ──────────────────────
  const handlePaste = useCallback(
    (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
      e.preventDefault();
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

  // ── Layer 2: Copy Disabling ──────────────────────────────
  const handleCopy = useCallback(
    (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
      e.preventDefault();
    },
    []
  );

  // ── Layer 2: Cut Disabling ───────────────────────────────
  const handleCut = useCallback(
    (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
      e.preventDefault();
    },
    []
  );

  useEffect(() => {
    if (!active) return;

    const preventDefault = (e: Event) => e.preventDefault();
    const handleDocumentPaste = (e: ClipboardEvent) => {
      e.preventDefault();
      const pastedText = e.clipboardData?.getData("text") ?? "";

      if (pastedText.length >= PASTE_CHAR_THRESHOLD) {
        setState((prev) => ({
          ...prev,
          pasteDetected: true,
          pasteCharCount: prev.pasteCharCount + pastedText.length,
        }));
      }
    };

    document.addEventListener("keydown", blockShortcut);
    document.addEventListener("contextmenu", preventDefault);
    document.addEventListener("copy", preventDefault);
    document.addEventListener("cut", preventDefault);
    document.addEventListener("paste", handleDocumentPaste);

    return () => {
      document.removeEventListener("keydown", blockShortcut);
      document.removeEventListener("contextmenu", preventDefault);
      document.removeEventListener("copy", preventDefault);
      document.removeEventListener("cut", preventDefault);
      document.removeEventListener("paste", handleDocumentPaste);
    };
  }, [active, blockShortcut]);

  // ── Layer 3: Tab Switch Detection ───────────────────────
  const recordSwitch = useCallback(() => {
    if (!active) return;
    const now = Date.now();
    if (now - lastSwitchTime.current < DEBOUNCE_MS) return;
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
  }, [active]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        recordSwitch();
      }
    };

    const handleWindowBlur = () => {
      if (document.hidden) return;
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
    if (!active) {
      wasActive.current = false;
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      return;
    }

    if (!wasActive.current) {
      wasActive.current = true;
      questionStartTime.current = Date.now();
      setState((prev) => ({ ...prev, timeElapsed: 0 }));
    }

    timerRef.current = setInterval(() => {
      setState((prev) => ({
        ...prev,
        timeElapsed: Math.floor((Date.now() - questionStartTime.current) / 1000),
      }));
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [active]);

  const resetTimer = useCallback(() => {
    questionStartTime.current = Date.now();
    setState((prev) => ({
      ...prev,
      timeElapsed: 0,
      fastSubmitDetected: false,
      pasteDetected: false,
      pasteCharCount: 0,
    }));
  }, []);

  const dismissWarning = useCallback(() => {
    setShowWarningModal(false);
  }, []);

  const minutes = Math.floor(state.timeElapsed / 60);
  const seconds = state.timeElapsed % 60;
  const timerDisplay = `${minutes.toString().padStart(2, "0")}:${seconds
    .toString()
    .padStart(2, "0")}`;

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
      onCopy: handleCopy,
      onCut: handleCut,
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
