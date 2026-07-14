import { prisma } from "@/lib/prisma";
import { SubmissionsPageClient, type Submission } from "./submissions-page-client";

export const dynamic = "force-dynamic";

export default async function SubmissionsPage() {
  const submissions = await prisma.codeSubmission.findMany({
    where: {
      studentId: "seed-student"
    },
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

  return <SubmissionsPageClient initialSubmissions={initialSubmissions} />;
}
