import "server-only";

import { logServerError } from "@/lib/server/errorLog";

export type AgentModelTier = "fast" | "strong";

type AgentMessage = {
  role: "system" | "user";
  content: string;
};

type RunJsonAgentOptions<T> = {
  agent: string;
  tier: AgentModelTier;
  messages: AgentMessage[];
  maxTokens: number;
  validate: (value: unknown) => T | null;
  timeoutMs?: number;
};

const GROQ_CHAT_URL = "https://api.groq.com/openai/v1/chat/completions";
const DEFAULT_FAST_MODEL = "openai/gpt-oss-20b";
const DEFAULT_STRONG_MODEL = "openai/gpt-oss-120b";

const getModel = (tier: AgentModelTier) =>
  tier === "fast"
    ? process.env.GROQ_FAST_MODEL || DEFAULT_FAST_MODEL
    : process.env.GROQ_STRONG_MODEL || DEFAULT_STRONG_MODEL;

const extractJson = (content: string): unknown => {
  const trimmed = content.trim().replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "");

  try {
    return JSON.parse(trimmed);
  } catch {
    const objectStart = trimmed.indexOf("{");
    const arrayStart = trimmed.indexOf("[");
    const starts = [objectStart, arrayStart].filter((index) => index >= 0);
    if (starts.length === 0) throw new Error("Agent returned no JSON payload.");

    const start = Math.min(...starts);
    const closing = trimmed[start] === "{" ? "}" : "]";
    const end = trimmed.lastIndexOf(closing);
    if (end <= start) throw new Error("Agent returned incomplete JSON.");
    return JSON.parse(trimmed.slice(start, end + 1));
  }
};

export class AgentProviderError extends Error {
  status?: number;

  constructor(message: string, status?: number) {
    super(message);
    this.name = "AgentProviderError";
    this.status = status;
  }
}

export const isAgentConfigured = () => Boolean(process.env.GROQ_API_KEY);

export const runJsonAgent = async <T>({
  agent,
  tier,
  messages,
  maxTokens,
  validate,
  timeoutMs = 7_000,
}: RunJsonAgentOptions<T>): Promise<T> => {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) throw new AgentProviderError("GROQ_API_KEY is not configured.");

  const model = getModel(tier);
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  const startedAt = Date.now();

  try {
    const response = await fetch(GROQ_CHAT_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages,
        max_tokens: maxTokens,
        temperature: tier === "fast" ? 0.65 : 0.2,
        reasoning_effort: tier === "fast" ? "low" : "medium",
        response_format: { type: "json_object" },
      }),
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new AgentProviderError(
        `${agent} provider request failed.`,
        response.status
      );
    }

    const payload: unknown = await response.json();
    const content =
      typeof payload === "object" &&
      payload !== null &&
      "choices" in payload &&
      Array.isArray(payload.choices) &&
      typeof payload.choices[0]?.message?.content === "string"
        ? payload.choices[0].message.content
        : "";

    const result = validate(extractJson(content));
    if (!result) throw new AgentProviderError(`${agent} returned invalid JSON.`);

    return result;
  } catch (error) {
    logServerError(`${agent} agent failed`, error, {
      agent,
      tier,
      model,
      durationMs: Date.now() - startedAt,
    });
    throw error;
  } finally {
    clearTimeout(timeout);
  }
};
