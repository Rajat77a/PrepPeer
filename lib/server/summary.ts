import "server-only";

import type { QuestionReview } from "@/lib/types";
import { logServerError } from "@/lib/server/errorLog";
import { getBoundedString, isPlainObject } from "@/lib/validation";

type SummaryResult = {
  overallSummary: string;
  needsImprovement: string[];
  questionReviews: Pick<
    QuestionReview,
    "question" | "summary" | "improvement"
  >[];
};

const SUMMARY_TIMEOUT_MS = 8_000;

const fallbackSummary = (reviews: QuestionReview[]): SummaryResult => ({
  overallSummary:
    "Review each answer below and focus on clearer reasoning, specific examples, and accurate role-relevant details.",
  needsImprovement: [
    "Answer the exact question before adding supporting context.",
    "Use concrete examples, tradeoffs, and measurable outcomes.",
    "Explain your reasoning in a clear sequence.",
  ],
  questionReviews: reviews.map((review) => ({
    question: review.question,
    summary: review.reason ?? "No detailed summary was available.",
    improvement:
      review.status === "answered"
        ? "Add more question-specific evidence and explain the reasoning."
        : "Submit a complete, original answer to receive useful feedback.",
  })),
});

const normalizeSummary = (
  value: unknown,
  reviews: QuestionReview[]
): SummaryResult | null => {
  if (!isPlainObject(value) || !Array.isArray(value.needsImprovement)) {
    return null;
  }

  const overallSummary = getBoundedString(value.overallSummary, 1, 2000);
  const needsImprovement = value.needsImprovement
    .slice(0, 5)
    .map((item) => getBoundedString(item, 1, 500))
    .filter((item): item is string => Boolean(item));

  if (!overallSummary || needsImprovement.length === 0) return null;

  const rawReviews = Array.isArray(value.questionReviews)
    ? value.questionReviews
    : [];

  return {
    overallSummary,
    needsImprovement,
    questionReviews: reviews.map((review) => {
      const raw = rawReviews.find(
        (item) => isPlainObject(item) && item.question === review.question
      );

      return {
        question: review.question,
        summary:
          (raw &&
            getBoundedString(raw.summary, 1, 1000)) ||
          review.reason ||
          "No detailed summary was available.",
        improvement:
          (raw &&
            getBoundedString(raw.improvement, 1, 1000)) ||
          "Use clearer reasoning and more specific evidence.",
      };
    }),
  };
};

export const generateInterviewSummary = async (
  completionReason: "completed" | "autoSubmitted",
  reviews: QuestionReview[]
) => {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) return fallbackSummary(reviews);

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), SUMMARY_TIMEOUT_MS);

  try {
    const response = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "llama-3.1-8b-instant",
          messages: [
            {
              role: "user",
              content: `Generate a strict but helpful final mock-interview summary.

Rules:
- Use only the supplied statuses, scores, and reasons.
- Do not invent scores or claims.
- Return only valid JSON.

Completion reason: ${completionReason}
Question reviews: ${JSON.stringify(reviews)}

Return:
{
  "overallSummary": "short paragraph",
  "needsImprovement": ["point 1", "point 2", "point 3"],
  "questionReviews": [
    {"question": "Q1", "summary": "summary", "improvement": "advice"}
  ]
}`,
            },
          ],
          max_tokens: 1200,
        }),
        signal: controller.signal,
      }
    );

    if (!response.ok) {
      logServerError("Summary provider failed", {
        status: response.status,
        statusText: response.statusText,
      });
      return fallbackSummary(reviews);
    }
    const json = await response.json();
    const text = json.choices?.[0]?.message?.content ?? "";
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) {
      logServerError("Summary provider returned malformed content", {
        textPreview: text.slice(0, 500),
      });
      return fallbackSummary(reviews);
    }

    const summary = normalizeSummary(JSON.parse(match[0]), reviews);
    if (!summary) {
      logServerError("Summary provider returned invalid payload", {
        payloadPreview: match[0].slice(0, 500),
      });
      return fallbackSummary(reviews);
    }

    return summary;
  } catch (error) {
    logServerError("Summary generation failed", error);
    return fallbackSummary(reviews);
  } finally {
    clearTimeout(timeout);
  }
};
