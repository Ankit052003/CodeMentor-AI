import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getDemoMentorDashboardData } from "@/lib/demo-data";

export const dynamic = "force-dynamic";

export default async function MentorDashboardPage() {
  let assignments;

  try {
    assignments = await prisma.mentorAssignment.findMany({
      include: {
        student: {
          include: {
            studentProfile: true,
            submissions: {
              orderBy: { createdAt: "desc" },
              include: { aiReview: true },
              take: 5
            }
          }
        }
      }
    });
  } catch {
    assignments = getDemoMentorDashboardData().assignments;
  }

  const assignedStudents = assignments.map((assignment) => assignment.student);
  const recentSubmissions = assignedStudents.flatMap((student) => student.submissions).sort((left, right) => right.createdAt.getTime() - left.createdAt.getTime());
  const pendingReviews = recentSubmissions.filter((submission) => submission.status === "SUBMITTED" || !submission.aiReview).length;
  const verifiedReviews = recentSubmissions.filter((submission) => submission.aiReview?.verificationStatus === "APPROVED").length;

  return (
    <div className="space-y-8 p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-[var(--foreground)]">Mentor dashboard</h1>
          <p className="mt-1 text-sm text-[var(--muted)]">Track assigned students, pending reviews, and recent mentor feedback.</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--panel)] p-5">
          <p className="text-sm text-[var(--muted)]">Assigned students</p>
          <p className="mt-2 text-3xl font-semibold text-[var(--foreground)]">{assignedStudents.length}</p>
        </div>
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--panel)] p-5">
          <p className="text-sm text-[var(--muted)]">Pending reviews</p>
          <p className="mt-2 text-3xl font-semibold text-[var(--foreground)]">{pendingReviews}</p>
        </div>
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--panel)] p-5">
          <p className="text-sm text-[var(--muted)]">Approved AI reviews</p>
          <p className="mt-2 text-3xl font-semibold text-[var(--foreground)]">{verifiedReviews}</p>
        </div>
      </div>

      <section className="rounded-2xl border border-[var(--border)] bg-[var(--panel)] p-5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-[var(--foreground)]">Assigned students</h2>
            <p className="text-sm text-[var(--muted)]">Open a student profile to inspect progress, repeated issues, and submission history.</p>
          </div>
        </div>

        {assignedStudents.length === 0 ? (
          <div className="mt-5">
            <EmptyState title="No assigned students yet" description="Seed mentor assignments or add a mentor-student link to start the workflow." />
          </div>
        ) : (
          <div className="mt-5">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Skill</TableHead>
                  <TableHead>Recent submission</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {assignments.map((assignment) => {
                  const latestSubmission = assignment.student.submissions[0];

                  return (
                    <TableRow key={assignment.id}>
                      <TableCell>
                        <div className="font-medium text-[var(--foreground)]">{assignment.student.name}</div>
                        <div className="text-xs text-[var(--muted)]">{assignment.student.email}</div>
                      </TableCell>
                      <TableCell>{assignment.student.studentProfile?.skillLevel ?? "--"}</TableCell>
                      <TableCell>
                        {latestSubmission ? (
                          <Badge tone={latestSubmission.status === "REVIEWED" ? "green" : latestSubmission.status === "SUBMITTED" ? "blue" : "neutral"}>
                            {latestSubmission.title}
                          </Badge>
                        ) : (
                          "No submissions yet"
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-2">
                          <Link href={`/dashboard/mentor/students/${assignment.student.id}`} className="text-sm font-medium text-[var(--primary)] hover:underline">
                            View profile
                          </Link>
                          {latestSubmission ? (
                            <Link href={`/dashboard/mentor/submissions/${latestSubmission.id}`} className="text-sm font-medium text-[var(--primary)] hover:underline">
                              Review submission
                            </Link>
                          ) : null}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </section>

      <section className="rounded-2xl border border-[var(--border)] bg-[var(--panel)] p-5">
        <h2 className="text-lg font-semibold text-[var(--foreground)]">Recent submissions</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {recentSubmissions.slice(0, 4).map((submission) => (
            <div key={submission.id} className="rounded-xl border border-[var(--border)] bg-[var(--panel)] p-4">
              <div className="flex items-center justify-between gap-3">
                <span className="font-medium text-[var(--foreground)]">{submission.title}</span>
                <Badge tone={submission.aiReview ? "green" : "blue"}>{submission.status}</Badge>
              </div>
              <p className="mt-2 text-sm text-[var(--muted)]">{submission.topic} · {new Date(submission.createdAt).toLocaleDateString()}</p>
              <div className="mt-3">
                <Link href={`/dashboard/mentor/submissions/${submission.id}`} className="text-sm font-medium text-[var(--primary)] hover:underline">
                  Open review page
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}