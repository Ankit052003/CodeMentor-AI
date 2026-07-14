"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger, DialogClose } from "@/components/ui/dialog";
import { Select as UiSelect } from "@/components/ui/select";
import { EmptyState } from "@/components/ui/empty-state";
import { LoadingState } from "@/components/ui/loading-state";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

type AdminUser = { id: string; name: string; email: string; role: string };
type AdminAssignment = { id: string; mentorName: string; studentName: string; studentEmail: string };
type AdminSubmission = { id: string; title: string; status: string; language: string; reviewScore: number | null };
type AdminRubric = { id: string; name: string; guidance: string; minScore: number; maxScore: number; isActive: boolean; category: { code: string; name: string } };

type AdminClientProps = {
  initialUsers: AdminUser[];
  initialAssignments: AdminAssignment[];
  initialSubmissions: AdminSubmission[];
};

const PAGE_SIZE = 10;

export function AdminClient({ initialUsers, initialAssignments, initialSubmissions }: AdminClientProps) {
  const router = useRouter();
  const [users, setUsers] = useState(initialUsers);
  const [assignments, setAssignments] = useState(initialAssignments);
  const [submissions, setSubmissions] = useState(initialSubmissions);
  const [roleLoading, setRoleLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [mentors, setMentors] = useState<Array<{ id: string; name: string }>>([]);
  const [students, setStudents] = useState<Array<{ id: string; name: string }>>([]);
  const [selectedMentor, setSelectedMentor] = useState("");
  const [selectedStudent, setSelectedStudent] = useState("");

  const [userPage, setUserPage] = useState(1);
  const [submissionPage, setSubmissionPage] = useState(1);

  const [rubrics, setRubrics] = useState<AdminRubric[]>([]);
  const [rubricsLoading, setRubricsLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/rubrics")
      .then((res) => res.json())
      .then((data) => { setRubrics(data.rubrics ?? []); setRubricsLoading(false); })
      .catch(() => setRubricsLoading(false));
  }, []);

  useEffect(() => {
    if (!assignDialogOpen) return;
    let cancelled = false;
    fetch("/api/admin/assignments")
      .then((res) => res.json())
      .then((data) => {
        if (!cancelled) {
          setMentors(data.mentors ?? []);
          setStudents(data.students ?? []);
        }
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [assignDialogOpen]);

  async function handleRoleChange(userId: string, newRole: string) {
    setRoleLoading(userId);
    setError(null);
    const res = await fetch(`/api/admin/users/${userId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role: newRole }),
    });
    if (res.ok) {
      setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u)));
      router.refresh();
    } else {
      const data = await res.json();
      setError(data?.error ?? "Failed to update role");
    }
    setRoleLoading(null);
  }

  async function handleDeleteAssignment(assignmentId: string) {
    setError(null);
    const res = await fetch(`/api/admin/assignments/${assignmentId}`, { method: "DELETE" });
    if (res.ok) {
      setAssignments((prev) => prev.filter((a) => a.id !== assignmentId));
      router.refresh();
    } else {
      const data = await res.json();
      setError(data?.error ?? "Failed to delete assignment");
    }
  }

  async function handleCreateAssignment() {
    if (!selectedMentor || !selectedStudent) return;
    setError(null);
    const res = await fetch("/api/admin/assignments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mentorId: selectedMentor, studentId: selectedStudent }),
    });
    if (res.ok) {
      const data = await res.json();
      setAssignments((prev) => [...prev, data.assignment]);
      setAssignDialogOpen(false);
      setSelectedMentor("");
      setSelectedStudent("");
      router.refresh();
    } else {
      const data = await res.json();
      setError(data?.error ?? "Failed to create assignment");
    }
  }

  async function handleModerate(submissionId: string, status: string) {
    setError(null);
    const res = await fetch(`/api/admin/submissions/${submissionId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (res.ok) {
      setSubmissions((prev) => prev.map((s) => (s.id === submissionId ? { ...s, status } : s)));
      router.refresh();
    } else {
      const data = await res.json();
      setError(data?.error ?? "Failed to moderate submission");
    }
  }

  const totalUserPages = Math.ceil(users.length / PAGE_SIZE);
  const paginatedUsers = users.slice((userPage - 1) * PAGE_SIZE, userPage * PAGE_SIZE);

  const totalSubmissionPages = Math.ceil(submissions.length / PAGE_SIZE);
  const paginatedSubmissions = submissions.slice((submissionPage - 1) * PAGE_SIZE, submissionPage * PAGE_SIZE);

  return (
    <>
      {error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
      ) : null}

      <section className="rounded-2xl border border-[var(--border)] bg-white p-5">
        <h2 className="text-lg font-semibold text-[var(--foreground)]">User management</h2>
        <p className="mt-1 text-sm text-[var(--muted)]">View and update user roles. Changes take effect immediately.</p>
        <div className="mt-4 overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-[var(--muted)]">No users found.</TableCell>
                </TableRow>
              ) : paginatedUsers.map((u) => (
                <TableRow key={u.id}>
                  <TableCell>{u.name}</TableCell>
                  <TableCell>{u.email}</TableCell>
                  <TableCell>
                    <Badge tone={u.role === "ADMIN" ? "red" : u.role === "MENTOR" ? "blue" : "green"}>{u.role}</Badge>
                  </TableCell>
                  <TableCell>
                    <select
                      className="h-8 rounded-md border border-[var(--border)] bg-white px-2 text-xs"
                      value={u.role}
                      disabled={roleLoading === u.id}
                      onChange={(e) => handleRoleChange(u.id, e.target.value)}
                    >
                      <option value="STUDENT">Student</option>
                      <option value="MENTOR">Mentor</option>
                      <option value="ADMIN">Admin</option>
                    </select>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {totalUserPages > 1 ? (
            <div className="mt-3 flex items-center justify-between text-sm text-[var(--muted)]">
              <span>{users.length} total users</span>
              <div className="flex gap-2">
                <button
                  className="rounded-md border border-[var(--border)] px-3 py-1 disabled:opacity-40"
                  disabled={userPage <= 1}
                  onClick={() => setUserPage((p) => p - 1)}
                >
                  Prev
                </button>
                <span className="px-2">{userPage} / {totalUserPages}</span>
                <button
                  className="rounded-md border border-[var(--border)] px-3 py-1 disabled:opacity-40"
                  disabled={userPage >= totalUserPages}
                  onClick={() => setUserPage((p) => p + 1)}
                >
                  Next
                </button>
              </div>
            </div>
          ) : null}
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-[var(--border)] bg-white p-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-[var(--foreground)]">Mentor assignments</h2>
              <p className="mt-1 text-sm text-[var(--muted)]">Assign mentors to students to enable review workflows.</p>
            </div>
            <Dialog open={assignDialogOpen} onOpenChange={setAssignDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm">Assign mentor</Button>
              </DialogTrigger>
              <DialogContent title="Create mentor assignment" description="Select a mentor and a student to pair them.">
                <div className="grid gap-4">
                    <UiSelect
                      label="Mentor"
                      value={selectedMentor}
                      onChange={(e) => setSelectedMentor(e.target.value)}
                      options={mentors.map((m) => ({ label: m.name, value: m.id }))}
                      placeholder="Select mentor"
                    />
                    <UiSelect
                      label="Student"
                      value={selectedStudent}
                      onChange={(e) => setSelectedStudent(e.target.value)}
                      options={students.map((s) => ({ label: s.name, value: s.id }))}
                      placeholder="Select student"
                    />
                    <div className="flex gap-3">
                      <Button onClick={handleCreateAssignment} disabled={!selectedMentor || !selectedStudent}>
                        Create assignment
                      </Button>
                      <DialogClose asChild>
                        <Button variant="secondary">Cancel</Button>
                      </DialogClose>
                    </div>
                  </div>
              </DialogContent>
            </Dialog>
          </div>
          {assignments.length === 0 ? (
            <EmptyState title="No assignments yet" description="Assign mentors to students to unlock review workflows." />
          ) : (
            <div className="mt-4 overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Mentor</TableHead>
                    <TableHead>Student</TableHead>
                    <TableHead />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {assignments.map((a) => (
                    <TableRow key={a.id}>
                      <TableCell>{a.mentorName}</TableCell>
                      <TableCell>
                        <div>{a.studentName}</div>
                        <div className="text-xs text-[var(--muted)]">{a.studentEmail}</div>
                      </TableCell>
                      <TableCell>
                        <Button size="sm" variant="danger" onClick={() => handleDeleteAssignment(a.id)}>Remove</Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-[var(--border)] bg-white p-5">
          <h2 className="text-lg font-semibold text-[var(--foreground)]">Review rubric</h2>
          <p className="mt-1 text-sm text-[var(--muted)]">Rubric categories used for AI review classification.</p>
          {rubricsLoading ? (
            <div className="mt-4"><LoadingState /></div>
          ) : rubrics.length > 0 ? (
            <div className="mt-4 space-y-2 text-sm text-[var(--muted)]">
              {rubrics.map((r) => (
                <div key={r.id} className="flex items-center gap-2 rounded-xl border border-[var(--border)] p-3">
                  <Badge tone={r.isActive ? "green" : "neutral"}>{r.category.code}</Badge>
                  <div className="flex-1">
                    <span className="font-medium text-[var(--foreground)]">{r.name}</span>
                    <span className="ml-2 text-xs text-[var(--muted)]">{r.minScore}-{r.maxScore} pts</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="mt-4 space-y-2 text-sm text-[var(--muted)]">
              {[{ code: "BUG", name: "Bugs and correctness" }, { code: "STYLE", name: "Readability and style" }, { code: "COMPLEXITY", name: "Complexity and performance" }, { code: "SECURITY", name: "Security concerns" }, { code: "BEST_PRACTICE", name: "Language best practices" }].map((cat) => (
                <div key={cat.code} className="flex items-center gap-2 rounded-xl border border-[var(--border)] p-3">
                  <Badge tone={cat.code === "BUG" || cat.code === "SECURITY" ? "red" : cat.code === "COMPLEXITY" ? "amber" : cat.code === "BEST_PRACTICE" ? "blue" : "neutral"}>{cat.code}</Badge>
                  <span>{cat.name}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="rounded-2xl border border-[var(--border)] bg-white p-5">
        <h2 className="text-lg font-semibold text-[var(--foreground)]">Submission moderation</h2>
        <p className="mt-1 text-sm text-[var(--muted)]">Review all submissions, archive outdated content, or restore as needed.</p>
        <div className="mt-4 overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Submission</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Score</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedSubmissions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-[var(--muted)]">No submissions found.</TableCell>
                </TableRow>
              ) : paginatedSubmissions.map((s) => (
                <TableRow key={s.id}>
                  <TableCell>
                    <a href={`/dashboard/submissions/${s.id}`} className="font-medium text-[var(--foreground)] hover:underline">
                      {s.title}
                    </a>
                    <div className="text-xs text-[var(--muted)]">{s.language}</div>
                  </TableCell>
                  <TableCell>
                    <Badge tone={s.status === "REVIEWED" ? "green" : s.status === "ARCHIVED" ? "amber" : s.status === "SUBMITTED" ? "blue" : "neutral"}>
                      {s.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{s.reviewScore ?? "--"}</TableCell>
                  <TableCell>
                    {s.status !== "ARCHIVED" ? (
                      <Button size="sm" variant="secondary" onClick={() => handleModerate(s.id, "ARCHIVED")}>
                        Archive
                      </Button>
                    ) : (
                      <Button size="sm" variant="secondary" onClick={() => handleModerate(s.id, "SUBMITTED")}>
                        Restore
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {totalSubmissionPages > 1 ? (
            <div className="mt-3 flex items-center justify-between text-sm text-[var(--muted)]">
              <span>{submissions.length} total submissions</span>
              <div className="flex gap-2">
                <button
                  className="rounded-md border border-[var(--border)] px-3 py-1 disabled:opacity-40"
                  disabled={submissionPage <= 1}
                  onClick={() => setSubmissionPage((p) => p - 1)}
                >
                  Prev
                </button>
                <span className="px-2">{submissionPage} / {totalSubmissionPages}</span>
                <button
                  className="rounded-md border border-[var(--border)] px-3 py-1 disabled:opacity-40"
                  disabled={submissionPage >= totalSubmissionPages}
                  onClick={() => setSubmissionPage((p) => p + 1)}
                >
                  Next
                </button>
              </div>
            </div>
          ) : null}
        </div>
      </section>
    </>
  );
}
