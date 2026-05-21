import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { domain, experience, companyType } = await req.json();

  const apiKey = process.env.GEMINI_API_KEY;

  const message = `Generate exactly 5 interview questions for a ${experience} candidate applying for ${domain} role at a ${companyType}. Mix behavioral and technical questions. For service companies focus on communication and process. For product companies focus on problem solving and impact. For startups focus on ownership and handling ambiguity. Return a JSON array of exactly 5 strings. No preamble, no explanation, just the array.`;

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: message }] }],
      }),
    }
  );

  const json = await res.json();
  const text = json.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
  const match = text.match(/\[[\s\S]*\]/);
  if (!match) return NextResponse.json({ error: "Failed to parse questions" }, { status: 500 });

  const questions = JSON.parse(match[0]);
  return NextResponse.json({ questions });
}
