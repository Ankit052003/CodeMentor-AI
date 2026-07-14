import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/server/auth/session";

export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const user = await getCurrentUser();
  if (!user || user.role !== "STUDENT") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const exercise = await prisma.exercise.findFirst({
    where: {
      id,
      submission: {
        studentId: user.id
      }
    }
  });

  if (!exercise) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await prisma.exercise.update({
    where: { id },
    data: {
      status: "COMPLETED",
      completedAt: new Date()
    }
  });

  await prisma.progressEvent.create({
    data: {
      studentId: user.id,
      eventType: "EXERCISE_COMPLETED",
      metadata: {
        exerciseId: exercise.id,
        submissionId: exercise.submissionId
      }
    }
  });

  return NextResponse.json({ completed: true });
}