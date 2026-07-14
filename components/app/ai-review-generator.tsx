"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

type ReviewIssue = {
  id?: string;
  title: string;
  explanation: string;
  suggestion: string;
  severity: string;
  category: string;
  lineStart?: number | null;
  lineEnd?: number | null;
};

type GeneratedReview = {
  summary: string;
  overallScore: number;
  correctnessScore: number;
  readabilityScore: number;
  complexityScore: number;
  securityScore: number;
  issues: ReviewIssue[];
  suggestedCode: string;
  beginnerExplanation: string;
  followUpExercises: Array<{
    title: string;
    description: string;
    difficulty: string;
    expectedConcept: string;
  }>;
  securityWarnings: string[];
};

type AiReviewGeneratorProps = {
  submissionId: string;
  hasExistingReview: boolean;
};

export function AiReviewGenerator({ submissionId, hasExistingReview }: AiReviewGeneratorProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedReview, setGeneratedReview] = useState<GeneratedReview | null>(null);

  async function generateReview() {
    setLoading(true);
    setError(null);

    const response = await fetch(`/api/submissions/${submissionId}/review`, {
      method: "POST"
    });
    const data = await response.json().catch(() => null);

    if (!response.ok) {
      setError(data?.error ?? "Unable to generate the review.");
      setLoading(false);
      return;
    }

    setGeneratedReview(data.review);
    setLoading(false);
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <Button onClick={generateReview} disabled={loading}>
          {loading ? "Generating…" : hasExistingReview ? "Regenerate review" : "Generate AI review"}
        </Button>
        {generatedReview?.securityWarnings?.length ? <Badge tone="red">Security warning</Badge> : null}
      </div>

      {error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
      ) : null}

      {generatedReview ? (
        <div className="space-y-4 rounded-2xl border border-[var(--border)] bg-slate-50 p-4">
          <div className="grid gap-3 sm:grid-cols-4">
            <div className="rounded-xl border border-[var(--border)] bg-white p-3">
              <p className="text-xs text-[var(--muted)]">Overall</p>
              <p className="text-2xl font-semibold">{generatedReview.overallScore}</p>
            </div>
            <div className="rounded-xl border border-[var(--border)] bg-white p-3">
              <p className="text-xs text-[var(--muted)]">Correctness</p>
              <p className="text-2xl font-semibold">{generatedReview.correctnessScore}</p>
            </div>
            <div className="rounded-xl border border-[var(--border)] bg-white p-3">
              <p className="text-xs text-[var(--muted)]">Readability</p>
              <p className="text-2xl font-semibold">{generatedReview.readabilityScore}</p>
            </div>
            <div className="rounded-xl border border-[var(--border)] bg-white p-3">
              <p className="text-xs text-[var(--muted)]">Security</p>
              <p className="text-2xl font-semibold">{generatedReview.securityScore}</p>
            </div>
          </div>

          <div className="rounded-xl border border-[var(--border)] bg-white p-4">
            <h3 className="font-semibold text-[var(--foreground)]">Beginner explanation</h3>
            <p className="mt-2 text-sm text-[var(--muted)]">{generatedReview.beginnerExplanation}</p>
          </div>

          <div className="rounded-xl border border-[var(--border)] bg-white p-4">
            <h3 className="font-semibold text-[var(--foreground)]">Suggested improved code</h3>
            <pre className="mt-2 overflow-x-auto rounded-xl bg-slate-950 p-3 text-sm text-slate-50"><code>{generatedReview.suggestedCode}</code></pre>
          </div>

          {generatedReview.securityWarnings.length > 0 ? (
            <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              <h3 className="font-semibold">Security warnings</h3>
              <ul className="mt-2 list-disc space-y-1 pl-5">
                {generatedReview.securityWarnings.map((warning) => (
                  <li key={warning}>{warning}</li>
                ))}
              </ul>
            </div>
          ) : null}

          {generatedReview.followUpExercises.length > 0 ? (
            <div className="rounded-xl border border-[var(--border)] bg-white p-4">
              <h3 className="font-semibold text-[var(--foreground)]">Follow-up exercises</h3>
              <ul className="mt-2 space-y-2 text-sm text-[var(--muted)]">
                {generatedReview.followUpExercises.map((exercise) => (
                  <li key={exercise.title} className="rounded-lg border border-[var(--border)] p-3">
                    <div className="font-medium text-[var(--foreground)]">{exercise.title}</div>
                    <div>{exercise.description}</div>
                    <div className="mt-1 text-xs">{exercise.expectedConcept} · {exercise.difficulty}</div>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          {generatedReview.issues.length > 0 ? (
            <div className="grid gap-3 md:grid-cols-2">
              {generatedReview.issues.map((issue) => (
                <div key={`${issue.title}-${issue.category}`} className="rounded-xl border border-[var(--border)] bg-white p-4">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-[var(--foreground)]">{issue.title}</p>
                    <Badge tone={issue.severity === "HIGH" || issue.severity === "CRITICAL" ? "red" : issue.severity === "MEDIUM" ? "amber" : "blue"}>
                      {issue.severity}
                    </Badge>
                  </div>
                  <p className="mt-2 text-sm text-[var(--muted)]">{issue.explanation}</p>
                  <p className="mt-2 text-sm text-[var(--foreground)]">Suggestion: {issue.suggestion}</p>
                </div>
              ))}
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}