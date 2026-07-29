import "server-only";

import {
  createCipheriv,
  createDecipheriv,
  createHash,
  hkdfSync,
  randomBytes,
} from "crypto";
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
  currentIndex: number;
  issuedAt: number;
};

export type InterviewProofPayload =
  | EvaluationPayload
  | DetectionPayload
  | QuestionSetPayload;

const getSigningSecret = () => {
  const secret =
    process.env.INTERVIEW_PROOF_SECRET ||
    process.env.SESSION_BINDING_SECRET ||
    process.env.GROQ_API_KEY;
  if (!secret) throw new Error("Interview proof encryption is not configured.");
  if (secret.length < 32) {
    throw new Error("Interview proof key material must be at least 32 characters.");
  }
  return secret;
};

export const hashAnswer = (answer: string) =>
  createHash("sha256").update(answer.trim(), "utf8").digest("hex");

const TOKEN_VERSION = "pp1";
const IV_BYTES = 12;
const AUTH_TAG_BYTES = 16;

const getEncryptionKey = () =>
  Buffer.from(
    hkdfSync(
      "sha256",
      getSigningSecret(),
      "PrepPeer interview encryption",
      "interview-proof/aes-256-gcm/v1",
      32
    )
  );

export const createInterviewProof = (payload: InterviewProofPayload) => {
  const iv = randomBytes(IV_BYTES);
  const cipher = createCipheriv("aes-256-gcm", getEncryptionKey(), iv);
  cipher.setAAD(Buffer.from(TOKEN_VERSION, "utf8"));
  const encrypted = Buffer.concat([
    cipher.update(JSON.stringify(payload), "utf8"),
    cipher.final(),
  ]);
  const authTag = cipher.getAuthTag();

  return [
    TOKEN_VERSION,
    iv.toString("base64url"),
    encrypted.toString("base64url"),
    authTag.toString("base64url"),
  ].join(".");
};

export const verifyInterviewProof = (
  token: unknown,
  expectedKind: InterviewProofPayload["kind"],
  userId: string,
  maxAgeMs = 3 * 60 * 60 * 1000
): InterviewProofPayload | null => {
  if (typeof token !== "string" || token.length > 24_000) return null;

  const [version, encodedIv, encodedPayload, encodedAuthTag, extra] =
    token.split(".");
  if (
    version !== TOKEN_VERSION ||
    !encodedIv ||
    !encodedPayload ||
    !encodedAuthTag ||
    extra
  ) {
    return null;
  }

  try {
    const iv = Buffer.from(encodedIv, "base64url");
    const authTag = Buffer.from(encodedAuthTag, "base64url");
    if (iv.length !== IV_BYTES || authTag.length !== AUTH_TAG_BYTES) return null;

    const decipher = createDecipheriv("aes-256-gcm", getEncryptionKey(), iv);
    decipher.setAAD(Buffer.from(TOKEN_VERSION, "utf8"));
    decipher.setAuthTag(authTag);
    const decrypted = Buffer.concat([
      decipher.update(Buffer.from(encodedPayload, "base64url")),
      decipher.final(),
    ]).toString("utf8");
    const payload = JSON.parse(decrypted) as InterviewProofPayload;

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
