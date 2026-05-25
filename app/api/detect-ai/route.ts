import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { answer } = await req.json();

    // Don't flag very short answers as AI
    if (answer.trim().split(/\s+/).length < 15) {
      return NextResponse.json({ isAI: false, confidence: 0, reason: "Answer too short to analyze" });
    }

    const apiKey = process.env.GROQ_API_KEY;

    if (!apiKey) {
      return NextResponse.json({ isAI: false, confidence: 0, reason: "Detection unavailable" });
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
            content: `You are an AI detection expert. Analyze if this interview answer was written by AI.

Answer: "${answer}"

IMPORTANT RULES:
- Gibberish, random characters, or keyboard mashing is NOT AI — it is a human typing nonsense. Mark as isAI: false.
- Only mark as AI if the answer is coherent, well-structured, and shows clear signs of AI writing
- AI signs: perfect grammar, no personal pronouns, generic language, phrases like "It's important to", "Furthermore", "In conclusion", no real personal examples
- Human signs: typos, casual language, personal stories, incomplete sentences, emotional language

Return ONLY this JSON:
{
  "isAI": <true or false>,
  "confidence": <number 0-100>,
  "reason": "<one sentence>"
}`,
          },
        ],
        max_tokens: 200,
      }),
    });

    const json = await res.json();
    const text = json.choices?.[0]?.message?.content ?? "";
    const match = text.match(/\{[\s\S]*\}/);

    if (!match) {
      return NextResponse.json({ isAI: false, confidence: 0, reason: "Could not analyze" });
    }

    const result = JSON.parse(match[0]);

    // Only flag if confidence is very high (above 85%)
    if (result.confidence < 85) {
      result.isAI = false;
    }

    return NextResponse.json(result);

  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
