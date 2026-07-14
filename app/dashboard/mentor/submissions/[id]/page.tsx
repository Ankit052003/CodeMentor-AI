import React from "react";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { CodeView } from "@/components/app/code-view";
import { MentorFeedbackForm } from "@/components/app/mentor-feedback-form";
import { getDemoSubmissionDetail } from "@/lib/demo-data";

type Props = { params: { id: string } };

export const dynamic = "force-dynamic";

export default async function MentorSubmissionPage({ params }: Props) {
  let submission;

  try {
    submission = await prisma.codeSubmission.findUnique({
      where: { id: params.id },
      include: {
        student: true,
        aiReview: { include: { issues: true } },
        mentorComments: true,
        exercises: true,
        revisions: true
      }
    });
  } catch {
    submission = getDemoSubmissionDetail();
  }

  if (!submission) {
    return (
      <div className="p-6">
        <EmptyState title="Submission not found" description="The submission may not be assigned to the mentor or may have been removed." action={<Link href="/dashboard/mentor" className="text-sm font-medium text-[var(--primary)] hover:underline">Back to mentor dashboard</Link>} />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-[var(--foreground)]">{submission.title}</h1>
          <p className="mt-1 text-sm text-[var(--muted)]">{submission.student.name} · {submission.language} · {submission.topic}</p>
        </div>
        <Badge tone={submission.aiReview?.verificationStatus === "APPROVED" ? "green" : submission.aiReview?.verificationStatus === "OVERRIDDEN" ? "amber" : "neutral"}>
          {submission.aiReview?.verificationStatus ?? "PENDING"}
        </Badge>
      </div>

      <section className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-[var(--border)] bg-white p-5">
          <p className="text-sm text-[var(--muted)]">Overall score</p>
          <p className="mt-2 text-2xl font-semibold">{submission.aiReview?.overallScore ?? "--"}</p>
        </div>
        <div className="rounded-2xl border border-[var(--border)] bg-white p-5">
          <p className="text-sm text-[var(--muted)]">Mentor comments</p>
          <p className="mt-2 text-2xl font-semibold">{submission.mentorComments.length}</p>
        </div>
        <div className="rounded-2xl border border-[var(--border)] bg-white p-5">
          <p className="text-sm text-[var(--muted)]">Exercises assigned</p>
          <p className="mt-2 text-2xl font-semibold">{submission.exercises.length}</p>
        </div>
      </section>

      <section className="rounded-2xl border border-[var(--border)] bg-white p-5">
        <h2 className="text-lg font-semibold text-[var(--foreground)]">Student code</h2>
        <div className="mt-3">
          <CodeView code={submission.sanitizedSourceCode} language={submission.language} />
        </div>
      </section>

      <section className="rounded-2xl border border-[var(--border)] bg-white p-5">
        <h2 className="text-lg font-semibold text-[var(--foreground)]">AI review summary</h2>
        {submission.aiReview ? (
          <div className="mt-3 space-y-4">
            <p className="text-sm text-[var(--muted)]">{submission.aiReview.summary}</p>
            <div className="grid gap-3 sm:grid-cols-2">
              {submission.aiReview.issues.map((issue) => (
                <div key={issue.id} className="rounded-xl border border-[var(--border)] p-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-medium text-[var(--foreground)]">{issue.title}</span>
                    <Badge tone={issue.severity === "HIGH" || issue.severity === "CRITICAL" ? "red" : issue.severity === "MEDIUM" ? "amber" : "blue"}>{issue.severity}</Badge>
                  </div>
                  <p className="mt-2 text-sm text-[var(--muted)]">{issue.explanation}</p>
                  <p className="mt-2 text-sm text-[var(--foreground)]">Suggestion: {issue.suggestion}</p>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <EmptyState title="No AI review yet" description="Generate the AI review from the student detail page first." />
        )}
      </section>

      <MentorFeedbackForm submissionId={submission.id} />
    </div>
  );
}