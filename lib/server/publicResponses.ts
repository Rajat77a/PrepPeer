import "server-only";

import type {
  AISessionSummary,
  DimensionScore,
  QuestionScore,
  QuestionReview,
} from "@/lib/types";
import { isPlainObject } from "@/lib/validation";

const SUMMARY_STATUSES: QuestionReview["status"][] = [
  "answered",
  "ai",
  "gibberish",
  "autoSkipped",
];

const getString = (value: unknown, fallback = "") =>
  typeof value === "string" ? value : fallback;

const getFiniteNumber = (value: unknown, fallback = 0) => {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
};

export const toPublicDimensions = (value: unknown): DimensionScore[] => {
  if (!Array.isArray(value)) return [];

  return value.slice(0, 8).flatMap((item) => {
    if (!isPlainObject(item)) return [];

    return [
      {
        label: getString(item.label, "Score"),
        value: getFiniteNumber(item.value),
        max:
          item.max === undefined ? undefined : getFiniteNumber(item.max, 10),
        color: typeof item.color === "string" ? item.color : undefined,
        reason: typeof item.reason === "string" ? item.reason : undefined,
      },
    ];
  });
};

export const toPublicQuestionScores = (value: unknown): QuestionScore[] => {
  if (!Array.isArray(value)) return [];

  return value.slice(0, 10).flatMap((item) => {
    if (!isPlainObject(item)) return [];

    return [
      {
        question: getString(item.question, "Question"),
        score: getFiniteNumber(item.score),
      },
    ];
  });
};

export const toPublicSessionSummary = (
  value: unknown
): AISessionSummary | undefined => {
  if (!isPlainObject(value)) return undefined;

  const completionReason =
    value.completionReason === "autoSubmitted" ? "autoSubmitted" : "completed";
  const overallSummary = getString(value.overallSummary);
  const needsImprovement = Array.isArray(value.needsImprovement)
    ? value.needsImprovement
        .filter((item): item is string => typeof item === "string")
        .slice(0, 8)
    : [];
  const questionReviews = Array.isArray(value.questionReviews)
    ? value.questionReviews.slice(0, 10).flatMap((item) => {
        if (!isPlainObject(item)) return [];

        const status = SUMMARY_STATUSES.includes(
          item.status as QuestionReview["status"]
        )
          ? (item.status as QuestionReview["status"])
          : "answered";

        return [
          {
            question: getString(item.question, "Question"),
            prompt: getString(item.prompt),
            score: getFiniteNumber(item.score),
            status,
            summary: typeof item.summary === "string" ? item.summary : undefined,
            improvement:
              typeof item.improvement === "string" ? item.improvement : undefined,
            reason: typeof item.reason === "string" ? item.reason : undefined,
          },
        ];
      })
    : [];

  return {
    completionReason,
    overallSummary,
    needsImprovement,
    questionReviews,
  };
};
