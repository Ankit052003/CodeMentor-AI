import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { sanitizeCode, sanitizeText } from "@/lib/sanitize";

const maxSourceLength = 20_000;

const CreateRevision = z.object({
  sourceCode: z.string().min(1).max(maxSourceLength),
  changeSummary: z.string().min(1).max(2000)
});

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const submission = await prisma.codeSubmission.findFirst({
    where: {
      id,
      studentId: "seed-student"
    }
  });

  if (!submission) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (submission.status === "DRAFT") {
    return NextResponse.json({ error: "Draft submissions should be updated directly instead of revised." }, { status: 409 });
  }

  const body = await req.json();
  const parsed = CreateRevision.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues }, { status: 400 });
  }

  const revision = await prisma.revision.create({
    data: {
      submissionId: id,
      sourceCode: sanitizeCode(parsed.data.sourceCode),
      changeSummary: sanitizeText(parsed.data.changeSummary)
    }
  });

  return NextResponse.json({ revision }, { status: 201 });
}