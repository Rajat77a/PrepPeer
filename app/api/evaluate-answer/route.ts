import { NextRequest, NextResponse } from "next/server";

const clampDimensionScore = (value: unknown) => {
  const numeric = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(numeric)) return 0;
  return Math.min(10, Math.max(0, numeric));
};

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

const createZeroFeedback = (reason: string) => ({
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

const hasEnoughReadableContent = (answer: unknown) => {
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
  const repeatedCharacterCount = letterTokens.filter((token) => /(.)\1{3,}/.test(token)).length;
  const shortNoiseRatio = letterTokens.length
    ? letterTokens.filter((token) => token.length <= 2 && !COMMON_WORDS.has(token)).length / letterTokens.length
    : 1;

  if (compact.length < 40 || letterTokens.length < 8) {
    return {
      valid: false,
      reason: "The answer is too short or lacks enough readable content to evaluate.",
    };
  }

  const looksLikeKeyboardMash =
    keyboardPatternCount >= 2 ||
    repeatedCharacterCount >= 2 ||
    shortNoiseRatio > 0.45 ||
    vowelRatio < 0.16 ||
    vowelRatio > 0.62;

  const lacksLanguageStructure =
    commonWordRatio < 0.16 &&
    (uniqueTokenRatio < 0.5 || repeatedTokenRatio > 0.25 || looksLikeKeyboardMash);

  if (looksLikeKeyboardMash || lacksLanguageStructure) {
    return {
      valid: false,
      reason: "The answer appears to be random or nonsensical text, so it cannot receive interview credit.",
    };
  }

  return { valid: true, reason: "" };
};

export async function POST(req: NextRequest) {
  try {
    const { question, answer, domain, experience } = await req.json();

    const answerQuality = hasEnoughReadableContent(answer);
    if (!answerQuality.valid) {
      return NextResponse.json({ feedback: createZeroFeedback(answerQuality.reason) });
    }

    const apiKey = process.env.GROQ_API_KEY;

    if (!apiKey) {
      return NextResponse.json({ error: "Missing API key" }, { status: 500 });
    }

    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "llama-3.1-8b-instant",
        messages: [
          {
            role: "user",
            content: `You are a strict technical interviewer evaluating a candidate's answer. Be harsh and accurate - do not give high scores unless the answer truly deserves it.

Question: ${question}
Candidate Level: ${experience}
Domain: ${domain}
Answer: ${answer}

Evaluate strictly on these 4 dimensions (score each out of 10):

1. Communication (0-10): Is the answer clear, structured, and easy to follow?
2. Problem Solving (0-10): Does the answer show logical thinking and a clear approach?
3. Specificity (0-10): Does the answer use concrete examples, numbers, metrics, or real scenarios? Vague answers score 0-3.
4. Accuracy (0-10): Is the technical/factual content of the answer actually correct for ${domain}? Wrong or shallow answers score 0-4.

Scoring rules:
- If the answer is random, unreadable, nonsensical, or mostly meaningless characters, score 0 on all dimensions
- If you cannot understand the candidate's content well enough to evaluate it, score 0 on all dimensions
- A random or gibberish answer must never receive credit for communication, problem solving, specificity, or accuracy
- A vague answer with no examples scores max 4 on Specificity
- Only award 8-10 if the answer is genuinely impressive for a ${experience} level candidate
- compositeScore = Communication + ProblemSolving + Specificity + Accuracy

Return ONLY this JSON, no explanation:
{
  "compositeScore": <number 0-40>,
  "dimensions": [
    {"label": "Communication", "value": <0-10>, "reason": "<one sentence why>"},
    {"label": "Problem Solving", "value": <0-10>, "reason": "<one sentence why>"},
    {"label": "Specificity", "value": <0-10>, "reason": "<one sentence why>"},
    {"label": "Accuracy", "value": <0-10>, "reason": "<one sentence why>"}
  ],
  "modelAnswer": "<a strong 3-4 sentence model answer for this question at ${experience} level>"
}`,
          },
        ],
        max_tokens: 1024,
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      return NextResponse.json({ error: `API error: ${errText}` }, { status: 500 });
    }

    const json = await res.json();
    const text = json.choices?.[0]?.message?.content ?? "";
    const match = text.match(/\{[\s\S]*\}/);

    if (!match) {
      return NextResponse.json({ error: `Could not parse: ${text}` }, { status: 500 });
    }

    const feedback = JSON.parse(match[0]);
    const dimensions = Array.isArray(feedback.dimensions)
      ? feedback.dimensions.map((dimension: { label?: string; value?: unknown; reason?: string }) => ({
          ...dimension,
          value: clampDimensionScore(dimension.value),
        }))
      : [];
    const compositeScore = dimensions.reduce(
      (sum: number, dimension: { value: number }) => sum + dimension.value,
      0
    );

    feedback.dimensions = dimensions;
    feedback.compositeScore = compositeScore;
    return NextResponse.json({ feedback });

  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
