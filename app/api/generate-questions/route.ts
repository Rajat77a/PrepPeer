import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const apiKey = process.env.GROQ_API_KEY;
  
  return NextResponse.json({ 
    hasKey: !!apiKey,
    keyLength: apiKey?.length ?? 0,
    firstChars: apiKey?.substring(0, 8) ?? "none"
  });
}
