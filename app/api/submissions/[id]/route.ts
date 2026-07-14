import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { sanitizeCode, sanitizeText } from "@/lib/sanitize";
import { getCurrentUser } from "@/server/auth/session";

const supportedLanguages = ["JAVASCRIPT", "TYPESCRIPT", "PYTHON"] as const;
const supportedDifficulties = ["BEGINNER", "INTERMEDIATE", "ADVANCED"] as const;
const submissionStatuses = ["DRAFT", "SUBMITTED"] as const;
const maxSourceLength = 20_000;

const UpdateSubmission = z.object({
  title: z.string().min(1),
  language: z.enum(supportedLanguages),
  topic: z.string().min(1),
  difficulty: z.enum(supportedDifficulties),
  prompt: z.string().min(1),
  sourceCode: z.string().min(1).max(maxSourceLength),
  status: z.enum(submissionStatuses).default("SUBMITTED")
});

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const submission = await prisma.codeSubmission.findUnique({
    where: { id },
    include: {
      aiReview: { include: { issues: true } },
      mentorComments: true,
      revisions: true,
      exercises: true
    }
  });

  if (!submission) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Authorization check: Students can only view their own submissions.
  // Mentors and admins can view any.
  if (user.role === "STUDENT" && submission.studentId !== user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  return NextResponse.json({ submission });
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const existingSubmission = await prisma.codeSubmission.findFirst({
    where: {
      id,
      studentId: user.id
    }
  });

  if (!existingSubmission) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (existingSubmission.status !== "DRAFT") {
    return NextResponse.json({ error: "Only draft submissions can be edited directly. Create a revision for reviewed work." }, { status: 409 });
  }

  const body = await req.json();
  const parsed = UpdateSubmission.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues }, { status: 400 });
  }

  const data = parsed.data;
  const status = data.status;

  const updatedSubmission = await prisma.codeSubmission.update({
    where: { id },
    data: {
      title: data.title,
      language: data.language,
      topic: data.topic,
      difficulty: data.difficulty,
      prompt: sanitizeText(data.prompt),
      sourceCode: data.sourceCode,
      sanitizedSourceCode: sanitizeCode(data.sourceCode),
      status,
      submittedAt: status === "SUBMITTED" ? existingSubmission.submittedAt ?? new Date() : null,
      archivedAt: null
    }
  });

  return NextResponse.json({ submission: updatedSubmission });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const existingSubmission = await prisma.codeSubmission.findUnique({
    where: { id }
  });

  if (!existingSubmission) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // Only the student owner or an admin can delete/archive.
  if (existingSubmission.studentId !== user.id && user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  if (existingSubmission.status === "DRAFT") {
    await prisma.codeSubmission.delete({ where: { id } });
    return NextResponse.json({ deleted: true });
  }

  const archivedSubmission = await prisma.codeSubmission.update({
    where: { id },
    data: {
      status: "ARCHIVED",
      archivedAt: new Date()
    }
  });

  return NextResponse.json({ submission: archivedSubmission });
}

