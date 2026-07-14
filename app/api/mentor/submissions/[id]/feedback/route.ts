import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/server/auth/session";

const MentorFeedbackSchema = z.object({
  comment: z.string().max(4000).default(""),
  privateNote: z.string().max(4000).default(""),
  exerciseTitle: z.string().max(200).default(""),
  exerciseDescription: z.string().max(4000).default(""),
  expectedConcept: z.string().max(200).default(""),
  difficulty: z.enum(["BEGINNER", "INTERMEDIATE", "ADVANCED"]).default("BEGINNER"),
  verificationStatus: z.enum(["APPROVED", "OVERRIDDEN"]).default("APPROVED")
});

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const user = await getCurrentUser();
  if (!user || user.role !== "MENTOR") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const submission = await prisma.codeSubmission.findFirst({
    where: { id },
    include: {
      student: true,
      aiReview: true
    }
  });

  if (!submission) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const assignment = await prisma.mentorAssignment.findFirst({
    where: {
      mentorId: user.id,
      studentId: submission.studentId
    }
  });

  if (!assignment) {
    return NextResponse.json({ error: "You are not assigned to this student." }, { status: 403 });
  }

  const body = await req.json();
  const parsed = MentorFeedbackSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues }, { status: 400 });
  }

  const data = parsed.data;
  const formattedComment = [
    data.comment.trim() ? `Public comment:\n${data.comment.trim()}` : null,
    data.privateNote.trim() ? `Private note:\n${data.privateNote.trim()}` : null
  ].filter(Boolean).join("\n\n");

  const result = await prisma.$transaction(async (tx) => {
    const createdComment = data.comment.trim() || data.privateNote.trim()
      ? await tx.mentorComment.create({
          data: {
            submissionId: submission.id,
            mentorId: user.id,
            body: formattedComment || data.comment.trim() || data.privateNote.trim()
          }
        })
      : null;

    const createdExercise = data.exerciseTitle.trim() && data.exerciseDescription.trim()
      ? await tx.exercise.create({
          data: {
            submissionId: submission.id,
            title: data.exerciseTitle.trim(),
            description: data.exerciseDescription.trim(),
            difficulty: data.difficulty,
            expectedConcept: data.expectedConcept.trim() || "Practice"
          }
        })
      : null;

    const updatedReview = submission.aiReview
      ? await tx.aiReview.update({
          where: { submissionId: submission.id },
          data: {
            verificationStatus: data.verificationStatus
          }
        })
      : null;

    const updatedSubmission = await tx.codeSubmission.update({
      where: { id: submission.id },
      data: {
        status: "REVIEWED",
        archivedAt: null
      }
    });

    await tx.progressEvent.create({
      data: {
        studentId: submission.studentId,
        eventType: "MENTOR_COMMENT_CREATED",
        metadata: {
          submissionId: submission.id,
          mentorId: user.id,
          verificationStatus: data.verificationStatus
        }
      }
    });

    if (data.comment.trim()) {
      await tx.notification.create({
        data: {
          userId: submission.studentId,
          type: "MENTOR_COMMENT",
          title: "New Mentor Comment",
          message: `${user.name} added a comment on your submission: "${submission.title}"`,
          link: `/dashboard/submissions/${submission.id}`
        }
      });
    }

    if (data.exerciseTitle.trim() && data.exerciseDescription.trim()) {
      await tx.notification.create({
        data: {
          userId: submission.studentId,
          type: "EXERCISE_ASSIGNED",
          title: "New Exercise Assigned",
          message: `${user.name} assigned a follow-up exercise: "${data.exerciseTitle.trim()}"`,
          link: `/dashboard/submissions/${submission.id}`
        }
      });
    }

    return {
      comment: createdComment,
      exercise: createdExercise,
      review: updatedReview,
      submission: updatedSubmission
    };
  });

  return NextResponse.json({ result });
}