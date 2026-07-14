"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

type ExerciseCardProps = {
  exercise: {
    id: string;
    title: string;
    description: string;
    difficulty: string;
    expectedConcept: string;
    status?: string;
    completedAt?: string | null;
  };
};

export function ExerciseCard({ exercise }: ExerciseCardProps) {
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState(exercise.status ?? "ASSIGNED");

  async function markComplete() {
    setSaving(true);
    const response = await fetch(`/api/exercises/${exercise.id}/complete`, { method: "POST" });
    if (response.ok) {
      setStatus("COMPLETED");
    }
    setSaving(false);
  }

  return (
    <div className="rounded-xl border border-[var(--border)] p-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <div className="font-medium text-[var(--foreground)]">{exercise.title}</div>
          <div className="text-[var(--muted)]">{exercise.description}</div>
        </div>
        <Badge tone={status === "COMPLETED" ? "green" : "blue"}>{status}</Badge>
      </div>
      <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-[var(--muted)]">
        <span>{exercise.expectedConcept}</span>
        <span>·</span>
        <span>{exercise.difficulty}</span>
        {exercise.completedAt ? (
          <>
            <span>·</span>
            <span>Completed {new Date(exercise.completedAt).toLocaleDateString()}</span>
          </>
        ) : null}
      </div>
      {status !== "COMPLETED" ? (
        <Button className="mt-3" size="sm" variant="secondary" onClick={markComplete} disabled={saving}>
          {saving ? "Saving…" : "Mark complete"}
        </Button>
      ) : null}
    </div>
  );
}