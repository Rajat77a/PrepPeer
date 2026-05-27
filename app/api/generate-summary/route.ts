import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { completionReason, questionReviews } = await req.json();
    const apiKey = process.env.GROQ_API_KEY;

    if (!apiKey) {
      return NextResponse.json({ error: "Missing GROQ_API_KEY" }, { status: 500 });
    }

    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
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
- If status is "ai", say the answer was AI-generated and not accepted.
- If status is "gibberish", say it could not be evaluated because it was random or nonsensical.
- If status is "autoSkipped", say the question was not completed because the session auto-submitted.
- If status is "answered", summarize actual performance using the score and reason.
- Do not invent scores.
- Return ONLY valid JSON.

Completion reason: ${completionReason}

Question reviews:
${JSON.stringify(questionReviews, null, 2)}

Return JSON:
{
  "overallSummary": "short paragraph",
  "needsImprovement": ["point 1", "point 2", "point 3"],
  "questionReviews": [
    {
      "question": "Q1",
      "summary": "question-specific summary",
      "improvement": "question-specific improvement advice"
    }
  ]
}`,
          },
        ],
        max_tokens: 1200,
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
      return NextResponse.json({ error: "Could not parse AI summary" }, { status: 500 });
    }

    return NextResponse.json(JSON.parse(match[0]));
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
