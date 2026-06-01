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

const GENERIC_FILLER_WORDS = new Set([
  "answer",
  "aspect",
  "aspects",
  "best",
  "better",
  "careful",
  "carefully",
  "clear",
  "decision",
  "detail",
  "details",
  "good",
  "great",
  "handle",
  "important",
  "interviewer",
  "improve",
  "issue",
  "logic",
  "meaningful",
  "proper",
  "question",
  "reason",
  "score",
  "solution",
  "step",
  "steps",
  "test",
  "thing",
  "things",
  "understand",
  "way",
]);

const ACTION_OR_DOMAIN_WORDS = new Set([
  "audit",
  "benchmark",
  "compare",
  "debug",
  "define",
  "design",
  "diagnose",
  "estimate",
  "experiment",
  "inspect",
  "instrument",
  "investigate",
  "measure",
  "mitigate",
  "monitor",
  "prioritize",
  "review",
  "rollback",
  "segment",
  "test",
  "tradeoff",
  "validate",
]);

const META_OR_NON_ANSWER_PATTERNS = [
  /\bi\s+(do\s+not|don't|dont|cannot|can't|cant)\s+(know|understand|answer)/,
  /\b(no|not)\s+(idea|answer|clue)\b/,
  /\b(this|that)\s+is\s+(a\s+)?(test|sample|dummy|placeholder)\b/,
  /\b(testing|checking)\s+(the\s+)?(ai|score|scoring|system|website|app)\b/,
  /\b(fill|filling|filled)\s+(the\s+)?(word|words|limit|minimum)\b/,
  /\b(just|only)\s+(typing|writing|adding|testing|checking)\b/,
  /\bignore\s+(this|the)\s+(answer|response|text)\b/,
];

const tokenize = (value: string) => value.toLowerCase().match(/[a-z][a-z0-9]+/g) ?? [];

const getContentTokens = (value: string) =>
  tokenize(value).filter((token) => token.length >= 4 && !COMMON_WORDS.has(token));

const hasSubstanceSignals = (tokens: string[], answer: string) => {
  const concreteTokens = tokens.filter((token) => !GENERIC_FILLER_WORDS.has(token));
  const hasNumberOrMetric = /\b\d+(\.\d+)?\s*(%|ms|s|sec|seconds|users|requests|qps|rps|x|k|m)?\b/i.test(answer);
  const hasCausalReasoning =
    /\b(because|therefore|tradeoff|trade-offs|risk|impact|measure|metric|latency|scale|cost|constraint|validate|prioritize|monitor|debug|root cause)\b/i.test(answer);
  const actionSignalCount = concreteTokens.filter((token) =>
    ACTION_OR_DOMAIN_WORDS.has(token)
  ).length;

  return (
    concreteTokens.length >= 4 &&
    (hasNumberOrMetric || hasCausalReasoning || actionSignalCount >= 2)
  );
};

const evaluateQuestionRelevance = (answer: string, question?: unknown) => {
  if (typeof question !== "string" || !question.trim()) {
    return { valid: true, reason: "" };
  }

  const normalizedAnswer = answer.trim().toLowerCase();

  if (META_OR_NON_ANSWER_PATTERNS.some((pattern) => pattern.test(normalizedAnswer))) {
    return {
      valid: false,
      reason:
        "The response is a non-answer or meta response rather than an attempt to answer the interview question.",
    };
  }

  const questionTokens = new Set(getContentTokens(question));
  const answerTokens = getContentTokens(answer);
  const answerTokenSet = new Set(answerTokens);
  const overlapCount = Array.from(questionTokens).filter((token) =>
    answerTokenSet.has(token)
  ).length;
  const overlapRatio = questionTokens.size ? overlapCount / questionTokens.size : 1;

  const hasEnoughQuestionOverlap =
    overlapCount >= 2 || (overlapCount >= 1 && overlapRatio >= 0.18);

  if (!hasEnoughQuestionOverlap && !hasSubstanceSignals(answerTokens, answer)) {
    return {
      valid: false,
      reason:
        "The response does not directly address the question with relevant interview content.",
    };
  }

  if (!hasSubstanceSignals(answerTokens, answer) && overlapCount < 3) {
    return {
      valid: false,
      reason:
        "The response is too generic to show a real attempt at the interview question.",
    };
  }

  return { valid: true, reason: "" };
};

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

export const evaluateAnswerQuality = (answer: unknown, question?: unknown) => {
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

  const relevance = evaluateQuestionRelevance(answer, question);
  if (!relevance.valid) return relevance;

  return { valid: true, reason: "" };
};
