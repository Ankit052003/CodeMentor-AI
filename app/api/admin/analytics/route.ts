import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/server/auth/session";

export async function GET() {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const [submissionCounts, languageCounts, avgScores] = await Promise.all([
    prisma.codeSubmission.groupBy({
      by: ["status"],
      _count: { id: true },
    }),
    prisma.codeSubmission.groupBy({
      by: ["language"],
      _count: { id: true },
    }),
    prisma.aiReview.aggregate({
      _avg: { overallScore: true, correctnessScore: true, readabilityScore: true, complexityScore: true },
      _count: { id: true },
    }),
  ]);

  return NextResponse.json({
    submissionCounts: submissionCounts.map((s) => ({ status: s.status, count: s._count.id })),
    languageCounts: languageCounts.map((l) => ({ language: l.language, count: l._count.id })),
    avgScores: {
      overall: Math.round(avgScores._avg.overallScore ?? 0),
      correctness: Math.round(avgScores._avg.correctnessScore ?? 0),
      readability: Math.round(avgScores._avg.readabilityScore ?? 0),
      complexity: Math.round(avgScores._avg.complexityScore ?? 0),
      totalReviews: avgScores._count.id,
    },
  });
}
