import React from "react";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { CodeView } from "@/components/app/code-view";
import { SubmissionDetailActions } from "@/components/app/submission-detail-actions";
import { SubmissionRevisionForm } from "@/components/app/submission-revision-form";

type Props = { params: { id: string } };

export const dynamic = "force-dynamic";

export default async function SubmissionDetail({ params }: Props) {
  const submission = await prisma.codeSubmission.findUnique({
    where: { id: params.id },
    include: {
      aiReview: { include: { issues: true } },
      mentorComments: true,
      exercises: true,
      revisions: true
    }
  });

  if (!submission) {
    return (
      <div className="p-6">
        <EmptyState
          title="Submission not found"
          description="The submission may have been deleted or archived."
          action={
            <Link href="/dashboard/submissions" className="text-sm font-medium text-[var(--primary)] hover:underline">
              Back to submissions
            </Link>
          }
        />
      </div>
    );
  }

  const statusTone = submission.status === "REVIEWED" ? "green" : submission.status === "ARCHIVED" ? "amber" : submission.status === "SUBMITTED" ? "blue" : "neutral";

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-semibold text-[var(--foreground)]">{submission.title}</h1>
            <Badge tone={statusTone}>{submission.status}</Badge>
            {submission.aiReview ? <Badge tone="green">{submission.aiReview.overallScore}/100</Badge> : null}
          </div>
          <p className="text-sm text-[var(--muted)]">
            {submission.language} • {submission.difficulty} • {submission.topic}
          </p>
        </div>

        <SubmissionDetailActions submissionId={submission.id} status={submission.status} />
      </div>

      <section className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-[var(--border)] bg-white p-5">
          <p className="text-sm text-[var(--muted)]">Correctness</p>
          <p className="mt-2 text-2xl font-semibold text-[var(--foreground)]">{submission.aiReview?.correctnessScore ?? "--"}</p>
        </div>
        <div className="rounded-2xl border border-[var(--border)] bg-white p-5">
          <p className="text-sm text-[var(--muted)]">Readability</p>
          <p className="mt-2 text-2xl font-semibold text-[var(--foreground)]">{submission.aiReview?.readabilityScore ?? "--"}</p>
        </div>
        <div className="rounded-2xl border border-[var(--border)] bg-white p-5">
          <p className="text-sm text-[var(--muted)]">Complexity</p>
          <p className="mt-2 text-2xl font-semibold text-[var(--foreground)]">{submission.aiReview?.complexityScore ?? "--"}</p>
        </div>
      </section>

      <section className="space-y-3 rounded-2xl border border-[var(--border)] bg-white p-5">
        <div>
          <h2 className="text-lg font-semibold text-[var(--foreground)]">Prompt</h2>
          <p className="mt-1 text-sm text-[var(--muted)]">The original task description and constraints for this submission.</p>
        </div>
        <pre className="overflow-x-auto whitespace-pre-wrap rounded-2xl border border-[var(--border)] bg-slate-50 p-4 text-sm text-slate-800">{submission.prompt}</pre>
      </section>

      <section className="space-y-3 rounded-2xl border border-[var(--border)] bg-white p-5">
        <div>
          <h2 className="text-lg font-semibold text-[var(--foreground)]">Source code</h2>
          <p className="mt-1 text-sm text-[var(--muted)]">Syntax-highlighted code display with the sanitized source stored for review safety.</p>
        </div>
        <CodeView code={submission.sanitizedSourceCode} language={submission.language} />
      </section>

      <section className="space-y-3 rounded-2xl border border-[var(--border)] bg-white p-5">
        <div>
          <h2 className="text-lg font-semibold text-[var(--foreground)]">AI review</h2>
          <p className="mt-1 text-sm text-[var(--muted)]">Scores, categorized issues, and beginner-friendly feedback.</p>
        </div>

        {submission.aiReview ? (
          <div className="space-y-4">
            <p className="text-sm text-[var(--foreground)]">{submission.aiReview.summary}</p>
            <div className="grid gap-3 sm:grid-cols-2">
              {submission.aiReview.issues.map((issue) => (
                <div key={issue.id} className="rounded-2xl border border-[var(--border)] p-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-medium text-[var(--foreground)]">{issue.title}</span>
                    <Badge tone={issue.severity === "CRITICAL" || issue.severity === "HIGH" ? "red" : issue.severity === "MEDIUM" ? "amber" : "blue"}>{issue.severity}</Badge>
                    <Badge tone="neutral">{issue.category}</Badge>
                  </div>
                  <p className="mt-2 text-sm text-[var(--muted)]">{issue.explanation}</p>
                  <p className="mt-2 text-sm text-[var(--foreground)]">Suggestion: {issue.suggestion}</p>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <EmptyState title="No AI review yet" description="Submit the code for review to see scores, issues, and improvement suggestions here." />
        )}
      </section>

      {submission.status !== "DRAFT" ? <SubmissionRevisionForm submissionId={submission.id} /> : null}

      <section className="grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-[var(--border)] bg-white p-5">
          <h2 className="text-lg font-semibold text-[var(--foreground)]">Revisions</h2>
          {submission.revisions.length > 0 ? (
            <ul className="mt-3 space-y-2 text-sm">
              {submission.revisions.map((revision) => (
                <li key={revision.id} className="rounded-xl border border-[var(--border)] p-3">
                  <div className="font-medium text-[var(--foreground)]">{revision.changeSummary}</div>
                  <div className="text-[var(--muted)]">{new Date(revision.createdAt).toLocaleString()}</div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-2 text-sm text-[var(--muted)]">No revisions yet.</p>
          )}
        </div>

        <div className="rounded-2xl border border-[var(--border)] bg-white p-5">
          <h2 className="text-lg font-semibold text-[var(--foreground)]">Follow-up exercises</h2>
          {submission.exercises.length > 0 ? (
            <ul className="mt-3 space-y-2 text-sm">
              {submission.exercises.map((exercise) => (
                <li key={exercise.id} className="rounded-xl border border-[var(--border)] p-3">
                  <div className="font-medium text-[var(--foreground)]">{exercise.title}</div>
                  <div className="text-[var(--muted)]">{exercise.description}</div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-2 text-sm text-[var(--muted)]">No follow-up exercises assigned.</p>
          )}
        </div>
      </section>

      {submission.mentorComments.length > 0 ? (
        <section className="rounded-2xl border border-[var(--border)] bg-white p-5">
          <h2 className="text-lg font-semibold text-[var(--foreground)]">Mentor comments</h2>
          <ul className="mt-3 space-y-2 text-sm">
            {submission.mentorComments.map((comment) => (
              <li key={comment.id} className="rounded-xl border border-[var(--border)] p-3 text-[var(--muted)]">
                {comment.body}
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}