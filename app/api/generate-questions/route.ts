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
            content: `Generate exactly 5 high-quality mock interview questions for a ${experience} candidate applying for a ${domain} role at a ${companyType} company.

Question mix:
- 2 role-specific technical questions that test real ${domain} knowledge, tradeoffs, debugging, implementation details, or architecture decisions
- 1 practical problem-solving scenario with a clear constraint, such as time, scale, ambiguity, stakeholder pressure, limited data, or production impact
- 1 behavioral question that requires a specific past example with actions, measurable outcomes, and reflection
- 1 company-fit question tailored to a ${companyType} company environment

Difficulty calibration:
- For Fresher candidates, test fundamentals, reasoning, projects, internships, debugging basics, and clarity under interview pressure
- For 1-3 years, test ownership, real production decisions, tradeoffs, collaboration, and depth beyond textbook answers
- For 3-6 years, test design decisions, incident handling, mentoring, scaling, cross-functional judgment, and business impact
- For 6+ years, test senior judgment, architecture, leadership, ambiguity, prioritization, and long-term technical consequences

Company calibration:
- FAANG: emphasize depth, correctness, scale, structured thinking, and bar-raising examples
- Product startup: emphasize ownership, ambiguity, speed, product impact, and practical tradeoffs
- Consulting firm: emphasize client communication, structured problem solving, prioritization, and business context
- PSU / Govt: emphasize reliability, compliance, process discipline, public impact, and maintainability
- Mid-size tech: emphasize balanced execution, collaboration, ownership, and scalable systems

Do NOT ask generic questions like "tell me about yourself" or "what are your strengths".
Do NOT repeat common internet interview questions unless they are made specific to ${domain}, ${experience}, and ${companyType}.
Each question must be one clear sentence or two short sentences.
Each question must force the candidate to explain reasoning, not just define a concept.

Return a JSON array of exactly 5 strings. No preamble, no markdown, no explanation, just the array.`,
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
