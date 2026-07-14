import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/server/auth/session";

const CreateAssignmentSchema = z.object({
  mentorId: z.string().min(1),
  studentId: z.string().min(1),
});

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const parsed = CreateAssignmentSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues }, { status: 400 });
  }

  const existing = await prisma.mentorAssignment.findUnique({
    where: {
      mentorId_studentId: {
        mentorId: parsed.data.mentorId,
        studentId: parsed.data.studentId,
      },
    },
  });

  if (existing) {
    return NextResponse.json({ error: "This assignment already exists." }, { status: 409 });
  }

  const assignment = await prisma.mentorAssignment.create({
    data: {
      mentorId: parsed.data.mentorId,
      studentId: parsed.data.studentId,
    },
    include: {
      mentor: { select: { name: true } },
      student: { select: { name: true, email: true } },
    },
  });

  return NextResponse.json({
    assignment: {
      id: assignment.id,
      mentorName: assignment.mentor.name,
      studentName: assignment.student.name,
      studentEmail: assignment.student.email,
    },
  }, { status: 201 });
}

export async function GET() {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const [mentors, students] = await Promise.all([
    prisma.user.findMany({ where: { role: "MENTOR" }, select: { id: true, name: true, email: true } }),
    prisma.user.findMany({ where: { role: "STUDENT" }, select: { id: true, name: true, email: true } }),
  ]);

  return NextResponse.json({ mentors, students });
}
