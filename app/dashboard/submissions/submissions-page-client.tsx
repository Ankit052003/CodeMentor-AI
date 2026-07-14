"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { LoadingState } from "@/components/ui/loading-state";

export type Submission = {
  id: string;
  title: string;
  language: string;
  difficulty: string;
  status: string;
  topic: string;
  prompt: string;
  createdAt: string;
  reviewScore: number | null;
};

export function SubmissionsPageClient({ initialSubmissions }: { initialSubmissions: Submission[] }) {
  const [subs, setSubs] = useState(initialSubmissions);
  const [loading, setLoading] = useState(false);
  const [language, setLanguage] = useState("");
  const [topic, setTopic] = useState("");
  const [status, setStatus] = useState("");
  const [scoreMin, setScoreMin] = useState("");
  const [scoreMax, setScoreMax] = useState("");

  async function loadSubmissions() {
    const searchParams = new URLSearchParams();
    if (language) searchParams.set("language", language);
    if (topic) searchParams.set("topic", topic);
    if (status) searchParams.set("status", status);
    if (scoreMin) searchParams.set("scoreMin", scoreMin);
    if (scoreMax) searchParams.set("scoreMax", scoreMax);

    const response = await fetch(`/api/submissions${searchParams.toString() ? `?${searchParams}` : ""}`);
    const data = await response.json();
    setSubs(data.submissions || []);
    setLoading(false);
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Your Submissions</h1>
          <p className="mt-1 text-sm text-[var(--muted)]">Review recent work, filter by topic, and continue drafts.</p>
        </div>
        <Link
          href="/dashboard/submissions/new"
          className="inline-flex h-10 items-center justify-center rounded-md bg-[var(--primary)] px-4 text-sm font-medium text-[var(--primary-foreground)] transition hover:bg-blue-700"
        >
          New Submission
        </Link>
      </div>

      <div className="grid gap-4 rounded-2xl border border-[var(--border)] bg-white p-4 sm:grid-cols-6">
        <label className="grid gap-1 text-sm">
          <span className="font-medium">Language</span>
          <select className="h-10 rounded-md border border-[var(--border)] px-3" value={language} onChange={(e) => setLanguage(e.target.value)}>
            <option value="">All</option>
            <option value="JAVASCRIPT">JavaScript</option>
            <option value="TYPESCRIPT">TypeScript</option>
            <option value="PYTHON">Python</option>
          </select>
        </label>
        <label className="grid gap-1 text-sm">
          <span className="font-medium">Topic</span>
          <input className="h-10 rounded-md border border-[var(--border)] px-3" value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="Arrays, recursion..." />
        </label>
        <label className="grid gap-1 text-sm">
          <span className="font-medium">Status</span>
          <select className="h-10 rounded-md border border-[var(--border)] px-3" value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="">All</option>
            <option value="DRAFT">Draft</option>
            <option value="SUBMITTED">Submitted</option>
            <option value="REVIEWED">Reviewed</option>
            <option value="ARCHIVED">Archived</option>
          </select>
        </label>
        <label className="grid gap-1 text-sm">
          <span className="font-medium">Min score</span>
          <input
            type="number"
            min="0"
            max="100"
            className="h-10 rounded-md border border-[var(--border)] px-3"
            value={scoreMin}
            onChange={(e) => setScoreMin(e.target.value)}
            placeholder="0"
          />
        </label>
        <label className="grid gap-1 text-sm">
          <span className="font-medium">Max score</span>
          <input
            type="number"
            min="0"
            max="100"
            className="h-10 rounded-md border border-[var(--border)] px-3"
            value={scoreMax}
            onChange={(e) => setScoreMax(e.target.value)}
            placeholder="100"
          />
        </label>
        <div className="flex items-end">
          <Button
            variant="secondary"
            className="w-full"
            onClick={() => {
              setLoading(true);
              void loadSubmissions();
            }}
          >
            Apply filters
          </Button>
        </div>
      </div>

      {loading ? (
        <LoadingState />
      ) : subs.length === 0 ? (
        <EmptyState
          title="No submissions found"
          description="Create your first draft or widen the filters to see older work."
          action={
            <Link
              href="/dashboard/submissions/new"
              className="inline-flex h-10 items-center justify-center rounded-md bg-[var(--primary)] px-4 text-sm font-medium text-[var(--primary-foreground)] transition hover:bg-blue-700"
            >
              Create submission
            </Link>
          }
        />
      ) : (
        <ul className="grid gap-4">
          {subs.map((s) => (
            <li key={s.id} className="rounded-2xl border border-[var(--border)] bg-white p-4 transition hover:-translate-y-0.5 hover:shadow-sm">
              <Link href={`/dashboard/submissions/${s.id}`} className="block">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-base font-semibold text-[var(--foreground)]">{s.title}</h2>
                      <Badge tone={s.status === "REVIEWED" ? "green" : s.status === "ARCHIVED" ? "amber" : s.status === "SUBMITTED" ? "blue" : "neutral"}>{s.status}</Badge>
                      <Badge tone={s.reviewScore !== null ? "green" : "neutral"}>{s.reviewScore !== null ? `${s.reviewScore}/100` : "No score yet"}</Badge>
                    </div>
                    <p className="text-sm text-[var(--muted)]">
                      {s.language} • {s.difficulty} • {s.topic}
                    </p>
                    <p className="max-w-2xl text-sm text-[var(--muted)] line-clamp-2">{s.prompt}</p>
                  </div>
                  <div className="text-sm text-[var(--muted)]">{new Date(s.createdAt).toLocaleDateString()}</div>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
