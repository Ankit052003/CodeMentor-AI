import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getDemoMentorStudentData } from "@/lib/demo-data";

type Props = { params: { studentId: string } };

export const dynamic = "force-dynamic";

function scoreAverage(values: Array<number | null | undefined>) {
  const available = values.filter((value): value is number => typeof value === "number");
  if (available.length === 0) return null;
  return Math.round(available.reduce((sum, value) => sum + value, 0) / available.length);
}

type MentorStudentSubmission = {
  id: string;
  title: string;
  language: string;
  topic: string;
  status: string;
  aiReview: {
    overallScore: number;
    issues: Array<{ category: string }>;
  } | null;
  revisions: Array<{ id: string }>;
};

export default async function MentorStudentPage({ params }: Props) {
  let student;

  try {
    student = await prisma.user.findFirst({
      where: {
        id: params.studentId,
        role: "STUDENT"
      },
      include: {
        studentProfile: true,
        submissions: {
          orderBy: { createdAt: "desc" },
          include: {
            aiReview: { include: { issues: true } },
            revisions: true
          }
        },
        progressEvents: {
          orderBy: { createdAt: "desc" },
          take: 10
        }
      }
    });
  } catch {
    student = getDemoMentorStudentData();
  }

  if (!student) {
    return (
      <div className="p-6">
        <EmptyState title="Student not found" description="This student is not assigned or does not exist in the current demo data." />
      </div>
    );
  }

  const averageScore = scoreAverage((student.submissions as MentorStudentSubmission[]).map((submission) => submission.aiReview?.overallScore));
  const issueCategories = (student.submissions as MentorStudentSubmission[]).flatMap((submission) => submission.aiReview?.issues.map((issue) => issue.category) ?? []);
  const repeatedIssues = [...new Set(issueCategories)].slice(0, 4);

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-semibold text-[var(--foreground)]">{student.name}</h1>
        <p className="mt-1 text-sm text-[var(--muted)]">{student.email}</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-[var(--border)] bg-white p-5">
          <p className="text-sm text-[var(--muted)]">Skill level</p>
          <p className="mt-2 text-2xl font-semibold text-[var(--foreground)]">{student.studentProfile?.skillLevel ?? "--"}</p>
        </div>
        <div className="rounded-2xl border border-[var(--border)] bg-white p-5">
          <p className="text-sm text-[var(--muted)]">Average score</p>
          <p className="mt-2 text-2xl font-semibold text-[var(--foreground)]">{averageScore ?? "--"}</p>
        </div>
        <div className="rounded-2xl border border-[var(--border)] bg-white p-5">
          <p className="text-sm text-[var(--muted)]">Repeated issue categories</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {repeatedIssues.length > 0 ? repeatedIssues.map((category) => <Badge key={category} tone="amber">{category}</Badge>) : <span className="text-sm text-[var(--muted)]">No reviews yet</span>}
          </div>
        </div>
      </div>

      <section className="rounded-2xl border border-[var(--border)] bg-white p-5">
        <h2 className="text-lg font-semibold text-[var(--foreground)]">Learning goals</h2>
        <div className="mt-3 flex flex-wrap gap-2">
          {student.studentProfile?.learningGoals?.length ? student.studentProfile.learningGoals.map((goal) => <Badge key={goal} tone="blue">{goal}</Badge>) : <span className="text-sm text-[var(--muted)]">No goals recorded</span>}
        </div>
      </section>

      <section className="rounded-2xl border border-[var(--border)] bg-white p-5">
        <h2 className="text-lg font-semibold text-[var(--foreground)]">Submission history</h2>
        <div className="mt-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Score</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {student.submissions.map((submission) => (
                <TableRow key={submission.id}>
                  <TableCell>
                    <div className="font-medium text-[var(--foreground)]">{submission.title}</div>
                    <div className="text-xs text-[var(--muted)]">{submission.language} · {submission.topic}</div>
                  </TableCell>
                  <TableCell>{submission.status}</TableCell>
                  <TableCell>{submission.aiReview?.overallScore ?? "--"}</TableCell>
                  <TableCell>
                    <Link href={`/dashboard/mentor/submissions/${submission.id}`} className="text-sm font-medium text-[var(--primary)] hover:underline">
                      Inspect
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </section>

      <section className="rounded-2xl border border-[var(--border)] bg-white p-5">
        <h2 className="text-lg font-semibold text-[var(--foreground)]">Recent progress events</h2>
        <ul className="mt-3 space-y-2 text-sm text-[var(--muted)]">
          {student.progressEvents.map((event) => (
            <li key={event.id} className="rounded-xl border border-[var(--border)] p-3">
              <div className="font-medium text-[var(--foreground)]">{event.eventType}</div>
              <div>{new Date(event.createdAt).toLocaleString()}</div>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}