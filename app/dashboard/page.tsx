import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { getDemoDashboardData } from "@/lib/demo-data";

export const dynamic = "force-dynamic";

function average(values: number[]) {
  if (values.length === 0) return null;
  return Math.round(values.reduce((sum, value) => sum + value, 0) / values.length);
}

type DashboardSubmission = {
  id: string;
  title: string;
  language: string;
  difficulty: string;
  status: string;
  topic: string;
  prompt: string;
  createdAt: Date;
  updatedAt: Date;
  aiReview: {
    overallScore: number | null;
    correctnessScore: number | null;
    readabilityScore: number | null;
    complexityScore: number | null;
    securityScore: number | null;
    issues: Array<unknown>;
  } | null;
};

function ScoreRing({ score, size = 56 }: { score: number; size?: number }) {
  const radius = (size - 8) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const color = score >= 80 ? "#0d9488" : score >= 60 ? "#d97706" : "#dc2626";
  return (
    <svg width={size} height={size} className="shrink-0">
      <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#e2e8f0" strokeWidth="4" />
      <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={color} strokeWidth="4" strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round" transform={`rotate(-90 ${size / 2} ${size / 2})`} className="transition-all duration-700" />
    </svg>
  );
}

const statCards = [
  { key: "recent", label: "Recent submissions", gradient: "from-indigo-500 to-purple-600", icon: "📝", animation: "animate-fade-in-up" },
  { key: "score", label: "Average review score", gradient: "from-emerald-500 to-teal-600", icon: "⭐", animation: "animate-fade-in-up" },
  { key: "issues", label: "Open improvement items", gradient: "from-amber-500 to-orange-600", icon: "🎯", animation: "animate-fade-in-up" },
  { key: "trend", label: "Progress trend", gradient: "from-rose-500 to-pink-600", icon: "📈", animation: "animate-fade-in-up" },
];

export default async function DashboardPage() {
  let submissions: DashboardSubmission[];

  try {
    const liveSubmissions: DashboardSubmission[] = await prisma.codeSubmission.findMany({
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
    submissions = liveSubmissions;
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
      updatedAt: submission.updatedAt,
      aiReview: submission.reviewScore === null ? null : {
        overallScore: submission.reviewScore,
        correctnessScore: submission.correctnessScore,
        readabilityScore: submission.readabilityScore,
        complexityScore: submission.complexityScore,
        securityScore: submission.securityScore,
        issues: []
      }
    }));
  }

  return <DashboardContent submissions={submissions} />;
}

