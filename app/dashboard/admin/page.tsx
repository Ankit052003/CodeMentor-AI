import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import { AdminClient } from "@/components/app/admin-client";

export const dynamic = "force-dynamic";

type AdminData = {
  users: Array<{ id: string; name: string; email: string; role: string }>;
  assignments: Array<{ id: string; mentorName: string; studentName: string; studentEmail: string }>;
  submissions: Array<{ id: string; title: string; status: string; language: string; reviewScore: number | null }>;
  stats: { users: number; mentors: number; students: number; submissions: number; reviewed: number };
  analytics: {
    submissionStatusBreakdown: Array<{ status: string; count: number }>;
    languageBreakdown: Array<{ language: string; count: number }>;
    avgScores: { overall: number; correctness: number; readability: number; complexity: number; totalReviews: number };
  } | null;
};

type ScoreRow = {
  status: string;
  language: string;
  _count: { id: number };
};

type AvgRow = {
  _avg: { overallScore: number | null; correctnessScore: number | null; readabilityScore: number | null; complexityScore: number | null };
  _count: { id: number };
};

async function loadAdminData() {
  const [users, assignments, submissions, statusCounts, languageCounts, avgScores] = await Promise.all([
    prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      take: 50,
      select: { id: true, name: true, email: true, role: true }
    }),
    prisma.mentorAssignment.findMany({
      include: { mentor: true, student: true },
      orderBy: { createdAt: "desc" },
      take: 50
    }),
    prisma.codeSubmission.findMany({
      orderBy: { createdAt: "desc" },
      take: 50,
      select: {
        id: true,
        title: true,
        status: true,
        language: true,
        aiReview: { select: { overallScore: true } }
      }
    }),
    prisma.codeSubmission.groupBy({
      by: ["status"],
      _count: { id: true },
    }) as unknown as ScoreRow[],
    prisma.codeSubmission.groupBy({
      by: ["language"],
      _count: { id: true },
    }) as unknown as ScoreRow[],
    prisma.aiReview.aggregate({
      _avg: { overallScore: true, correctnessScore: true, readabilityScore: true, complexityScore: true },
      _count: { id: true },
    }) as unknown as AvgRow,
  ]);

  const reviewedCount = submissions.filter((s) => s.status === "REVIEWED").length;

  return {
    users: users.map((user) => ({ id: user.id, name: user.name, email: user.email, role: user.role })),
    assignments: assignments.map((assignment) => ({
      id: assignment.id,
      mentorName: assignment.mentor.name,
      studentName: assignment.student.name,
      studentEmail: assignment.student.email
    })),
    submissions: submissions.map((submission) => ({
      id: submission.id,
      title: submission.title,
      status: submission.status,
      language: submission.language,
      reviewScore: submission.aiReview?.overallScore ?? null
    })),
    stats: {
      users: users.length,
      mentors: users.filter((user) => user.role === "MENTOR").length,
      students: users.filter((user) => user.role === "STUDENT").length,
      submissions: submissions.length,
      reviewed: reviewedCount
    },
    analytics: {
      submissionStatusBreakdown: statusCounts.map((s: ScoreRow) => ({ status: s.status, count: s._count.id })),
      languageBreakdown: languageCounts.map((l: ScoreRow) => ({ language: l.language, count: l._count.id })),
      avgScores: {
        overall: Math.round((avgScores as AvgRow)._avg.overallScore ?? 0),
        correctness: Math.round((avgScores as AvgRow)._avg.correctnessScore ?? 0),
        readability: Math.round((avgScores as AvgRow)._avg.readabilityScore ?? 0),
        complexity: Math.round((avgScores as AvgRow)._avg.complexityScore ?? 0),
        totalReviews: (avgScores as AvgRow)._count.id,
      },
    },
  };
}

function buildDemoAdminData(): AdminData {
  const demoUsers = [
    { id: "seed-student", name: "Maya Student", email: "student@codementor.ai", role: "STUDENT" },
    { id: "seed-mentor", name: "Ravi Mentor", email: "mentor@codementor.ai", role: "MENTOR" },
    { id: "seed-admin", name: "Aisha Admin", email: "admin@codementor.ai", role: "ADMIN" }
  ];
  const demoSubmissions = [
    { id: "demo-1", title: "Find max number", status: "REVIEWED", language: "JAVASCRIPT", reviewScore: 72 },
    { id: "demo-2", title: "Reverse string", status: "REVIEWED", language: "JAVASCRIPT", reviewScore: 78 },
    { id: "demo-3", title: "Palindrome check", status: "SUBMITTED", language: "TYPESCRIPT", reviewScore: null },
  ];

  return {
    users: demoUsers,
    assignments: [],
    submissions: demoSubmissions,
    stats: {
      users: demoUsers.length,
      mentors: 1,
      students: 1,
      submissions: demoSubmissions.length,
      reviewed: demoSubmissions.filter((s) => s.status === "REVIEWED").length
    },
    analytics: {
      submissionStatusBreakdown: [
        { status: "REVIEWED", count: 2 },
        { status: "SUBMITTED", count: 1 },
      ],
      languageBreakdown: [
        { language: "JAVASCRIPT", count: 2 },
        { language: "TYPESCRIPT", count: 1 },
      ],
      avgScores: { overall: 75, correctness: 78, readability: 72, complexity: 70, totalReviews: 2 },
    },
  };
}

