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
  "Lead Site Reliability Engineer (SRE)",
] as const;

export const EXPERIENCE_LEVELS = [
  "Fresher",
  "0-1 years",
  "1-3 years",
  "3-6 years",
  "6+ years",
  "Senior (7+ Years)",
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
  "skipped",
  "autoSkipped",
];

export type InterviewSetup = {
  domain: string;
  experience: (typeof EXPERIENCE_LEVELS)[number];
  companyType: string;
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

export const getBoundedNumber = (
  value: unknown,
  min: number,
  max: number,
  integerOnly = false
) => {
  if (typeof value !== "number" || !Number.isFinite(value)) return null;
  if (integerOnly && !Number.isInteger(value)) return null;
  if (value < min || value > max) return null;
  return value;
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

export const safeAuthenticatedPath = (next: string | null | undefined) => {
  const value = typeof next === "string" ? sanitizePlainText(next) : "";
  const allowedPrefixes = ["/dashboard", "/interview", "/results"];

  if (
    !value ||
    value.length > 300 ||
    value.startsWith("//") ||
    value.includes("\\") ||
    /[\r\n]/.test(value) ||
    !allowedPrefixes.some(
      (prefix) => value === prefix || value.startsWith(`${prefix}/`) || value.startsWith(`${prefix}?`)
    )
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
  const domain = getBoundedString(value.domain, 2, 80);
  const companyType = getBoundedString(value.companyType, 2, 80);

  return (
    Boolean(domain) &&
    isAllowedValue(value.experience, EXPERIENCE_LEVELS) &&
    Boolean(companyType)
  );
};

export const parseProfileInput = (value: unknown) => {
  if (!isPlainObject(value)) return null;

  const fullName = getBoundedString(value.fullName, 2, 80);
  const college = getBoundedString(value.college, 2, 120);
  const role = getBoundedString(value.role, 2, 80);
  const company = getBoundedString(value.company, 2, 80);

  if (
    !fullName ||
    !college ||
    !role ||
    !isAllowedValue(value.experience, EXPERIENCE_LEVELS) ||
    !company
  ) {
    return null;
  }

  return {
    fullName,
    college,
    role,
    experience: value.experience,
    company,
  };
};

export const parseEvaluationInput = (value: unknown) => {
  if (!isPlainObject(value)) return null;

  const question = getBoundedString(value.question, 8, 1200);
  const answer = getBoundedString(value.answer, 1, 8000);
  const questionSetToken = getBoundedString(value.questionSetToken, 20, 24_000);
  const questionIndex = getBoundedNumber(value.questionIndex, 0, 4, true);
  const domain = getBoundedString(value.domain, 2, 80);

  if (
    !question ||
    !answer ||
    !questionSetToken ||
    questionIndex === null ||
    !domain ||
    !isAllowedValue(value.experience, EXPERIENCE_LEVELS)
  ) {
    return null;
  }

  return {
    question,
    answer,
    questionSetToken,
    questionIndex,
    domain,
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
    const score = getBoundedNumber(item.score, 0, 40);
    const answer =
      item.answer === undefined
        ? undefined
        : getBoundedString(item.answer, 1, 8000);
    const summary =
      item.summary === undefined
        ? undefined
        : getBoundedString(item.summary, 1, 1000);
    const modelAnswer =
      item.modelAnswer === undefined
        ? undefined
        : getBoundedString(item.modelAnswer, 1, 3000);
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
      score === null ||
      !isAllowedValue(item.status, REVIEW_STATUSES) ||
      (item.answer !== undefined && !answer) ||
      (item.summary !== undefined && !summary) ||
      (item.modelAnswer !== undefined && !modelAnswer) ||
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
      modelAnswer: modelAnswer ?? undefined,
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

    const numeric = getBoundedNumber(rawDimension.value, 0, 10);
    const reason = getBoundedString(rawDimension.reason, 1, 500);

    if (
      rawDimension.label !== expectedLabels[index] ||
      numeric === null ||
      !reason
    ) {
      return null;
    }

    dimensions.push({
      label: expectedLabels[index],
      value: numeric,
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

const HONEYPOT_FIELDS = new Set([
  "_gotcha",
  "honeypot",
  "botField",
  "hiddenField",
  "website",
  "homepage",
  "fax",
]);

const SUSPICIOUS_PATTERNS = [
  {
    name: "script tag",
    pattern: /<\s*\/?\s*script\b/i,
  },
  {
    name: "javascript url",
    pattern: /\bjavascript\s*:/i,
  },
  {
    name: "inline event handler",
    pattern: /\bon(?:error|load|click|mouseover|focus|submit)\s*=/i,
  },
  {
    name: "sql injection marker",
    pattern:
      /(?:--|\/\*|\*\/|;\s*(?:drop|delete|insert|update|select)\b|'\s*(?:or|and)\s*'?\d+'?\s*=\s*'?\d+|\b(?:or|and)\s+\d+\s*=\s*\d+)/i,
  },
  {
    name: "destructive sql",
    pattern:
      /\b(?:drop\s+(?:table|database|schema)|alter\s+table|truncate\s+table|delete\s+from|insert\s+into)\b/i,
  },
  {
    name: "union query",
    pattern: /\bunion\s+(?:all\s+)?select\b/i,
  },
];

type AbuseMatch = {
  fieldPath: string;
  reason: string;
};

const isFilledHoneypot = (value: unknown) => {
  if (typeof value === "string") return sanitizePlainText(value).length > 0;
  if (typeof value === "number" || typeof value === "boolean") return true;
  if (Array.isArray(value)) return value.length > 0;
  return value !== null && value !== undefined;
};

export const findAbusePattern = (
  value: unknown,
  fieldPath = "body",
  depth = 0
): AbuseMatch | null => {
  if (depth > 8) {
    return { fieldPath, reason: "payload nesting is too deep" };
  }

  if (typeof value === "string") {
    if (value.length > 24_000) {
      return { fieldPath, reason: "string exceeds abuse threshold" };
    }

    for (const { name, pattern } of SUSPICIOUS_PATTERNS) {
      if (pattern.test(value)) {
        return { fieldPath, reason: name };
      }
    }

    return null;
  }

  if (Array.isArray(value)) {
    if (value.length > 50) {
      return { fieldPath, reason: "array exceeds abuse threshold" };
    }

    for (let index = 0; index < value.length; index += 1) {
      const match = findAbusePattern(
        value[index],
        `${fieldPath}[${index}]`,
        depth + 1
      );
      if (match) return match;
    }

    return null;
  }

  if (isPlainObject(value)) {
    const entries = Object.entries(value);
    if (entries.length > 80) {
      return { fieldPath, reason: "object has too many fields" };
    }

    for (const [key, child] of entries) {
      if (HONEYPOT_FIELDS.has(key) && isFilledHoneypot(child)) {
        return { fieldPath: `${fieldPath}.${key}`, reason: "honeypot field" };
      }

      const match = findAbusePattern(child, `${fieldPath}.${key}`, depth + 1);
      if (match) return match;
    }
  }

  return null;
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
