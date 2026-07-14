import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { generateAIReview } from "@/server/ai/ai-provider";
import { getCurrentUser } from "@/server/auth/session";
import { checkRateLimit } from "@/lib/rate-limit";

const reviewCooldownMs = 10 * 60 * 1000;

export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const submission = await prisma.codeSubmission.findUnique({
    where: { id }
  });

  if (!submission) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // Authorization check: owner student, assigned mentor, or admin
  const isOwner = submission.studentId === user.id;
  const isAdmin = user.role === "ADMIN";
  let isAssignedMentor = false;

  if (user.role === "MENTOR") {
    const assignment = await prisma.mentorAssignment.findFirst({
      where: {
        mentorId: user.id,
        studentId: submission.studentId
      }
    });
    isAssignedMentor = !!assignment;
  }

  if (!isOwner && !isAdmin && !isAssignedMentor) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Per-user rate limiting: max 5 reviews per 15 minutes
  const rateLimitResult = checkRateLimit(`review:${user.id}`, 5, 15 * 60 * 1000);
  const rateLimitHeaders = {
    "X-RateLimit-Limit": "5",
    "X-RateLimit-Remaining": String(rateLimitResult.remaining),
    "X-RateLimit-Reset": String(Math.ceil(rateLimitResult.resetInMs / 1000)),
  };
  if (!rateLimitResult.allowed) {
    return NextResponse.json(
      { error: `Rate limit exceeded. Try again in ${Math.ceil(rateLimitResult.resetInMs / 60000)} minutes.` },
      { status: 429, headers: rateLimitHeaders }
    );
  }

  const existingReview = await prisma.aiReview.findUnique({
    where: { submissionId: id },
    select: { id: true, createdAt: true }
  });

  if (existingReview && Date.now() - existingReview.createdAt.getTime() < reviewCooldownMs) {
    return NextResponse.json(
      { error: "Please wait before generating this review again." },
      { status: 429, headers: rateLimitHeaders }
    );
  }

  let analysis;
  try {
    analysis = await generateAIReview(submission.language, submission.sourceCode);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "AI review generation failed." },
      { status: 500 }
    );
  }

  const review = await prisma.$transaction(async (tx) => {
    const savedReview = await tx.aiReview.upsert({
      where: { submissionId: submission.id },
      update: {
        summary: analysis.summary,
        overallScore: analysis.overallScore,
        correctnessScore: analysis.correctnessScore,
        readabilityScore: analysis.readabilityScore,
        complexityScore: analysis.complexityScore,
        securityScore: analysis.securityScore,
        verificationStatus: "PENDING"
      },
      create: {
        submissionId: submission.id,
        summary: analysis.summary,
        overallScore: analysis.overallScore,
        correctnessScore: analysis.correctnessScore,
        readabilityScore: analysis.readabilityScore,
        complexityScore: analysis.complexityScore,
        securityScore: analysis.securityScore
      }
    });

    await tx.reviewIssue.deleteMany({ where: { reviewId: savedReview.id } });
    await tx.reviewIssue.createMany({
      data: analysis.issues.map((issue) => ({
        reviewId: savedReview.id,
        category: issue.category,
        severity: issue.severity,
        lineStart: issue.lineStart ?? null,
        lineEnd: issue.lineEnd ?? null,
        title: issue.title,
        explanation: issue.explanation,
        suggestion: issue.suggestion
      }))
    });

    await tx.exercise.deleteMany({ where: { submissionId: submission.id } });
    if (analysis.followUpExercises.length > 0) {
      await tx.exercise.createMany({
        data: analysis.followUpExercises.map((exercise) => ({
          submissionId: submission.id,
          title: exercise.title,
          description: exercise.description,
          difficulty: exercise.difficulty,
          expectedConcept: exercise.expectedConcept
        }))
      });
    }

    await tx.progressEvent.create({
      data: {
        studentId: submission.studentId,
        eventType: "AI_REVIEW_CREATED",
        metadata: {
          submissionId: submission.id,
          score: analysis.overallScore,
          securityWarnings: analysis.securityWarnings
        } as Prisma.InputJsonValue
      }
    });

    await tx.notification.create({
      data: {
        userId: submission.studentId,
        type: "AI_REVIEW_READY",
        title: "AI Review Ready",
        message: `AI Review generated for submission: "${submission.title}" with score ${analysis.overallScore}/100.`,
        link: `/dashboard/submissions/${submission.id}`
      }
    });

    return savedReview;
  });

  return NextResponse.json({
    review: {
      ...review,
      issues: analysis.issues,
      suggestedCode: analysis.suggestedCode,
      beginnerExplanation: analysis.beginnerExplanation,
      followUpExercises: analysis.followUpExercises,
      securityWarnings: analysis.securityWarnings
    }
  }, { headers: rateLimitHeaders });
}

