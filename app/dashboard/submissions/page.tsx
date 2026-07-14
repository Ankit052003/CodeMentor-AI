import { prisma } from "@/lib/prisma";
import { SubmissionsPageClient, type Submission } from "./submissions-page-client";
import { getDemoDashboardData } from "@/lib/demo-data";

export const dynamic = "force-dynamic";

export default async function SubmissionsPage() {
  let submissions;
  let pageInfo = { page: 1, pageSize: 5, totalCount: 0, totalPages: 1 };

  try {
    submissions = await prisma.codeSubmission.findMany({
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
        aiReview: {
          select: {
            overallScore: true
          }
        }
      }
    });
    pageInfo = { page: 1, pageSize: 5, totalCount: submissions.length, totalPages: 1 };
  } catch {
    submissions = getDemoDashboardData().map((submission) => ({
      id: submission.id,
      title: submission.title,
      language: submission.language,
      difficulty: submission.difficulty,
      status: submission.status,
      topic: submission.topic,
      prompt: submission.prompt,
      createdAt: submission.createdAt,
      aiReview: {
        overallScore: submission.reviewScore
      }
    }));
    pageInfo = { page: 1, pageSize: 5, totalCount: submissions.length, totalPages: 1 };
  }

  const initialSubmissions: Submission[] = submissions.map((submission) => ({
    id: submission.id,
    title: submission.title,
    language: submission.language,
    difficulty: submission.difficulty,
    status: submission.status,
    topic: submission.topic,
    prompt: submission.prompt,
    createdAt: submission.createdAt.toISOString(),
    reviewScore: submission.aiReview?.overallScore ?? null
  }));

  return <SubmissionsPageClient initialSubmissions={initialSubmissions} initialPageInfo={pageInfo} />;
}

