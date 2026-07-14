import React from "react";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { CodeView } from "@/components/app/code-view";
import { AiReviewGenerator } from "@/components/app/ai-review-generator";
import { SubmissionDetailActions } from "@/components/app/submission-detail-actions";
import { SubmissionRevisionForm } from "@/components/app/submission-revision-form";
import { ExerciseCard } from "@/components/app/exercise-card";
import { ReflectionForm } from "@/components/app/reflection-form";
import { RevisionComparison } from "@/components/app/revision-comparison";
import { getDemoSubmissionDetail } from "@/lib/demo-data";

type Props = { params: { id: string } };

export const dynamic = "force-dynamic";

type SubmissionDetailData = Awaited<ReturnType<typeof getDemoSubmissionDetail>>;

function ScoreBadge({ score, label }: { score: number | null | undefined; label: string }) {
  if (score == null) return null;
  const color = score >= 80 ? "from-emerald-500 to-teal-600" : score >= 60 ? "from-amber-500 to-orange-600" : "from-rose-500 to-pink-600";
  return (
    <div className="group relative overflow-hidden rounded-xl border border-[var(--border)]/50 bg-[var(--panel)] p-4 shadow-[var(--shadow-sm)] transition-all duration-200 hover:shadow-[var(--shadow-md)] hover:-translate-y-0.5">
      <div className={`absolute inset-0 bg-gradient-to-br ${color} opacity-[0.04]`} />
      <p className="relative text-xs font-medium text-[var(--muted)]">{label}</p>
      <p className={`relative mt-1 text-2xl font-bold bg-gradient-to-r ${color} bg-clip-text text-transparent`}>{score}</p>
    </div>
  );
}

