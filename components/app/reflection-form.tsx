"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ErrorState } from "@/components/ui/error-state";
import { Textarea } from "@/components/ui/textarea";

type ReflectionFormProps = {
  submissionId: string;
};

export function ReflectionForm({ submissionId }: ReflectionFormProps) {
  const router = useRouter();
  const [reflection, setReflection] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError(null);

    const response = await fetch(`/api/submissions/${submissionId}/reflection`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reflection })
    });

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      setError(data?.error ?? "Unable to save reflection.");
      setSaving(false);
      return;
    }

    setReflection("");
    router.refresh();
    setSaving(false);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl border border-[var(--border)] bg-white p-5">
      <div>
        <h2 className="text-lg font-semibold text-[var(--foreground)]">Student reflection</h2>
        <p className="mt-1 text-sm text-[var(--muted)]">Write what you changed, what you learned, and what still feels confusing.</p>
      </div>

      {error ? <ErrorState title="Could not save reflection" description={error} /> : null}

      <Textarea
        label="Reflection"
        value={reflection}
        onChange={(event) => setReflection(event.target.value)}
        rows={5}
        placeholder="I changed..., I learned..., I still need to understand..."
      />

      <Button type="submit" disabled={saving}>
        {saving ? "Saving…" : "Save reflection"}
      </Button>
    </form>
  );
}