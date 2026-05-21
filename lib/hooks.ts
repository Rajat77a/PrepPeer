/**
 * Placeholder hooks for future backend / AI integration.
 * No API calls — stubs only.
 */

export async function submitAnswer(
  _sessionId: string,
  _questionId: number,
  _answer: string
): Promise<{ success: boolean }> {
  // TODO: Wire to AI scoring API (Claude, OpenAI, Gemini, etc.)
  return { success: true };
}

export async function fetchLeaderboard(
  _role?: string,
  _company?: string,
  _timeWindow?: string
): Promise<unknown[]> {
  // TODO: Wire to Supabase / Firebase / PostgreSQL
  return [];
}

export async function fetchSessionReport(
  _sessionId: string
): Promise<unknown | null> {
  // TODO: Wire to backend
  return null;
}

export async function createInterviewSession(_profile: {
  role: string;
  companyType: string;
}): Promise<{ sessionId: string }> {
  // TODO: Wire to backend
  return { sessionId: "mock-session-id" };
}
