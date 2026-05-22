import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { question, answer, domain, experience } = await req.json();

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
            content: `You are a strict technical interviewer evaluating a candidate's answer. Be harsh and accurate — do not give high scores unless the answer truly deserves it.

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
- A random or gibberish answer must score 0-2 on all dimensions
- A vague answer with no examples scores max 4 on Specificity
- Only award 8-10 if the answer is genuinely impressive for a ${experience} level candidate
- compositeScore = weighted average: Communication*0.2 + ProblemSolving*0.25 + Specificity*0.25 + Accuracy*0.3, then multiply by 10

Return ONLY this JSON, no explanation:
{
  "compositeScore": <number 0-100>,
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
    return NextResponse.json({ feedback });

  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
