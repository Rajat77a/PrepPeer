import type {
  DimensionScore,
  FeedbackData,
  QuestionReview,
  QuestionReviewStatus,
} from "./types";

export const PROFILE_ROLES = [
  "SDE",
  "SDE Fresher",
  "Product Manager",
  "Operations",
  "MBA",
  "Consulting",
  "Data Analyst",
] as const;

export const EXPERIENCE_LEVELS = [
  "Fresher",
  "0-1 years",
  "1-3 years",
  "3-6 years",
  "6+ years",
] as const;

export const COMPANY_TYPES = [
  "FAANG",
  "Product startup",
  "Product Startup",
  "Product Company",
  "Service Company",
  "Consulting firm",
  "Consulting",
  "PSU / Govt",
  "Mid-size tech",
  "Marketplace",
  "Fintech",
  "Consumer App",
  "Logistics",
  "SaaS",
  "Enterprise",
] as const;

export const COMPLETION_REASONS = ["completed", "autoSubmitted"] as const;
export const REVIEW_STATUSES: QuestionReviewStatus[] = [
  "answered",
  "ai",
  "gibberish",
  "autoSkipped",
];

export type InterviewSetup = {
  domain: (typeof PROFILE_ROLES)[number];
  experience: (typeof EXPERIENCE_LEVELS)[number];
  companyType: (typeof COMPANY_TYPES)[number];
};

export const isPlainObject = (
  value: unknown
): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

export const sanitizePlainText = (value: string) =>
  value.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "").trim();

export const escapeHtml = (value: string) =>
  value.replace(/[&<>"']/g, (char) => {
    switch (char) {
      case "&":
        return "&amp;";
      case "<":
        return "&lt;";
      case ">":
        return "&gt;";
      case '"':
        return "&quot;";
      case "'":
        return "&#39;";
      default:
        return char;
    }
  });

export const getBoundedString = (
  value: unknown,
  minLength: number,
  maxLength: number
) => {
  if (typeof value !== "string") return null;
  const normalized = sanitizePlainText(value);
  if (normalized.length < minLength || normalized.length > maxLength) return null;
  return normalized;
};

export const getSafeOptionalString = (
  value: unknown,
  maxLength: number,
  fallback = ""
) => {
  if (typeof value !== "string") return fallback;
  return sanitizePlainText(value).slice(0, maxLength);
};

