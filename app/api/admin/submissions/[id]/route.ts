import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/server/auth/session";

const ModerateSchema = z.object({
  status: z.enum(["ARCHIVED", "SUBMITTED", "REVIEWED"]),
});

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const parsed = ModerateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues }, { status: 400 });
  }

  const submission = await prisma.codeSubmission.update({
    where: { id },
    data: {
      status: parsed.data.status,
      archivedAt: parsed.data.status === "ARCHIVED" ? new Date() : null,
    },
    select: { id: true, title: true, status: true, language: true },
  });

  return NextResponse.json({ submission });
}