function DashboardContent({ submissions }: { submissions: DashboardSubmission[] }) {
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

  const stats = {
    recent: submissions.length,
    score: averageScore ?? "--",
    issues: openIssues,
    trend: trendDelta === null ? "--" : trendDelta > 0 ? `+${trendDelta}` : `${trendDelta}`,
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between rounded-2xl bg-[var(--gradient-subtle)] p-6 border border-[var(--border)]/50">
        <div>
          <div className="mb-1 flex items-center gap-2">
            <span className="text-2xl">👋</span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-100 px-3 py-0.5 text-xs font-semibold text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300">
              Student dashboard
            </span>
          </div>
          <h1 className="text-3xl font-bold text-[var(--foreground)]">
            Welcome to your learning hub
          </h1>
          <p className="mt-1.5 text-sm text-[var(--muted)]">Track submissions, review feedback, and watch your skills grow.</p>
        </div>
        <Link
          href="/dashboard/submissions/new"
          className="group inline-flex h-11 items-center gap-2 rounded-xl bg-[var(--gradient-hero)] px-5 text-sm font-semibold text-white shadow-lg shadow-indigo-200 transition-all duration-200 hover:shadow-xl hover:shadow-indigo-300 active:scale-95"
        >
          <span className="transition-transform duration-200 group-hover:scale-110">+</span>
          New submission
        </Link>
      </div>

      <div className="grid gap-5 md:grid-cols-4">
        {statCards.map((card, i) => (
          <div
            key={card.key}
            className={`group relative overflow-hidden rounded-2xl bg-[var(--panel)] border border-[var(--border)]/50 p-5 shadow-[var(--shadow-sm)] transition-all duration-300 hover:shadow-[var(--shadow-md)] hover:-translate-y-0.5 ${card.animation}`}
            style={{ animationDelay: `${i * 80}ms` }}
          >
            <div className={`absolute inset-0 bg-gradient-to-br ${card.gradient} opacity-[0.04] transition-opacity duration-300 group-hover:opacity-[0.07]`} />
            <div className="relative z-10">
              <div className="mb-3 flex items-center justify-between">
                <span className="text-xl">{card.icon}</span>
                <div className={`h-1.5 w-12 rounded-full bg-gradient-to-r ${card.gradient} opacity-40`} />
              </div>
              <p className="text-sm font-medium text-[var(--muted)]">{card.label}</p>
              <p className={`mt-1.5 text-3xl font-bold bg-gradient-to-r ${card.gradient} bg-clip-text text-transparent`}>
                {stats[card.key as keyof typeof stats]}
              </p>
              {card.key === "trend" && trendDelta !== null && (
                <p className="mt-1 text-xs text-[var(--muted)]">Last 3 vs previous 3 reviews</p>
              )}
              {card.key === "score" && averageScore !== null && (
                <div className="mt-2">
                  <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-teal-500 transition-all duration-700"
                      style={{ width: `${averageScore}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.4fr_0.9fr]">
        <section className="rounded-2xl border border-indigo-100/60 bg-[var(--panel)] p-5 shadow-[var(--shadow-sm)] transition-all duration-200 hover:shadow-[var(--shadow-md)] dark:border-indigo-900/40">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-[var(--foreground)]">Recent submissions</h2>
              <p className="text-sm text-[var(--muted)]">Your latest work at a glance.</p>
            </div>
            <Link href="/dashboard/submissions" className="rounded-lg bg-indigo-50 px-3.5 py-2 text-sm font-medium text-indigo-600 transition-all hover:bg-indigo-100 dark:bg-indigo-900/40 dark:text-indigo-300 dark:hover:bg-indigo-800/50">
              View all →
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
                    className="inline-flex h-10 items-center justify-center rounded-xl bg-[var(--gradient-hero)] px-4 text-sm font-medium text-white shadow-md transition-all hover:shadow-lg"
                  >
                    Create submission
                  </Link>
                }
              />
            </div>
          ) : (
            <div className="mt-5">
              <div className="overflow-x-auto rounded-xl border border-[var(--border)]">
                <table className="w-full border-collapse text-left text-sm">
                  <thead>
                    <tr className="bg-[var(--panel-strong)] text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
                      <th className="px-4 py-3">Title</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3">Score</th>
                      <th className="px-4 py-3">Updated</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--border)]">
                    {submissions.slice(0, 5).map((s, i) => (
                      <tr key={s.id} className="transition-colors hover:bg-indigo-50/40 dark:hover:bg-indigo-900/20" style={{ animationDelay: `${i * 60}ms` }}>
                        <td className="px-4 py-3">
                          <Link href={`/dashboard/submissions/${s.id}`} className="font-medium text-[var(--foreground)] transition-colors hover:text-indigo-600">
                            {s.title}
                          </Link>
                          <div className="mt-0.5 text-xs text-[var(--muted)]">
                            <span className="inline-flex items-center gap-1">
                              <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium dark:bg-slate-800 dark:text-slate-300">{s.language}</span>
                              <span>·</span>
                              <span>{s.difficulty}</span>
                              <span>·</span>
                              <span>{s.topic}</span>
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <Badge tone={s.status === "REVIEWED" ? "green" : s.status === "ARCHIVED" ? "amber" : s.status === "SUBMITTED" ? "blue" : "neutral"}>
                            {s.status}
                          </Badge>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            {s.aiReview?.overallScore != null ? (
                              <>
                                <ScoreRing score={s.aiReview.overallScore} size={28} />
                                <span className={`font-semibold ${s.aiReview.overallScore >= 80 ? "text-emerald-600" : s.aiReview.overallScore >= 60 ? "text-amber-600" : "text-rose-600"}`}>
                                  {s.aiReview.overallScore}
                                </span>
                              </>
                            ) : (
                              <span className="text-[var(--muted)]">--</span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-xs text-[var(--muted)]">{new Date(s.updatedAt).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </section>

        <section className="rounded-2xl border border-amber-100/60 bg-[var(--panel)] p-5 shadow-[var(--shadow-sm)] transition-all duration-200 hover:shadow-[var(--shadow-md)] dark:border-amber-900/40">
          <h2 className="text-lg font-semibold text-[var(--foreground)]">Review themes</h2>
          <p className="mt-1 text-sm text-[var(--muted)]">Common focus areas across your reviews.</p>
          <div className="mt-5 space-y-3">
            {submissions.length === 0 ? (
              <p className="text-sm text-[var(--muted)]">Create a submission to surface review themes.</p>
            ) : (
              [
                { label: "Correctness", gradient: "from-blue-500 to-indigo-600", bg: "bg-blue-50 dark:bg-blue-900/30", count: submissions.filter((s) => s.aiReview?.correctnessScore !== undefined).length },
                { label: "Readability", gradient: "from-emerald-500 to-teal-600", bg: "bg-emerald-50 dark:bg-emerald-900/30", count: submissions.filter((s) => s.aiReview?.readabilityScore !== undefined).length },
                { label: "Complexity", gradient: "from-amber-500 to-orange-600", bg: "bg-amber-50 dark:bg-amber-900/30", count: submissions.filter((s) => s.aiReview?.complexityScore !== undefined).length },
                { label: "Security", gradient: "from-rose-500 to-pink-600", bg: "bg-rose-50 dark:bg-rose-900/30", count: submissions.filter((s) => s.aiReview?.securityScore !== undefined).length },
              ].map((item) => (
                <div key={item.label} className={`group flex items-center justify-between rounded-xl ${item.bg} px-4 py-3 transition-all duration-200 hover:shadow-sm`}>
                  <div className="flex items-center gap-3">
                    <div className={`h-2.5 w-2.5 rounded-full bg-gradient-to-r ${item.gradient}`} />
                    <span className="text-sm font-medium text-[var(--foreground)]">{item.label}</span>
                  </div>
                  <span className={`rounded-full bg-gradient-to-r ${item.gradient} px-2.5 py-0.5 text-xs font-semibold text-white`}>
                    {item.count}
                  </span>
                </div>
              ))
            )}
          </div>
          {trendDelta !== null ? (
            <div className={`mt-5 rounded-xl p-3 text-sm ${trendDelta > 0 ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300" : trendDelta < 0 ? "bg-rose-50 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300" : "bg-slate-50 text-slate-600 dark:bg-slate-800/50 dark:text-slate-300"}`}>
              <span className="mr-1.5">{trendDelta > 0 ? "📈" : trendDelta < 0 ? "📉" : "➡️"}</span>
              {trendDelta > 0 ? "Your recent scores are improving!" : trendDelta < 0 ? "Recent scores dipped slightly." : "Your scores are holding steady."}
            </div>
          ) : null}
        </section>
      </div>
    </div>
  );
}