export default async function AdminDashboardPage() {
  let data: AdminData;
  let isDemo = false;

  try {
    const live = await loadAdminData();
    data = live;
  } catch {
    data = buildDemoAdminData();
    isDemo = true;
  }

  return (
    <div className="space-y-8 p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-[var(--foreground)]">Admin dashboard</h1>
          <p className="mt-1 text-sm text-[var(--muted)]">Manage users, mentor assignments, and submission moderation at a glance.</p>
        </div>
        <Badge tone="blue">Platform control</Badge>
      </div>

      <div className="grid gap-4 md:grid-cols-5">
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--panel)] p-5">
          <p className="text-sm text-[var(--muted)]">Users</p>
          <p className="mt-2 text-3xl font-semibold">{data.stats.users}</p>
        </div>
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--panel)] p-5">
          <p className="text-sm text-[var(--muted)]">Mentors</p>
          <p className="mt-2 text-3xl font-semibold">{data.stats.mentors}</p>
        </div>
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--panel)] p-5">
          <p className="text-sm text-[var(--muted)]">Students</p>
          <p className="mt-2 text-3xl font-semibold">{data.stats.students}</p>
        </div>
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--panel)] p-5">
          <p className="text-sm text-[var(--muted)]">Submissions</p>
          <p className="mt-2 text-3xl font-semibold">{data.stats.submissions}</p>
        </div>
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--panel)] p-5">
          <p className="text-sm text-[var(--muted)]">Reviewed</p>
          <p className="mt-2 text-3xl font-semibold">{data.stats.reviewed}</p>
        </div>
      </div>

      {data.analytics ? (
        <section className="rounded-2xl border border-[var(--border)] bg-[var(--panel)] p-5">
          <h2 className="text-lg font-semibold text-[var(--foreground)]">Platform analytics</h2>
          <p className="mt-1 text-sm text-[var(--muted)]">Aggregated metrics across all submissions and reviews.</p>
          <div className="mt-4 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <h3 className="text-xs font-medium uppercase tracking-wider text-[var(--muted)]">Avg Overall Score</h3>
              <p className="mt-1 text-2xl font-bold text-[var(--foreground)]">{data.analytics.avgScores.overall}</p>
              <p className="text-xs text-[var(--muted)]">Across {data.analytics.avgScores.totalReviews} reviews</p>
            </div>
            <div>
              <h3 className="text-xs font-medium uppercase tracking-wider text-[var(--muted)]">Avg Correctness</h3>
              <p className="mt-1 text-2xl font-bold text-[var(--foreground)]">{data.analytics.avgScores.correctness}</p>
            </div>
            <div>
              <h3 className="text-xs font-medium uppercase tracking-wider text-[var(--muted)]">Avg Readability</h3>
              <p className="mt-1 text-2xl font-bold text-[var(--foreground)]">{data.analytics.avgScores.readability}</p>
            </div>
            <div>
              <h3 className="text-xs font-medium uppercase tracking-wider text-[var(--muted)]">Avg Complexity</h3>
              <p className="mt-1 text-2xl font-bold text-[var(--foreground)]">{data.analytics.avgScores.complexity}</p>
            </div>
          </div>
          <div className="mt-4 grid gap-6 sm:grid-cols-2">
            <div>
              <h3 className="text-xs font-medium uppercase tracking-wider text-[var(--muted)]">Submissions by Status</h3>
              <div className="mt-2 flex flex-wrap gap-2">
                {data.analytics.submissionStatusBreakdown.map((s) => (
                  <Badge key={s.status} tone={s.status === "REVIEWED" ? "green" : s.status === "ARCHIVED" ? "amber" : s.status === "SUBMITTED" ? "blue" : "neutral"}>
                    {s.status}: {s.count}
                  </Badge>
                ))}
              </div>
            </div>
            <div>
              <h3 className="text-xs font-medium uppercase tracking-wider text-[var(--muted)]">Submissions by Language</h3>
              <div className="mt-2 flex flex-wrap gap-2">
                {data.analytics.languageBreakdown.map((l) => (
                  <Badge key={l.language} tone="neutral">{l.language}: {l.count}</Badge>
                ))}
              </div>
            </div>
          </div>
        </section>
      ) : null}

      {isDemo ? (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-800 dark:bg-amber-900/30 dark:text-amber-300">
          Running in demo mode — some admin actions are unavailable. Connect a database for full functionality.
        </div>
      ) : null}

      <AdminClient
        initialUsers={data.users}
        initialAssignments={data.assignments}
        initialSubmissions={data.submissions}
      />
    </div>
  );
}
