import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";

export const dynamic = "force-dynamic";

type IssueCategoryCount = { category: string; count: number };
type ScorePoint = { label: string; score: number; date: Date };

async function loadImprovementData(studentId: string) {
  const submissions = await prisma.codeSubmission.findMany({
    where: { studentId, status: { not: "DRAFT" } },
    orderBy: { createdAt: "desc" },
    include: {
      aiReview: { include: { issues: true } },
      revisions: true,
      exercises: { select: { id: true, expectedConcept: true } },
    },
  });

  const categoryMap = new Map<string, number>();
  const scoreTrend: ScorePoint[] = [];
  const languageProgress = new Map<string, { count: number; totalScore: number }>();
  const topicProgress = new Map<string, { count: number; totalScore: number }>();
  const conceptSet = new Set<string>();

  for (const sub of submissions) {
    if (sub.aiReview) {
      for (const issue of sub.aiReview.issues) {
        categoryMap.set(issue.category, (categoryMap.get(issue.category) ?? 0) + 1);
      }
      scoreTrend.push({
        label: sub.title,
        score: sub.aiReview.overallScore,
        date: sub.createdAt,
      });
      const lang = sub.language;
      const curr = languageProgress.get(lang) ?? { count: 0, totalScore: 0 };
      curr.count++;
      curr.totalScore += sub.aiReview.overallScore;
      languageProgress.set(lang, curr);

      const topic = sub.topic;
      const tCurr = topicProgress.get(topic) ?? { count: 0, totalScore: 0 };
      tCurr.count++;
      tCurr.totalScore += sub.aiReview.overallScore;
      topicProgress.set(topic, tCurr);
    }

    for (const exercise of sub.exercises ?? []) {
      conceptSet.add(exercise.expectedConcept);
    }
  }

  const repeatedIssues: IssueCategoryCount[] = [];
  for (const [category, count] of categoryMap) {
    if (count >= 2) repeatedIssues.push({ category, count });
  }
  repeatedIssues.sort((a, b) => b.count - a.count);

  return {
    totalSubmissions: submissions.length,
    reviewedCount: submissions.filter((s) => s.status === "REVIEWED").length,
    revisionCount: submissions.reduce((sum, s) => sum + s.revisions.length, 0),
    repeatedIssues,
    scoreTrend,
    languageProgress: Array.from(languageProgress.entries()).map(([lang, data]) => ({
      language: lang,
      avgScore: Math.round(data.totalScore / data.count),
      count: data.count,
    })),
    topicProgress: Array.from(topicProgress.entries()).map(([topic, data]) => ({
      topic,
      avgScore: Math.round(data.totalScore / data.count),
      count: data.count,
    })),
    conceptsCovered: conceptSet.size,
    concepts: Array.from(conceptSet),
  };
}

function buildDemoImprovementData() {
  return {
    totalSubmissions: 4,
    reviewedCount: 3,
    revisionCount: 2,
    repeatedIssues: [
      { category: "STYLE", count: 3 },
      { category: "BEST_PRACTICE", count: 2 },
      { category: "BUG", count: 2 },
    ],
    scoreTrend: [
      { label: "Find max number", score: 72, date: new Date() },
      { label: "Reverse string", score: 78, date: new Date() },
      { label: "Palindrome check", score: 85, date: new Date() },
    ],
    languageProgress: [
      { language: "JAVASCRIPT", avgScore: 78, count: 3 },
      { language: "TYPESCRIPT", avgScore: 72, count: 1 },
    ],
    topicProgress: [
      { topic: "Arrays", avgScore: 72, count: 2 },
      { topic: "Strings", avgScore: 82, count: 2 },
    ],
    conceptsCovered: 4,
    concepts: ["Edge cases", "Initialization", "Loop optimization", "Input validation"],
  };
}

