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

type PageInfo = {
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
};

function ScoreBadge({ score }: { score: number | null }) {
  if (score == null) return <Badge tone="neutral">No score</Badge>;
  const color = score >= 80 ? "green" : score >= 60 ? "amber" : "red";
  return <Badge tone={color}>{score}/100</Badge>;
}

function StatusBadge({ status }: { status: string }) {
  const tone = status === "REVIEWED" ? "green" : status === "ARCHIVED" ? "amber" : status === "SUBMITTED" ? "blue" : "neutral";
  return <Badge tone={tone}>{status}</Badge>;
}

export function SubmissionsPageClient({
  initialSubmissions,
  initialPageInfo
}: {
  initialSubmissions: Submission[];
  initialPageInfo: PageInfo;
}) {
  const [subs, setSubs] = useState(initialSubmissions);
  const [loading, setLoading] = useState(false);
  const [pageInfo, setPageInfo] = useState(initialPageInfo);
  const [language, setLanguage] = useState("");
  const [topic, setTopic] = useState("");
  const [status, setStatus] = useState("");
  const [scoreMin, setScoreMin] = useState("");
  const [scoreMax, setScoreMax] = useState("");

  async function loadSubmissions(page = 1) {
    const searchParams = new URLSearchParams();
    if (language) searchParams.set("language", language);
    if (topic) searchParams.set("topic", topic);
    if (status) searchParams.set("status", status);
    if (scoreMin) searchParams.set("scoreMin", scoreMin);
    if (scoreMax) searchParams.set("scoreMax", scoreMax);
    searchParams.set("page", String(page));
    searchParams.set("pageSize", String(pageInfo.pageSize));

    const response = await fetch(`/api/submissions${searchParams.toString() ? `?${searchParams}` : ""}`);
    const data = await response.json();
    setSubs(data.submissions || []);
    setPageInfo({
      page: data.page ?? page,
      pageSize: data.pageSize ?? pageInfo.pageSize,
      totalCount: data.totalCount ?? (data.submissions || []).length,
      totalPages: data.totalPages ?? 1
    });
    setLoading(false);
  }

  return (
    <div className="space-y-8">
      <div className="rounded-2xl border border-[var(--border)]/50 bg-[var(--gradient-subtle)] p-6 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="mb-1 flex items-center gap-2">
              <span className="text-xl">📝</span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-100 px-3 py-0.5 text-xs font-semibold text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300">
                {pageInfo.totalCount} total
              </span>
            </div>
            <h1 className="text-2xl font-bold text-[var(--foreground)]">Your submissions</h1>
            <p className="mt-1 text-sm text-[var(--muted)]">Review recent work, filter by topic, and continue drafts.</p>
          </div>
          <Link
            href="/dashboard/submissions/new"
            className="group inline-flex h-11 items-center gap-2 rounded-xl bg-[var(--gradient-hero)] px-5 text-sm font-semibold text-white shadow-lg shadow-indigo-200 transition-all duration-200 hover:shadow-xl hover:shadow-indigo-300 active:scale-95"
          >
            <span className="text-lg transition-transform duration-200 group-hover:scale-110">+</span>
            New submission
          </Link>
        </div>
      </div>

      <div className="grid gap-4 rounded-2xl border border-[var(--border)] bg-[var(--panel)] p-5 sm:grid-cols-6 shadow-sm transition-all duration-200 hover:shadow-md hover:-translate-y-0.5">
        <label className="grid gap-1.5 text-sm">
          <span className="font-medium text-[var(--foreground)]">Language</span>
            <select className="h-10 rounded-xl border border-[var(--border)] bg-[var(--panel)] px-3 text-sm outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 dark:focus:border-indigo-500 dark:focus:ring-indigo-900/50" value={language} onChange={(e) => setLanguage(e.target.value)}>
            <option value="">All languages</option>
            <option value="JAVASCRIPT">JavaScript</option>
            <option value="TYPESCRIPT">TypeScript</option>
            <option value="PYTHON">Python</option>
          </select>
        </label>
        <label className="grid gap-1.5 text-sm">
          <span className="font-medium text-[var(--foreground)]">Topic</span>
            <input className="h-10 rounded-xl border border-[var(--border)] bg-[var(--panel)] px-3 text-sm outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 dark:focus:border-indigo-500 dark:focus:ring-indigo-900/50" value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="Arrays, recursion..." />
        </label>
        <label className="grid gap-1.5 text-sm">
          <span className="font-medium text-[var(--foreground)]">Status</span>
            <select className="h-10 rounded-xl border border-[var(--border)] bg-[var(--panel)] px-3 text-sm outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 dark:focus:border-indigo-500 dark:focus:ring-indigo-900/50" value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="">All statuses</option>
            <option value="DRAFT">Draft</option>
            <option value="SUBMITTED">Submitted</option>
            <option value="REVIEWED">Reviewed</option>
            <option value="ARCHIVED">Archived</option>
          </select>
        </label>
        <label className="grid gap-1.5 text-sm">
          <span className="font-medium text-[var(--foreground)]">Min score</span>
            <input
              type="number" min="0" max="100"
              className="h-10 rounded-xl border border-[var(--border)] bg-[var(--panel)] px-3 text-sm outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 dark:focus:border-indigo-500 dark:focus:ring-indigo-900/50"
              value={scoreMin} onChange={(e) => setScoreMin(e.target.value)} placeholder="0"
            />
        </label>
        <label className="grid gap-1.5 text-sm">
          <span className="font-medium text-[var(--foreground)]">Max score</span>
            <input
              type="number" min="0" max="100"
              className="h-10 rounded-xl border border-[var(--border)] bg-[var(--panel)] px-3 text-sm outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 dark:focus:border-indigo-500 dark:focus:ring-indigo-900/50"
              value={scoreMax} onChange={(e) => setScoreMax(e.target.value)} placeholder="100"
            />
        </label>
        <div className="flex items-end">
          <Button
            className="w-full h-10 rounded-xl"
            onClick={() => { setLoading(true); void loadSubmissions(1); }}
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
              className="inline-flex h-10 items-center justify-center rounded-xl bg-[var(--gradient-hero)] px-4 text-sm font-medium text-white shadow-md transition-all hover:shadow-lg"
            >
              Create submission
            </Link>
          }
        />
      ) : (
        <div className="space-y-4">
          <div className="grid gap-4">
            {subs.map((s, i) => (
              <Link
                key={s.id}
                href={`/dashboard/submissions/${s.id}`}
                className="group relative overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--panel)] p-5 shadow-[var(--shadow-sm)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[var(--shadow-md)]"
                style={{ animationDelay: `${i * 60}ms` }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 via-transparent to-transparent opacity-[0.03] transition-opacity duration-300 group-hover:opacity-[0.06]" />
                <div className="relative flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0 flex-1 space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-base font-semibold text-[var(--foreground)] group-hover:text-indigo-600 transition-colors">{s.title}</h2>
                      <StatusBadge status={s.status} />
                      <ScoreBadge score={s.reviewScore} />
                    </div>
                    <div className="flex flex-wrap items-center gap-1.5 text-sm text-[var(--muted)]">
                      <span className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300">{s.language}</span>
                      <span>·</span>
                      <span>{s.difficulty}</span>
                      <span>·</span>
                      <span>{s.topic}</span>
                    </div>
                    <p className="max-w-3xl text-sm leading-relaxed text-[var(--muted)] line-clamp-2">{s.prompt}</p>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-[var(--muted)] sm:flex-col sm:items-end sm:shrink-0">
                    <span>{new Date(s.createdAt).toLocaleDateString()}</span>
                    <span className="text-indigo-400 group-hover:translate-x-0.5 transition-transform">→</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          <div className="flex items-center justify-between gap-3 rounded-2xl border border-[var(--border)] bg-[var(--panel)] px-5 py-3 text-sm text-[var(--muted)] shadow-[var(--shadow-sm)]">
            <span className="font-medium">
              Page {pageInfo.page} of {pageInfo.totalPages} · {pageInfo.totalCount} submissions
            </span>
            <div className="flex gap-2">
              <Button
                variant="secondary"
                size="sm"
                disabled={loading || pageInfo.page <= 1}
                onClick={() => { setLoading(true); void loadSubmissions(pageInfo.page - 1); }}
              >
                ← Previous
              </Button>
              <Button
                variant="secondary"
                size="sm"
                disabled={loading || pageInfo.page >= pageInfo.totalPages}
                onClick={() => { setLoading(true); void loadSubmissions(pageInfo.page + 1); }}
              >
                Next →
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