function SectionCard({ title, description, gradient, children, className = "" }: { title: string; description?: string; gradient: string; children: React.ReactNode; className?: string }) {
  return (
    <section className={`relative overflow-hidden rounded-2xl border border-[var(--border)]/50 bg-[var(--panel)] p-5 shadow-[var(--shadow-sm)] transition-all duration-200 hover:shadow-[var(--shadow-md)] ${className}`}>
      <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-[0.03]`} />
      <div className="relative">
        <div className="mb-4 flex items-center gap-3">
          <div className={`h-1 w-8 rounded-full bg-gradient-to-r ${gradient}`} />
          <div>
            <h2 className="text-lg font-semibold text-[var(--foreground)]">{title}</h2>
            {description ? <p className="mt-0.5 text-sm text-[var(--muted)]">{description}</p> : null}
          </div>
        </div>
        {children}
      </div>
    </section>
  );
}

export default async function SubmissionDetail({ params }: Props) {
  let submission: SubmissionDetailData;
  let exercises: Array<{ id: string; title: string; description: string; difficulty: string; expectedConcept: string; status: string; completedAt: Date | null }> = [];

  try {
    const liveSubmission = await prisma.codeSubmission.findUnique({
      where: { id: params.id },
      include: {
        student: true,
        aiReview: { include: { issues: true } },
        mentorComments: true,
        exercises: true,
        revisions: true
      }
    });

    if (!liveSubmission) {
      submission = getDemoSubmissionDetail(params.id);
    } else {
      const progressEvents = await prisma.progressEvent.findMany({
        where: { studentId: liveSubmission.studentId },
        orderBy: { createdAt: "desc" }
      });

      exercises = liveSubmission.exercises.map((e) => ({
        id: e.id,
        title: e.title,
        description: e.description,
        difficulty: e.difficulty,
        expectedConcept: e.expectedConcept,
        status: e.status,
        completedAt: e.completedAt,
      }));

      submission = {
        ...liveSubmission,
        progressEvents: progressEvents.filter((event) => {
          const metadata = event.metadata as { submissionId?: string } | null;
          return metadata?.submissionId === liveSubmission.id;
        })
      } as unknown as SubmissionDetailData;
    }
  } catch {
    submission = getDemoSubmissionDetail(params.id);
  }

  const statusTone = submission.status === "REVIEWED" ? "green" : submission.status === "ARCHIVED" ? "amber" : submission.status === "SUBMITTED" ? "blue" : "neutral";
  const latestRevision = submission.revisions[0];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 rounded-2xl border border-[var(--border)]/50 bg-[var(--gradient-subtle)] p-6 shadow-sm sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-bold text-[var(--foreground)]">{submission.title}</h1>
            <Badge tone={statusTone}>{submission.status}</Badge>
            {submission.aiReview ? (
              <Badge tone="green">
                <span className="flex items-center gap-1">
                  <span>{submission.aiReview.overallScore}/100</span>
                  <span className="text-[10px]">●</span>
                  <span>Overall</span>
                </span>
              </Badge>
            ) : null}
          </div>
          <p className="flex items-center gap-2 text-sm text-[var(--muted)]">
            <span className="rounded bg-[var(--panel)]/80 px-2 py-0.5 text-xs font-medium">{submission.language}</span>
            <span>·</span>
            <span>{submission.difficulty}</span>
            <span>·</span>
            <span>{submission.topic}</span>
          </p>
        </div>
        <SubmissionDetailActions submissionId={submission.id} status={submission.status} />
      </div>

      <div className="grid gap-4 sm:grid-cols-4">
        <ScoreBadge score={submission.aiReview?.overallScore} label="Overall" />
        <ScoreBadge score={submission.aiReview?.correctnessScore} label="Correctness" />
        <ScoreBadge score={submission.aiReview?.readabilityScore} label="Readability" />
        <ScoreBadge score={submission.aiReview?.complexityScore} label="Complexity" />
      </div>

      <SectionCard title="Problem" gradient="from-blue-500 to-indigo-600">
        <pre className="overflow-x-auto whitespace-pre-wrap rounded-xl border border-[var(--border)] bg-gradient-to-br from-slate-50 to-blue-50/30 p-4 text-sm text-slate-700 dark:from-slate-800/50 dark:to-indigo-900/20 dark:text-slate-300">{submission.prompt}</pre>
      </SectionCard>

      <SectionCard title="Source Code" gradient="from-purple-500 to-violet-600">
        <CodeView code={submission.sanitizedSourceCode} language={submission.language} />
      </SectionCard>

      <SectionCard title="AI Review" gradient="from-emerald-500 to-teal-600">
        <AiReviewGenerator submissionId={submission.id} hasExistingReview={Boolean(submission.aiReview)} />

        {submission.aiReview ? (
          <div className="mt-4 space-y-4">
            <div className="rounded-xl border border-emerald-100 bg-emerald-50/50 p-4 dark:border-emerald-800 dark:bg-emerald-900/20">
              <p className="text-sm leading-relaxed text-emerald-800 dark:text-emerald-300">{submission.aiReview.summary}</p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {submission.aiReview.issues.map((issue) => (
                <div key={issue.id} className="group rounded-xl border border-[var(--border)] bg-[var(--panel)] p-4 shadow-sm transition-all duration-200 hover:shadow-md hover:-translate-y-0.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-semibold text-[var(--foreground)]">{issue.title}</span>
                    <Badge tone={issue.severity === "CRITICAL" || issue.severity === "HIGH" ? "red" : issue.severity === "MEDIUM" ? "amber" : "blue"}>{issue.severity}</Badge>
                    <Badge tone={issue.category === "BUG" ? "red" : issue.category === "SECURITY" ? "red" : issue.category === "COMPLEXITY" ? "amber" : issue.category === "STYLE" ? "blue" : "neutral"}>{issue.category}</Badge>
                  </div>
                  <p className="mt-2 text-sm text-[var(--muted)]">{issue.explanation}</p>
                  <div className="mt-2 rounded-lg border border-dashed border-indigo-200 bg-indigo-50/50 p-2.5 text-sm text-indigo-700 dark:border-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300">
                    <span className="font-medium">Suggestion:</span> {issue.suggestion}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <EmptyState title="No AI review yet" description="Submit the code for review to see scores, issues, and improvement suggestions here." />
        )}
      </SectionCard>

      {latestRevision ? (
        <RevisionComparison
          originalSource={submission.sourceCode}
          latestSource={latestRevision.sourceCode}
          revisionSummary={latestRevision.changeSummary}
          revisionCreatedAt={new Date(latestRevision.createdAt).toLocaleString()}
        />
      ) : null}

      {submission.status !== "DRAFT" ? <SubmissionRevisionForm submissionId={submission.id} /> : null}

      <div className="grid gap-6 md:grid-cols-2">
        <SectionCard title="Revisions" gradient="from-amber-500 to-orange-600">
          {submission.revisions.length > 0 ? (
            <ul className="space-y-2 text-sm">
              {submission.revisions.map((revision) => (
                <li key={revision.id} className="rounded-xl border border-amber-100 bg-amber-50/30 p-3 transition-colors hover:bg-amber-50/60 dark:border-amber-800 dark:bg-amber-900/20 dark:hover:bg-amber-900/40">
                  <div className="font-medium text-[var(--foreground)]">{revision.changeSummary}</div>
                  <div className="mt-0.5 text-xs text-[var(--muted)]">{new Date(revision.createdAt).toLocaleString()}</div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-[var(--muted)]">No revisions yet.</p>
          )}
        </SectionCard>

        <SectionCard title="Follow-up Exercises" gradient="from-rose-500 to-pink-600">
          {exercises.length > 0 ? (
            <ul className="space-y-2 text-sm">
              {exercises.map((exercise) => (
                <li key={exercise.id}>
                  <ExerciseCard exercise={{ ...exercise, completedAt: exercise.completedAt?.toISOString?.() ?? null }} />
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-[var(--muted)]">No follow-up exercises assigned.</p>
          )}
        </SectionCard>
      </div>

      <ReflectionForm submissionId={submission.id} />

      {submission.progressEvents?.length > 0 ? (
        <SectionCard title="Improvement Tracker" gradient="from-teal-500 to-cyan-600">
          <ul className="mt-2 space-y-2 text-sm">
            {submission.progressEvents.map((event) => (
              <li key={event.id} className="rounded-xl border border-teal-100 bg-teal-50/30 p-3 transition-colors hover:bg-teal-50/60 dark:border-teal-800 dark:bg-teal-900/20 dark:hover:bg-teal-900/40">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-[var(--foreground)]">{event.eventType}</span>
                  <span className="text-xs text-[var(--muted)]">{new Date(event.createdAt).toLocaleString()}</span>
                </div>
                {typeof event.metadata === "object" && event.metadata && "reflection" in event.metadata ? (
                  <div className="mt-1.5 rounded-lg border border-dashed border-teal-200 bg-white p-2 text-xs text-teal-700 dark:border-teal-700 dark:bg-[var(--panel)] dark:text-teal-300">
                    {String((event.metadata as { reflection?: string }).reflection ?? "")}
                  </div>
                ) : null}
              </li>
            ))}
          </ul>
        </SectionCard>
      ) : null}

      {submission.mentorComments.length > 0 ? (
        <SectionCard title="Mentor Comments" gradient="from-sky-500 to-blue-600">
          <ul className="space-y-2 text-sm">
            {submission.mentorComments.map((comment) => (
              <li key={comment.id} className="rounded-xl border border-sky-100 bg-sky-50/30 p-3 text-[var(--muted)] transition-colors hover:bg-sky-50/60 dark:border-sky-800 dark:bg-sky-900/20 dark:hover:bg-sky-900/40">
                {comment.body}
              </li>
            ))}
          </ul>
        </SectionCard>
      ) : null}
    </div>
  );
}
