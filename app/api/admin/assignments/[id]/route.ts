import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/server/auth/session";

const DeleteParamsSchema = z.object({
  id: z.string().min(1),
});

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const parsed = DeleteParamsSchema.safeParse({ id });
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid assignment ID" }, { status: 400 });
  }

  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await prisma.mentorAssignment.delete({ where: { id: parsed.data.id } });
  return NextResponse.json({ deleted: true });
}
