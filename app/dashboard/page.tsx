import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export const dynamic = "force-dynamic";

function average(values: number[]) {
  if (values.length === 0) return null;
  return Math.round(values.reduce((sum, value) => sum + value, 0) / values.length);
}

export default async function DashboardPage() {
  const submissions = await prisma.codeSubmission.findMany({
    where: { studentId: "seed-student" },
    orderBy: { createdAt: "desc" },
    take: 10,
    include: {
      aiReview: {
        include: {
          issues: true
        }
      }
    }
  });

  const reviewedScores = submissions
    .map((submission) => submission.aiReview?.overallScore)
    .filter((score): score is number => typeof score === "number");

  const averageScore = average(reviewedScores);
  const openIssues = submissions.reduce((count, submission) => count + (submission.aiReview?.issues.length ?? 0), 0);
  const recentReviewedScores = reviewedScores.slice(0, 3);
  const previousReviewedScores = reviewedScores.slice(3, 6);
  const latestAverage = average(recentReviewedScores);
  const previousAverage = average(previousReviewedScores);
  const trendDelta = latestAverage !== null && previousAverage !== null ? latestAverage - previousAverage : null;

  return (
    <div className="space-y-8 p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-[var(--foreground)]">Student dashboard</h1>
          <p className="mt-1 text-sm text-[var(--muted)]">Track submissions, review feedback, and spot improvement trends.</p>
        </div>
        <Link
          href="/dashboard/submissions/new"
          className="inline-flex h-10 items-center justify-center rounded-md bg-[var(--primary)] px-4 text-sm font-medium text-[var(--primary-foreground)] transition hover:bg-blue-700"
        >
          New submission
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <div className="rounded-2xl border border-[var(--border)] bg-white p-5">
          <p className="text-sm text-[var(--muted)]">Recent submissions</p>
          <p className="mt-2 text-3xl font-semibold text-[var(--foreground)]">{submissions.length}</p>
        </div>
        <div className="rounded-2xl border border-[var(--border)] bg-white p-5">
          <p className="text-sm text-[var(--muted)]">Average review score</p>
          <p className="mt-2 text-3xl font-semibold text-[var(--foreground)]">{averageScore ?? "--"}</p>
        </div>
        <div className="rounded-2xl border border-[var(--border)] bg-white p-5">
          <p className="text-sm text-[var(--muted)]">Open improvement items</p>
          <p className="mt-2 text-3xl font-semibold text-[var(--foreground)]">{openIssues}</p>
        </div>
        <div className="rounded-2xl border border-[var(--border)] bg-white p-5">
          <p className="text-sm text-[var(--muted)]">Progress trend</p>
          <p className="mt-2 text-3xl font-semibold text-[var(--foreground)]">
            {trendDelta === null ? "--" : trendDelta > 0 ? `+${trendDelta}` : `${trendDelta}`}
          </p>
          <p className="mt-1 text-xs text-[var(--muted)]">Last 3 reviewed submissions vs the previous 3</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,0.9fr)]">
        <section className="rounded-2xl border border-[var(--border)] bg-white p-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-[var(--foreground)]">Recent submissions</h2>
              <p className="text-sm text-[var(--muted)]">Review your latest work and continue drafts quickly.</p>
            </div>
            <Link href="/dashboard/submissions" className="text-sm font-medium text-[var(--primary)] hover:underline">
              View all
            </Link>
          </div>

          {submissions.length === 0 ? (
            <div className="mt-5">
              <EmptyState
                title="No submissions yet"
                description="Create your first code submission to start tracking reviews and improvement."
                action={
                  <Link
                    href="/dashboard/submissions/new"
                    className="inline-flex h-10 items-center justify-center rounded-md bg-[var(--primary)] px-4 text-sm font-medium text-[var(--primary-foreground)] transition hover:bg-blue-700"
                  >
                    Create submission
                  </Link>
                }
              />
            </div>
          ) : (
            <div className="mt-5">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Score</TableHead>
                    <TableHead>Updated</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {submissions.slice(0, 5).map((submission) => (
                    <TableRow key={submission.id}>
                      <TableCell>
                        <Link href={`/dashboard/submissions/${submission.id}`} className="font-medium text-[var(--foreground)] hover:underline">
                          {submission.title}
                        </Link>
                        <div className="mt-1 text-xs text-[var(--muted)]">
                          {submission.language} · {submission.difficulty} · {submission.topic}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge tone={submission.status === "REVIEWED" ? "green" : submission.status === "ARCHIVED" ? "amber" : submission.status === "SUBMITTED" ? "blue" : "neutral"}>
                          {submission.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{submission.aiReview?.overallScore ?? "--"}</TableCell>
                      <TableCell>{new Date(submission.updatedAt).toLocaleDateString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </section>

        <section className="rounded-2xl border border-[var(--border)] bg-white p-5">
          <h2 className="text-lg font-semibold text-[var(--foreground)]">Review themes</h2>
          <p className="mt-1 text-sm text-[var(--muted)]">A quick snapshot of the most common focus areas in recent reviews.</p>
          <div className="mt-5 space-y-3">
            {submissions.length === 0 ? (
              <p className="text-sm text-[var(--muted)]">Create a submission to surface review themes.</p>
            ) : (
              [
                { label: "Correctness", tone: "blue" as const, count: submissions.filter((submission) => submission.aiReview?.correctnessScore !== undefined).length },
                { label: "Readability", tone: "green" as const, count: submissions.filter((submission) => submission.aiReview?.readabilityScore !== undefined).length },
                { label: "Complexity", tone: "amber" as const, count: submissions.filter((submission) => submission.aiReview?.complexityScore !== undefined).length },
                { label: "Security", tone: "red" as const, count: submissions.filter((submission) => submission.aiReview?.securityScore !== undefined).length }
              ].map((item) => (
                <div key={item.label} className="rounded-xl border border-[var(--border)] px-4 py-3">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-sm font-medium text-[var(--foreground)]">{item.label}</span>
                    <Badge tone={item.tone}>{item.count} reviews</Badge>
                  </div>
                </div>
              ))
            )}
          </div>
          {trendDelta !== null ? (
            <p className="mt-5 text-sm text-[var(--muted)]">
              {trendDelta > 0 ? "Your recent scores are improving." : trendDelta < 0 ? "Recent scores dipped slightly." : "Your latest review scores are holding steady."}
            </p>
          ) : null}
        </section>
      </div>
    </div>
  );
}