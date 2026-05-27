import type { FeedbackData } from "./types";

const COMMON_WORDS = new Set([
  "a",
  "about",
  "after",
  "also",
  "an",
  "and",
  "are",
  "as",
  "at",
  "because",
  "be",
  "by",
  "can",
  "could",
  "data",
  "do",
  "for",
  "from",
  "had",
  "have",
  "how",
  "i",
  "if",
  "in",
  "is",
  "it",
  "more",
  "my",
  "need",
  "not",
  "of",
  "on",
  "or",
  "process",
  "question",
  "should",
  "so",
  "system",
  "that",
  "the",
  "their",
  "then",
  "there",
  "this",
  "to",
  "use",
  "user",
  "users",
  "was",
  "we",
  "when",
  "which",
  "will",
  "with",
  "would",
]);

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

export const evaluateAnswerQuality = (answer: unknown) => {
  if (typeof answer !== "string") {
    return {
      valid: false,
      reason: "The answer could not be evaluated because it does not contain readable text.",
    };
  }

  const normalized = answer.trim().toLowerCase();
  const compact = normalized.replace(/\s+/g, "");
  const letterTokens = normalized.match(/[a-z]+/g) ?? [];
  const letters = letterTokens.join("");
  const uniqueTokens = new Set(letterTokens);
  const tokenCounts = letterTokens.reduce<Record<string, number>>((counts, token) => {
    counts[token] = (counts[token] ?? 0) + 1;
    return counts;
  }, {});
  const mostRepeatedCount = Math.max(0, ...Object.values(tokenCounts));
  const repeatedTokenRatio = letterTokens.length ? mostRepeatedCount / letterTokens.length : 1;
  const uniqueTokenRatio = letterTokens.length ? uniqueTokens.size / letterTokens.length : 0;
  const commonWordRatio = letterTokens.length
    ? letterTokens.filter((token) => COMMON_WORDS.has(token)).length / letterTokens.length
    : 0;
  const vowelRatio = letters.length
    ? (letters.match(/[aeiou]/g)?.length ?? 0) / letters.length
    : 0;
  const keyboardPatternCount = letterTokens.filter((token) =>
    /(asdf|qwer|zxcv|hjkl|jkl|dfgh|sdf|fgh|wer|qaz|wsx|poiuy|lkj)/.test(token)
  ).length;
  const repeatedCharacterCount = letterTokens.filter((token) => /(.)\1{2,}/.test(token)).length;
  const shortNoiseRatio = letterTokens.length
    ? letterTokens.filter((token) => token.length <= 2 && !COMMON_WORDS.has(token)).length / letterTokens.length
    : 1;
  const singleCharacterRatio = letterTokens.length
    ? letterTokens.filter((token) => token.length === 1 && !COMMON_WORDS.has(token)).length / letterTokens.length
    : 1;

  if (compact.length < 40 || letterTokens.length < 8) {
    return {
      valid: false,
      reason: "The answer is too short or lacks enough readable content to evaluate.",
    };
  }

  const looksLikeRepeatedNoise =
    repeatedTokenRatio > 0.22 ||
    uniqueTokenRatio < 0.35 ||
    singleCharacterRatio > 0.3 ||
    shortNoiseRatio > 0.4;

  const looksLikeKeyboardMash =
    keyboardPatternCount >= 1 ||
    repeatedCharacterCount >= 1 ||
    vowelRatio < 0.16 ||
    vowelRatio > 0.62;

  if (looksLikeRepeatedNoise || (commonWordRatio < 0.16 && looksLikeKeyboardMash)) {
    return {
      valid: false,
      reason: "The answer appears to be random or nonsensical text, so it cannot receive interview credit.",
    };
  }

  return { valid: true, reason: "" };
};
