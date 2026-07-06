import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { getAuthenticatedContext } from "@/lib/server/auth";
import { withApiErrorHandler } from "@/lib/server/apiError";
import { createInterviewProof } from "@/lib/server/interviewProof";
import { logServerError } from "@/lib/server/errorLog";
import { enforceCostRateLimit } from "@/lib/server/costRateLimit";
import { enforceRequestAbuseGuards } from "@/lib/server/requestAbuse";
import { isValidSetup, readJsonBody } from "@/lib/validation";

async function postGenerateQuestions(req: NextRequest) {
  const { user } = await getAuthenticatedContext();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const costLimit = enforceCostRateLimit(
    `ai:generate-questions:${user.id}`,
    8,
    undefined,
    "Too many question generation requests. Please wait and try again."
  );
  if (costLimit) return costLimit;

  const body = await readJsonBody(req, 8_000);
  if (!body.ok) {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const abuseGuard = enforceRequestAbuseGuards({
    request: req,
    userId: user.id,
    route: "generate-questions",
    body: body.data,
  });
  if (!abuseGuard.ok) return abuseGuard.response;

  try {
    const input = body.data;
    if (!isValidSetup(input)) {
      return NextResponse.json(
        { error: "Invalid interview setup." },
        { status: 400 }
      );
    }

    const { domain, experience, companyType } = input;
    const isLeadSreRole =
      /\bsite reliability\b|\bsre\b/i.test(domain) && /\blead\b/i.test(domain);

    const questionPrompt = isLeadSreRole
      ? `Generate exactly 5 high-quality mock interview questions for a ${experience} candidate applying for a Lead Site Reliability Engineer role at a ${companyType} company.

Role context:
A Lead Site Reliability Engineer is responsible for ensuring highly available, scalable, secure, and cost-efficient cloud infrastructure. The role combines software engineering and operations to build reliable distributed systems, automate infrastructure, improve observability, optimize performance, manage incidents, and collaborate with development teams to improve system reliability.

The interviewer should behave like a Senior Engineering Manager at Google, Amazon, Microsoft, or Meta hiring for a Lead SRE position.

Question mix:
- 2 deeply technical questions covering Linux, networking, cloud infrastructure, Kubernetes, Docker, Terraform, Helm, CI/CD, observability, databases, distributed systems, scalability, high availability, disaster recovery, security, or cost optimization
- 1 production incident scenario focused on real production incidents, debugging distributed systems, Kubernetes troubleshooting, RCA, post-mortems, SLOs, SLIs, alerting, incident response, or escalation
- 1 leadership question covering mentoring, ownership, cross-functional collaboration, decision making under pressure, communication, reliability culture, or leading through incidents
- 1 behavioral question requiring a specific example, actions, tradeoffs, outcome, and reflection

Difficulty distribution for this 5-question interview:
- 1 Medium
- 2 Hard
- 2 Expert

Primary responsibilities to test:
- Develop and improve observability using monitoring, logging, tracing, and alerting tools
- Optimize system performance and troubleshoot production incidents
- Conduct Root Cause Analysis and post-mortems after incidents
- Collaborate closely with software engineers to improve reliability, scalability, and performance
- Drive cloud infrastructure cost optimization initiatives
- Monitor and manage databases like MongoDB, Redis, Elasticsearch, and queue-based systems
- Build automation for infrastructure and operational tasks
- Improve deployment reliability using CI/CD pipelines
- Define and maintain SLOs, SLIs, and incident response processes

Required skills to emphasize:
AWS, Google Cloud Platform, Docker, Kubernetes, GKE, Terraform, Helm, Prometheus, Grafana, ELK Stack, OpenTelemetry, Jenkins, GitHub Actions, ArgoCD, MongoDB, Redis, Elasticsearch, queue-based messaging systems, Python, Bash, shell scripting, Linux, networking, REST APIs, JSON parsing, on-call rotations, SLIs, SLOs, SLAs, escalation policies, and incident response.

Interview focus areas:
Linux and operating systems, networking fundamentals, cloud infrastructure, Kubernetes, Docker, infrastructure as code, CI/CD pipelines, monitoring and observability, incident response, performance optimization, distributed systems, scalability, reliability engineering, automation, security best practices, cost optimization, database scaling, disaster recovery, high availability, leadership, and team collaboration.

Evaluation criteria:
Technical Accuracy 30%, Problem Solving 20%, System Design 20%, Reliability & Operational Excellence 15%, Leadership & Communication 10%, Best Practices & Security 5%.

Calibrate difficulty to ${experience}. Avoid generic questions. Each question must be one clear sentence or two short sentences and require senior-level reasoning.

Return a JSON array of exactly 5 strings. No preamble or markdown.`
      : `Generate exactly 5 high-quality mock interview questions for a ${experience} candidate applying for this user-entered target role: "${domain}".
Company or interview environment entered by the user: "${companyType}".

Question mix:
- 2 role-specific technical questions that test real "${domain}" knowledge, tradeoffs, debugging, implementation details, or architecture decisions
- 1 practical problem-solving scenario with a clear constraint
- 1 behavioral question requiring a specific example, actions, outcome, and reflection
- 1 company-fit question tailored to a "${companyType}" environment

Calibrate difficulty to ${experience}. Avoid generic questions. Each question must be one clear sentence or two short sentences and require reasoning.

Return a JSON array of exactly 5 strings. No preamble or markdown.`;

    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      logServerError(
        "Question generation is not configured",
        new Error("Missing GROQ_API_KEY")
      );
      return NextResponse.json(
        { error: "Question generation is unavailable." },
        { status: 503 }
      );
    }

    const response = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
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
              content: questionPrompt,
            },
          ],
          max_tokens: 1024,
        }),
      }
    );

    if (!response.ok) {
      logServerError("Question generation provider failed", {
        status: response.status,
        statusText: response.statusText,
      });
      return NextResponse.json(
        { error: "Question generation is temporarily unavailable." },
        { status: 502 }
      );
    }

    const json = await response.json();
    const text = json.choices?.[0]?.message?.content ?? "";
    const match = text.match(/\[[\s\S]*\]/);

    if (!match) {
      logServerError("Question generation returned malformed content", {
        textPreview: text.slice(0, 500),
      });
      return NextResponse.json(
        { error: "Question generation is temporarily unavailable." },
        { status: 502 }
      );
    }

    const questions: unknown = JSON.parse(match[0]);
    if (
      !Array.isArray(questions) ||
      questions.length !== 5 ||
      questions.some(
        (question) =>
          typeof question !== "string" ||
          question.trim().length < 8 ||
          question.length > 1200
      )
    ) {
      logServerError("Question generation returned invalid question payload", {
        questions,
      });
      return NextResponse.json(
        { error: "Question generation is temporarily unavailable." },
        { status: 502 }
      );
    }

    const normalizedQuestions = questions.map((question) => question.trim());
    const sessionId = randomUUID();

    const questionSetToken = createInterviewProof({
      kind: "questionSet",
      version: 1,
      userId: user.id,
      sessionId,
      domain,
      experience,
      companyType,
      questions: normalizedQuestions,
      issuedAt: Date.now(),
    });

    return NextResponse.json({
      questions: normalizedQuestions,
      questionSetToken,
    });
  } catch (error) {
    logServerError("Question generation request failed", error, {
      userId: user.id,
    });
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
}

export const POST = withApiErrorHandler(
  postGenerateQuestions,
  "Unhandled question generation API error"
);
