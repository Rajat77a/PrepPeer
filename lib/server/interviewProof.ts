import "server-only";

import { createHash, createHmac, timingSafeEqual } from "crypto";
import type { FeedbackData } from "@/lib/types";

type EvaluationPayload = {
  kind: "evaluation";
  version: 1;
  userId: string;
  question: string;
  answerHash: string;
  domain: string;
  experience: string;
  sessionId: string;
  questionIndex: number;
  feedback: FeedbackData;
  issuedAt: number;
};

type DetectionPayload = {
  kind: "detection";
  version: 1;
  userId: string;
  answerHash: string;
  isAI: boolean;
  confidence: number;
  reason: string;
  issuedAt: number;
};

type QuestionSetPayload = {
  kind: "questionSet";
  version: 1;
  userId: string;
  sessionId: string;
  domain: string;
  experience: string;
  companyType: string;
  questions: string[];
  issuedAt: number;
};

export type InterviewProofPayload =
  | EvaluationPayload
  | DetectionPayload
  | QuestionSetPayload;

const getSigningSecret = () => {
  const secret = process.env.INTERVIEW_PROOF_SECRET ?? process.env.GROQ_API_KEY;
  if (!secret) throw new Error("Interview proof signing is not configured.");
  return secret;
};

export const hashAnswer = (answer: string) =>
  createHash("sha256").update(answer.trim(), "utf8").digest("hex");

const signEncodedPayload = (encodedPayload: string) =>
  createHmac("sha256", getSigningSecret())
    .update(encodedPayload)
    .digest("base64url");

export const createInterviewProof = (payload: InterviewProofPayload) => {
  const encodedPayload = Buffer.from(JSON.stringify(payload)).toString(
    "base64url"
  );
  return `${encodedPayload}.${signEncodedPayload(encodedPayload)}`;
};

export const verifyInterviewProof = (
  token: unknown,
  expectedKind: InterviewProofPayload["kind"],
  userId: string,
  maxAgeMs = 3 * 60 * 60 * 1000
): InterviewProofPayload | null => {
  if (typeof token !== "string" || token.length > 24_000) return null;

  const [encodedPayload, suppliedSignature, extra] = token.split(".");
  if (!encodedPayload || !suppliedSignature || extra) return null;

  const expectedSignature = signEncodedPayload(encodedPayload);
  const supplied = Buffer.from(suppliedSignature);
  const expected = Buffer.from(expectedSignature);

  if (supplied.length !== expected.length || !timingSafeEqual(supplied, expected)) {
    return null;
  }

  try {
    const payload = JSON.parse(
      Buffer.from(encodedPayload, "base64url").toString("utf8")
    ) as InterviewProofPayload;

    if (
      payload.version !== 1 ||
      payload.kind !== expectedKind ||
      payload.userId !== userId ||
      !Number.isFinite(payload.issuedAt) ||
      payload.issuedAt > Date.now() + 60_000 ||
      Date.now() - payload.issuedAt > maxAgeMs
    ) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
};
