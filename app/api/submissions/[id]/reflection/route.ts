import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { sanitizeText } from "@/lib/sanitize";
import { getCurrentUser } from "@/server/auth/session";

const ReflectionSchema = z.object({
  reflection: z.string().min(1).max(4000)
});

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user || user.role !== "STUDENT") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const submission = await prisma.codeSubmission.findFirst({
    where: {
      id,
      studentId: user.id
    }
  });

  if (!submission) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const body = await req.json();
  const parsed = ReflectionSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues }, { status: 400 });
  }

  await prisma.progressEvent.create({
    data: {
      studentId: submission.studentId,
      eventType: "REVISION_CREATED",
      metadata: {
        submissionId: submission.id,
        reflection: sanitizeText(parsed.data.reflection)
      }
    }
  });

  return NextResponse.json({ saved: true });
}