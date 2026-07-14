"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ErrorState } from "@/components/ui/error-state";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

type SubmissionRevisionFormProps = {
  submissionId: string;
};

export function SubmissionRevisionForm({ submissionId }: SubmissionRevisionFormProps) {
  const router = useRouter();
  const [sourceCode, setSourceCode] = useState("");
  const [changeSummary, setChangeSummary] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError(null);

    const response = await fetch(`/api/submissions/${submissionId}/revisions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sourceCode,
        changeSummary
      })
    });

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      setError(data?.error?.message ?? data?.error ?? "Unable to create revision.");
      setSaving(false);
      return;
    }

    setSourceCode("");
    setChangeSummary("");
    router.refresh();
    setSaving(false);
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-4 rounded-2xl border border-[var(--border)] bg-white p-5">
      <div>
        <h3 className="text-base font-semibold text-[var(--foreground)]">Create revision</h3>
        <p className="mt-1 text-sm text-[var(--muted)]">Reviewed submissions should be revised instead of overwritten silently.</p>
      </div>

      {error ? <ErrorState title="Could not create revision" description={error} /> : null}

      <Input
        label="Change summary"
        value={changeSummary}
        onChange={(event) => setChangeSummary(event.target.value)}
        placeholder="Explain what changed in this revision"
      />

      <Textarea
        label="Revised source code"
        value={sourceCode}
        onChange={(event) => setSourceCode(event.target.value)}
        rows={12}
        className="font-mono"
        placeholder="Paste the revised code here."
      />

      <div>
        <Button type="submit" disabled={saving}>
          {saving ? "Saving…" : "Save revision"}
        </Button>
      </div>
    </form>
  );
}