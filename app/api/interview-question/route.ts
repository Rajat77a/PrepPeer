import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedContext } from "@/lib/server/auth";
import { withApiErrorHandler } from "@/lib/server/apiError";
import {
  createInterviewProof,
  verifyInterviewProof,
} from "@/lib/server/interviewProof";
import { enforceRequestAbuseGuards } from "@/lib/server/requestAbuse";
import {
  getBoundedString,
  isPlainObject,
  readJsonBody,
} from "@/lib/validation";

const TOTAL_QUESTIONS = 5;

async function postInterviewQuestion(request: NextRequest) {
  const { user } = await getAuthenticatedContext();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await readJsonBody(request, 28_000);
  if (!body.ok || !isPlainObject(body.data)) {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const abuseGuard = enforceRequestAbuseGuards({
    request,
    userId: user.id,
    route: "interview-question",
    body: body.data,
  });
  if (!abuseGuard.ok) return abuseGuard.response;

  const token = getBoundedString(body.data.questionSetToken, 20, 24_000);
  if (!token) {
    return NextResponse.json({ error: "Invalid interview session." }, { status: 400 });
  }

  const questionSet = verifyInterviewProof(token, "questionSet", user.id);
  if (
    !questionSet ||
    questionSet.kind !== "questionSet" ||
    questionSet.questions.length !== TOTAL_QUESTIONS ||
    !Number.isInteger(questionSet.currentIndex) ||
    questionSet.currentIndex < 0 ||
    questionSet.currentIndex >= TOTAL_QUESTIONS
  ) {
    return NextResponse.json(
      { error: "The interview session is invalid or expired." },
      { status: 400 }
    );
  }

  const nextIndex = questionSet.currentIndex + 1;
  if (nextIndex >= questionSet.questions.length) {
    return NextResponse.json(
      { error: "There are no more questions in this interview." },
      { status: 409 }
    );
  }

  const nextToken = createInterviewProof({
    ...questionSet,
    currentIndex: nextIndex,
  });

  return NextResponse.json(
    {
      question: questionSet.questions[nextIndex],
      questionIndex: nextIndex,
      totalQuestions: questionSet.questions.length,
      questionSetToken: nextToken,
    },
    {
      headers: {
        "Cache-Control": "no-store, private",
        Pragma: "no-cache",
      },
    }
  );
}

export const POST = withApiErrorHandler(
  postInterviewQuestion,
  "Unhandled interview question API error"
);
