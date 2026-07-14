"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ErrorState } from "@/components/ui/error-state";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

export type SubmissionFormValues = {
  title: string;
  language: "JAVASCRIPT" | "TYPESCRIPT" | "PYTHON";
  topic: string;
  difficulty: "BEGINNER" | "INTERMEDIATE" | "ADVANCED";
  prompt: string;
  sourceCode: string;
  saveAsDraft: boolean;
};

type SubmissionEditorFormProps = {
  mode: "create" | "edit";
  initialValues: SubmissionFormValues;
  submissionId?: string;
};

export function SubmissionEditorForm({ mode, initialValues, submissionId }: SubmissionEditorFormProps) {
  const router = useRouter();
  const [values, setValues] = useState(initialValues);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);

    const endpoint = submissionId ? `/api/submissions/${submissionId}` : "/api/submissions";
    const response = await fetch(endpoint, {
      method: submissionId ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: values.title,
        language: values.language,
        topic: values.topic,
        difficulty: values.difficulty,
        prompt: values.prompt,
        sourceCode: values.sourceCode,
        status: values.saveAsDraft ? "DRAFT" : "SUBMITTED"
      })
    });

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      setError(data?.error?.message ?? data?.error ?? "Unable to save submission.");
      setSubmitting(false);
      return;
    }

    router.push(`/dashboard/submissions/${data.submission.id}`);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-5 rounded-2xl border border-[var(--border)]/50 bg-[var(--panel)] p-5 shadow-[var(--shadow-sm)]">
      {error ? <ErrorState title="Could not save submission" description={error} /> : null}

      <Input
        label="Title"
        value={values.title}
        onChange={(event) => setValues((current) => ({ ...current, title: event.target.value }))}
        placeholder="Two-sum solution"
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <Select
          label="Language"
          value={values.language}
          onChange={(event) => setValues((current) => ({ ...current, language: event.target.value as SubmissionFormValues["language"] }))}
          options={[
            { label: "JavaScript", value: "JAVASCRIPT" },
            { label: "TypeScript", value: "TYPESCRIPT" },
            { label: "Python", value: "PYTHON" }
          ]}
        />
        <Select
          label="Difficulty"
          value={values.difficulty}
          onChange={(event) => setValues((current) => ({ ...current, difficulty: event.target.value as SubmissionFormValues["difficulty"] }))}
          options={[
            { label: "Beginner", value: "BEGINNER" },
            { label: "Intermediate", value: "INTERMEDIATE" },
            { label: "Advanced", value: "ADVANCED" }
          ]}
        />
        <Input
          label="Topic"
          value={values.topic}
          onChange={(event) => setValues((current) => ({ ...current, topic: event.target.value }))}
          placeholder="Arrays"
        />
      </div>

      <Textarea
        label="Problem / Prompt"
        value={values.prompt}
        onChange={(event) => setValues((current) => ({ ...current, prompt: event.target.value }))}
        rows={5}
        placeholder="Describe the coding task and any constraints."
      />

      <Textarea
        label="Source Code"
        value={values.sourceCode}
        onChange={(event) => setValues((current) => ({ ...current, sourceCode: event.target.value }))}
        rows={14}
        className="font-mono"
        placeholder="Paste your solution here."
      />

      <label className="flex items-center gap-2 text-sm text-[var(--foreground)]">
        <input
          type="checkbox"
          checked={values.saveAsDraft}
          onChange={(event) => setValues((current) => ({ ...current, saveAsDraft: event.target.checked }))}
        />
        Save as draft instead of submitting for review
      </label>

      <div className="flex gap-3">
        <Button type="submit" disabled={submitting}>
          {submitting
            ? "Saving…"
            : mode === "edit"
              ? values.saveAsDraft
                ? "Update draft"
                : "Submit changes"
              : values.saveAsDraft
                ? "Save draft"
                : "Submit for review"}
        </Button>
        <Button type="button" variant="secondary" onClick={() => router.push("/dashboard/submissions")}>
          Cancel
        </Button>
      </div>
    </form>
  );
}