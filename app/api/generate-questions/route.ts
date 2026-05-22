import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  return NextResponse.json({ 
    env: {
      hasGroq: !!process.env.GROQ_API_KEY,
      allKeys: Object.keys(process.env).filter(k => k.includes("GROQ") || k.includes("API"))
    }
  });
}
