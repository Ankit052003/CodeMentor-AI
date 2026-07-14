import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { sanitizeCode, sanitizeText } from "@/lib/sanitize";

const supportedLanguages = ["JAVASCRIPT", "TYPESCRIPT", "PYTHON"] as const;
const supportedDifficulties = ["BEGINNER", "INTERMEDIATE", "ADVANCED"] as const;
const submissionStatuses = ["DRAFT", "SUBMITTED"] as const;
const maxSourceLength = 20_000;

const CreateSubmission = z.object({
  title: z.string().min(1),
  language: z.enum(supportedLanguages),
  topic: z.string().min(1),
  difficulty: z.enum(supportedDifficulties),
  prompt: z.string().min(1),
  sourceCode: z.string().min(1).max(maxSourceLength),
  status: z.enum(submissionStatuses).default("SUBMITTED")
});

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const status = searchParams.get("status") ?? undefined;
  const language = searchParams.get("language") ?? undefined;
  const topic = searchParams.get("topic") ?? undefined;
  const scoreMin = searchParams.get("scoreMin");
  const scoreMax = searchParams.get("scoreMax");

  const parsedScoreMin = scoreMin ? Number(scoreMin) : undefined;
  const parsedScoreMax = scoreMax ? Number(scoreMax) : undefined;

  const submissions = await prisma.codeSubmission.findMany({
    where: {
      studentId: "seed-student",
      ...(status ? { status: status as (typeof submissionStatuses)[number] | "REVIEWED" | "ARCHIVED" } : {}),
      ...(language ? { language: language as (typeof supportedLanguages)[number] } : {}),
      ...(topic ? { topic: { contains: topic, mode: "insensitive" } } : {})
    },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      title: true,
      language: true,
      difficulty: true,
      status: true,
      topic: true,
      prompt: true,
      createdAt: true,
      submittedAt: true,
      aiReview: {
        select: {
          overallScore: true
        }
      }
    }
  });

  const filtered = submissions.filter((submission) => {
    const score = submission.aiReview?.overallScore;

    if (typeof parsedScoreMin === "number" && Number.isFinite(parsedScoreMin)) {
      if (typeof score !== "number" || score < parsedScoreMin) return false;
    }

    if (typeof parsedScoreMax === "number" && Number.isFinite(parsedScoreMax)) {
      if (typeof score !== "number" || score > parsedScoreMax) return false;
    }

    return true;
  });

  return NextResponse.json({
    submissions: filtered.map((submission) => ({
      id: submission.id,
      title: submission.title,
      language: submission.language,
      difficulty: submission.difficulty,
      status: submission.status,
      topic: submission.topic,
      prompt: submission.prompt,
      createdAt: submission.createdAt,
      submittedAt: submission.submittedAt,
      reviewScore: submission.aiReview?.overallScore ?? null
    }))
  });
}

export async function POST(req: NextRequest) {
  const body = await req.json();

  const parse = CreateSubmission.safeParse(body);
  if (!parse.success) {
    return NextResponse.json({ error: parse.error.issues }, { status: 400 });
  }

  const data = parse.data;

  const sanitizedPrompt = sanitizeText(data.prompt);
  const sanitizedSource = sanitizeCode(data.sourceCode);
  const status = data.status;

  const submission = await prisma.codeSubmission.create({
    data: {
      studentId: "seed-student",
      title: data.title,
      language: data.language,
      topic: data.topic,
      difficulty: data.difficulty,
      prompt: sanitizedPrompt,
      sourceCode: data.sourceCode,
      sanitizedSourceCode: sanitizedSource,
      status,
      submittedAt: status === "SUBMITTED" ? new Date() : null,
      archivedAt: null
    }
  });

  return NextResponse.json({ submission }, { status: 201 });
}