export const isValidEmail = (value: unknown) => {
  if (typeof value !== "string" || value.length > 254) return false;
  return /^[^\s@<>"]+@[^\s@<>"]+\.[^\s@<>"]+$/.test(sanitizePlainText(value));
};

export const safeDashboardPath = (next: string | null | undefined) => {
  const value = typeof next === "string" ? sanitizePlainText(next) : "";
  if (
    !value ||
    value.length > 300 ||
    !value.startsWith("/dashboard") ||
    value.startsWith("//") ||
    value.includes("\\") ||
    /[\r\n]/.test(value)
  ) {
    return "/dashboard";
  }

  return value;
};

export const isAllowedValue = <T extends readonly string[]>(
  value: unknown,
  allowed: T
): value is T[number] =>
  typeof value === "string" && allowed.includes(value as T[number]);

export const isValidSetup = (value: unknown): value is InterviewSetup => {
  if (!isPlainObject(value)) return false;
  return (
    isAllowedValue(value.domain, PROFILE_ROLES) &&
    isAllowedValue(value.experience, EXPERIENCE_LEVELS) &&
    isAllowedValue(value.companyType, COMPANY_TYPES)
  );
};

export const parseProfileInput = (value: unknown) => {
  if (!isPlainObject(value)) return null;

  const fullName = getBoundedString(value.fullName, 2, 80);
  const college = getBoundedString(value.college, 2, 120);

  if (
    !fullName ||
    !college ||
    !isAllowedValue(value.role, PROFILE_ROLES) ||
    !isAllowedValue(value.experience, EXPERIENCE_LEVELS) ||
    !isAllowedValue(value.company, COMPANY_TYPES)
  ) {
    return null;
  }

  return {
    fullName,
    college,
    role: value.role,
    experience: value.experience,
    company: value.company,
  };
};

export const parseEvaluationInput = (value: unknown) => {
  if (!isPlainObject(value)) return null;

  const question = getBoundedString(value.question, 8, 1200);
  const answer = getBoundedString(value.answer, 1, 8000);
  const questionSetToken = getBoundedString(value.questionSetToken, 20, 24_000);
  const questionIndex = Number(value.questionIndex);

  if (
    !question ||
    !answer ||
    !questionSetToken ||
    !Number.isInteger(questionIndex) ||
    questionIndex < 0 ||
    questionIndex > 4 ||
    !isAllowedValue(value.domain, PROFILE_ROLES) ||
    !isAllowedValue(value.experience, EXPERIENCE_LEVELS)
  ) {
    return null;
  }

  return {
    question,
    answer,
    questionSetToken,
    questionIndex,
    domain: value.domain,
    experience: value.experience,
  };
};

export const parseDetectionInput = (value: unknown) => {
  if (!isPlainObject(value)) return null;
  const answer = getBoundedString(value.answer, 1, 8000);
  return answer ? { answer } : null;
};

export const parseSummaryInput = (value: unknown) => {
  if (
    !isPlainObject(value) ||
    !isAllowedValue(value.completionReason, COMPLETION_REASONS) ||
    !Array.isArray(value.questionReviews) ||
    value.questionReviews.length !== 5
  ) {
    return null;
  }

  const reviews: QuestionReview[] = [];
  const seenQuestions = new Set<string>();

  for (const item of value.questionReviews) {
    if (!isPlainObject(item)) return null;

    const question = getBoundedString(item.question, 2, 4);
    const prompt = getBoundedString(item.prompt, 8, 1200);
    const score = Number(item.score);
    const answer =
      item.answer === undefined
        ? undefined
        : getBoundedString(item.answer, 1, 8000);
    const summary =
      item.summary === undefined
        ? undefined
        : getBoundedString(item.summary, 1, 1000);
    const improvement =
      item.improvement === undefined
        ? undefined
        : getBoundedString(item.improvement, 1, 1000);
    const reason =
      item.reason === undefined
        ? undefined
        : getBoundedString(item.reason, 1, 1000);

    if (
      !question ||
      !/^Q[1-5]$/.test(question) ||
      seenQuestions.has(question) ||
      !prompt ||
      !Number.isFinite(score) ||
      score < 0 ||
      score > 40 ||
      !isAllowedValue(item.status, REVIEW_STATUSES) ||
      (item.answer !== undefined && !answer) ||
      (item.summary !== undefined && !summary) ||
      (item.improvement !== undefined && !improvement) ||
      (item.reason !== undefined && !reason)
    ) {
      return null;
    }

    seenQuestions.add(question);
    reviews.push({
      question,
      prompt,
      score,
      status: item.status,
      answer: answer ?? undefined,
      summary: summary ?? undefined,
      improvement: improvement ?? undefined,
      reason: reason ?? undefined,
    });
  }

  return {
    completionReason: value.completionReason,
    questionReviews: reviews,
  };
};

export const normalizeFeedback = (value: unknown): FeedbackData | null => {
  if (!isPlainObject(value) || !Array.isArray(value.dimensions)) return null;

  const expectedLabels = [
    "Communication",
    "Problem Solving",
    "Specificity",
    "Accuracy",
  ];

  if (value.dimensions.length !== expectedLabels.length) return null;

  const dimensions: DimensionScore[] = [];

  for (let index = 0; index < expectedLabels.length; index += 1) {
    const rawDimension = value.dimensions[index];
    if (!isPlainObject(rawDimension)) return null;

    const numeric = Number(rawDimension.value);
    const reason = getBoundedString(rawDimension.reason, 1, 500);

    if (
      rawDimension.label !== expectedLabels[index] ||
      !Number.isFinite(numeric) ||
      !reason
    ) {
      return null;
    }

    dimensions.push({
      label: expectedLabels[index],
      value: Math.min(10, Math.max(0, numeric)),
      reason,
    });
  }

  const modelAnswer = getBoundedString(value.modelAnswer, 1, 3000);
  if (!modelAnswer) return null;

  return {
    compositeScore: dimensions.reduce(
      (sum, dimension) => sum + dimension.value,
      0
    ),
    dimensions,
    modelAnswer,
  };
};

export const hasSafeJsonContentType = (request: Request) =>
  request.headers.get("content-type")?.toLowerCase().includes("application/json") ??
  false;

export const isRequestBodyWithinLimit = (
  request: Request,
  maxBytes = 32_000
) => {
  const contentLength = Number(request.headers.get("content-length") ?? 0);
  return Number.isFinite(contentLength) && contentLength <= maxBytes;
};

export const readJsonBody = async (
  request: Request,
  maxBytes = 32_000
): Promise<{ ok: true; data: unknown } | { ok: false }> => {
  if (
    !hasSafeJsonContentType(request) ||
    !isRequestBodyWithinLimit(request, maxBytes)
  ) {
    return { ok: false };
  }

  try {
    const body = await request.text();
    if (new TextEncoder().encode(body).byteLength > maxBytes) {
      return { ok: false };
    }

    return { ok: true, data: JSON.parse(body) };
  } catch {
    return { ok: false };
  }
};