export default async function ImprovementPage() {
  let data: ReturnType<typeof buildDemoImprovementData>;
  try {
    data = await loadImprovementData("");
  } catch {
    data = buildDemoImprovementData();
  }

  const latestScore = data.scoreTrend[data.scoreTrend.length - 1];
  const scoreChange = data.scoreTrend.length >= 2
    ? data.scoreTrend[data.scoreTrend.length - 1].score - data.scoreTrend[data.scoreTrend.length - 2].score
    : null;

  return (
    <div className="space-y-8 p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-[var(--foreground)]">Improvement dashboard</h1>
          <p className="mt-1 text-sm text-[var(--muted)]">Track your learning progress across submissions, topics, and concepts.</p>
        </div>
        <Badge tone="blue">Student progress</Badge>
      </div>

      <div className="grid gap-4 sm:grid-cols-4">
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--panel)] p-5">
          <p className="text-sm text-[var(--muted)]">Submissions</p>
          <p className="mt-2 text-3xl font-semibold">{data.totalSubmissions}</p>
        </div>
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--panel)] p-5">
          <p className="text-sm text-[var(--muted)]">Reviewed</p>
          <p className="mt-2 text-3xl font-semibold">{data.reviewedCount}</p>
        </div>
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--panel)] p-5">
          <p className="text-sm text-[var(--muted)]">Revisions</p>
          <p className="mt-2 text-3xl font-semibold">{data.revisionCount}</p>
        </div>
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--panel)] p-5">
          <p className="text-sm text-[var(--muted)]">Latest score</p>
          <p className="mt-2 text-3xl font-semibold">
            {latestScore?.score ?? "--"}
            {scoreChange !== null ? (
              <span className={`ml-2 text-sm font-medium ${scoreChange >= 0 ? "text-[var(--success)]" : "text-[var(--danger)]"}`}>
                {scoreChange >= 0 ? "+" : ""}{scoreChange}
              </span>
            ) : null}
          </p>
        </div>
      </div>

      <section className="rounded-2xl border border-[var(--border)] bg-[var(--panel)] p-5">
        <h2 className="text-lg font-semibold text-[var(--foreground)]">Score trend</h2>
        <p className="mt-1 text-sm text-[var(--muted)]">Overall scores across recent submissions — higher is better.</p>
        {data.scoreTrend.length === 0 ? (
          <EmptyState title="No reviews yet" description="Submit code and get an AI review to see your score trend." />
        ) : (
          <div className="mt-4 grid gap-3">
            {data.scoreTrend.map((point) => (
              <div key={point.label} className="flex items-center gap-4 rounded-xl border border-[var(--border)] p-4">
                <div className="flex-1">
                  <div className="font-medium text-[var(--foreground)]">{point.label}</div>
                  <div className="text-xs text-[var(--muted)]">{point.date.toLocaleDateString()}</div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-24 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-700">
                    <div className="h-full rounded-full bg-[var(--primary)]" style={{ width: `${point.score}%` }} />
                  </div>
                  <span className="text-sm font-semibold">{point.score}/100</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--panel)] p-5">
          <h2 className="text-lg font-semibold text-[var(--foreground)]">Repeated issue categories</h2>
          <p className="mt-1 text-sm text-[var(--muted)]">Categories that appear across multiple reviews.</p>
          {data.repeatedIssues.length === 0 ? (
            <p className="mt-4 text-sm text-[var(--muted)]">No repeated issues found across your submissions.</p>
          ) : (
            <div className="mt-4 space-y-3">
              {data.repeatedIssues.map((issue) => (
                <div key={issue.category} className="flex items-center justify-between rounded-xl border border-[var(--border)] p-3">
                  <Badge tone={issue.category === "BUG" ? "red" : issue.category === "SECURITY" ? "red" : issue.category === "COMPLEXITY" ? "amber" : "neutral"}>
                    {issue.category}
                  </Badge>
                  <span className="text-sm font-medium text-[var(--foreground)]">{issue.count}x</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-[var(--border)] bg-[var(--panel)] p-5">
          <h2 className="text-lg font-semibold text-[var(--foreground)]">Language-wise progress</h2>
          <p className="mt-1 text-sm text-[var(--muted)]">Average score by programming language.</p>
          {data.languageProgress.length === 0 ? (
            <p className="mt-4 text-sm text-[var(--muted)]">No language data yet.</p>
          ) : (
            <div className="mt-4 space-y-3">
              {data.languageProgress.map((entry) => (
                <div key={entry.language} className="rounded-xl border border-[var(--border)] p-3">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-[var(--foreground)]">{entry.language}</span>
                    <span className="text-sm font-semibold">{entry.avgScore}/100</span>
                  </div>
                  <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-700">
                    <div className="h-full rounded-full bg-[var(--primary)]" style={{ width: `${entry.avgScore}%` }} />
                  </div>
                  <p className="mt-1 text-xs text-[var(--muted)]">{entry.count} submission{entry.count !== 1 ? "s" : ""}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--panel)] p-5">
          <h2 className="text-lg font-semibold text-[var(--foreground)]">Topic-wise progress</h2>
          <p className="mt-1 text-sm text-[var(--muted)]">Average score by topic area.</p>
          {data.topicProgress.length === 0 ? (
            <p className="mt-4 text-sm text-[var(--muted)]">No topic data yet.</p>
          ) : (
            <div className="mt-4 space-y-3">
              {data.topicProgress.map((entry) => (
                <div key={entry.topic} className="rounded-xl border border-[var(--border)] p-3">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-[var(--foreground)]">{entry.topic}</span>
                    <span className="text-sm font-semibold">{entry.avgScore}/100</span>
                  </div>
                  <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-700">
                    <div className="h-full rounded-full bg-[var(--primary)]" style={{ width: `${entry.avgScore}%` }} />
                  </div>
                  <p className="mt-1 text-xs text-[var(--muted)]">{entry.count} submission{entry.count !== 1 ? "s" : ""}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-[var(--border)] bg-[var(--panel)] p-5">
          <h2 className="text-lg font-semibold text-[var(--foreground)]">Concepts covered</h2>
          <p className="mt-1 text-sm text-[var(--muted)]">Follow-up exercise concepts you have engaged with.</p>
          {data.concepts.length === 0 ? (
            <p className="mt-4 text-sm text-[var(--muted)]">Complete follow-up exercises to build concept awareness.</p>
          ) : (
            <div className="mt-4 flex flex-wrap gap-2">
              {data.concepts.map((concept) => (
                <Badge key={concept} tone="green">{concept}</Badge>
              ))}
            </div>
          )}
          <p className="mt-4 text-xs text-[var(--muted)]">{data.conceptsCovered} unique concepts explored</p>
        </div>
      </section>
    </div>
  );
}
