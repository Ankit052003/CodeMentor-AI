"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ErrorState } from "@/components/ui/error-state";

type MentorFeedbackFormProps = {
  submissionId: string;
};

export function MentorFeedbackForm({ submissionId }: MentorFeedbackFormProps) {
  const router = useRouter();
  const [comment, setComment] = useState("");
  const [privateNote, setPrivateNote] = useState("");
  const [exerciseTitle, setExerciseTitle] = useState("");
  const [exerciseDescription, setExerciseDescription] = useState("");
  const [expectedConcept, setExpectedConcept] = useState("");
  const [difficulty, setDifficulty] = useState<"BEGINNER" | "INTERMEDIATE" | "ADVANCED">("BEGINNER");
  const [verificationStatus, setVerificationStatus] = useState<"APPROVED" | "OVERRIDDEN">("APPROVED");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError(null);

    const response = await fetch(`/api/mentor/submissions/${submissionId}/feedback`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        comment,
        privateNote,
        exerciseTitle,
        exerciseDescription,
        expectedConcept,
        difficulty,
        verificationStatus
      })
    });

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      setError(data?.error ?? "Unable to save mentor feedback.");
      setSaving(false);
      return;
    }

    setComment("");
    setPrivateNote("");
    setExerciseTitle("");
    setExerciseDescription("");
    setExpectedConcept("");
    setDifficulty("BEGINNER");
    setVerificationStatus("APPROVED");
    router.refresh();
    setSaving(false);
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-4 rounded-2xl border border-[var(--border)] bg-white p-5">
      <div>
        <h3 className="text-lg font-semibold text-[var(--foreground)]">Mentor feedback</h3>
        <p className="mt-1 text-sm text-[var(--muted)]">Comment on the submission, verify the AI review, and suggest a follow-up exercise.</p>
      </div>

      {error ? <ErrorState title="Feedback failed" description={error} /> : null}

      <Textarea label="Public comment" value={comment} onChange={(event) => setComment(event.target.value)} rows={4} placeholder="What should the student focus on next?" />
      <Textarea label="Private note" value={privateNote} onChange={(event) => setPrivateNote(event.target.value)} rows={3} placeholder="Internal mentor note" />

      <div className="grid gap-4 sm:grid-cols-2">
        <Select
          label="AI review verification"
          value={verificationStatus}
          onChange={(event) => setVerificationStatus(event.target.value as "APPROVED" | "OVERRIDDEN")}
          options={[
            { label: "Approve AI review", value: "APPROVED" },
            { label: "Override AI review", value: "OVERRIDDEN" }
          ]}
        />
        <Select
          label="Exercise difficulty"
          value={difficulty}
          onChange={(event) => setDifficulty(event.target.value as "BEGINNER" | "INTERMEDIATE" | "ADVANCED")}
          options={[
            { label: "Beginner", value: "BEGINNER" },
            { label: "Intermediate", value: "INTERMEDIATE" },
            { label: "Advanced", value: "ADVANCED" }
          ]}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Input label="Recommended exercise title" value={exerciseTitle} onChange={(event) => setExerciseTitle(event.target.value)} placeholder="Fix the edge-case bug" />
        <Input label="Expected concept" value={expectedConcept} onChange={(event) => setExpectedConcept(event.target.value)} placeholder="Edge cases" />
      </div>

      <Textarea label="Exercise description" value={exerciseDescription} onChange={(event) => setExerciseDescription(event.target.value)} rows={4} placeholder="Explain the follow-up practice task." />

      <Button type="submit" disabled={saving}>
        {saving ? "Saving…" : "Save mentor feedback"}
      </Button>
    </form>
  );
}