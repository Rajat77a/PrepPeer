import type { DimensionScore, FeedbackData, QuestionReviewStatus } from "./types";

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

export const getBoundedString = (
  value: unknown,
  minLength: number,
  maxLength: number
) => {
  if (typeof value !== "string") return null;
  const normalized = value.trim();
  if (normalized.length < minLength || normalized.length > maxLength) return null;
  return normalized;
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
