import type { FeedbackData } from "./types";

export const createZeroFeedback = (reason: string): FeedbackData => ({
  compositeScore: 0,
  dimensions: [
    { label: "Communication", value: 0, reason },
    { label: "Problem Solving", value: 0, reason },
    { label: "Specificity", value: 0, reason },
    { label: "Accuracy", value: 0, reason },
  ],
  modelAnswer:
    "A strong answer should directly address the question, explain the reasoning step by step, include relevant tradeoffs, and use concrete technical details or examples.",
});

export const evaluateAnswerQuality = (answer: unknown, _question?: unknown) => {
  if (typeof answer !== "string") {
    return {
      valid: false,
      reason:
        "The answer could not be evaluated because it does not contain readable text.",
    };
  }

  const normalized = answer.trim().toLowerCase();
  const compact = normalized.replace(/\s+/g, "");
  const letterTokens = normalized.match(/[a-z]+/g) ?? [];
  const letters = letterTokens.join("");
  const uniqueTokens = new Set(letterTokens);

  const tokenCounts = letterTokens.reduce<Record<string, number>>(
    (counts, token) => {
      counts[token] = (counts[token] ?? 0) + 1;
      return counts;
    },
    {}
  );

  const mostRepeatedCount = Math.max(0, ...Object.values(tokenCounts));
  const repeatedTokenRatio = letterTokens.length
    ? mostRepeatedCount / letterTokens.length
    : 1;
  const uniqueTokenRatio = letterTokens.length
    ? uniqueTokens.size / letterTokens.length
    : 0;

  const vowelRatio = letters.length
    ? (letters.match(/[aeiou]/g)?.length ?? 0) / letters.length
    : 0;

  const keyboardPatternCount = letterTokens.filter((token) =>
    /(asdf|qwer|zxcv|hjkl|jkl|dfgh|sdf|fgh|wer|qaz|wsx|poiuy|lkj)/.test(token)
  ).length;

  const repeatedCharacterCount = letterTokens.filter((token) =>
    /(.)\1{3,}/.test(token)
  ).length;

  const symbolRatio = answer.length
    ? (answer.match(/[^a-zA-Z0-9\s.,!?'"():;/-]/g)?.length ?? 0) /
      answer.length
    : 1;

  if (compact.length < 12 || letterTokens.length < 3) {
    return {
      valid: false,
      reason: "The answer is too short to evaluate.",
    };
  }

  const hasReadableWords = letterTokens.some((token) => token.length >= 3);

  const looksLikeRepeatedNoise =
    letterTokens.length >= 6 &&
    (repeatedTokenRatio > 0.55 || uniqueTokenRatio < 0.22);

  const looksLikeKeyboardMash =
    keyboardPatternCount >= 1 ||
    repeatedCharacterCount >= 2 ||
    (letters.length >= 20 && (vowelRatio < 0.12 || vowelRatio > 0.75));

  const mostlySymbols = symbolRatio > 0.35;

  if (
    !hasReadableWords ||
    mostlySymbols ||
    looksLikeRepeatedNoise ||
    looksLikeKeyboardMash
  ) {
    return {
      valid: false,
      reason:
        "The answer appears to be random or nonsensical text, so it cannot receive interview credit.",
    };
  }

  return { valid: true, reason: "" };
};
