import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { domain, experience, companyType } = await req.json();

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
            content: `Generate exactly 5 deep, specific interview questions for a ${experience} candidate applying for a ${domain} role at a ${companyType} company.

Rules:
- 2 questions must be technical and domain-specific (test actual knowledge, not just opinions)
- 2 questions must be behavioral but require specific examples with measurable outcomes
- 1 question must be a problem-solving scenario with constraints

For ${domain} technical questions: ask about specific concepts, tradeoffs, architecture decisions, or debugging scenarios.
For ${companyType} companies: service = process and communication focus, product = impact and ownership focus, startup = ambiguity and speed focus.

Do NOT ask generic questions like "tell me about yourself" or "what are your strengths".
Return a JSON array of exactly 5 strings. No preamble, no explanation, just the array.`,
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
    const match = text.match(/\[[\s\S]*\]/);

    if (!match) {
      return NextResponse.json({ error: `Could not parse: ${text}` }, { status: 500 });
    }

    const questions = JSON.parse(match[0]);
    return NextResponse.json({ questions });

  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
