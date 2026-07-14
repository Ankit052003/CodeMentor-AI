"use client";

import React, { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { ErrorState } from "@/components/ui/error-state";
import { LoadingState } from "@/components/ui/loading-state";
import { SubmissionEditorForm, type SubmissionFormValues } from "@/components/app/submission-editor-form";

const defaultValues: SubmissionFormValues = {
  title: "",
  language: "JAVASCRIPT",
  topic: "",
  difficulty: "BEGINNER",
  prompt: "",
  sourceCode: "",
  saveAsDraft: false
};

export function NewSubmissionPageClient() {
  const searchParams = useSearchParams();
  const draftId = searchParams.get("draft");
  const [values, setValues] = useState<SubmissionFormValues>(defaultValues);
  const [loadingDraft, setLoadingDraft] = useState(Boolean(draftId));
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadDraft() {
      if (!draftId) {
        setValues(defaultValues);
        setLoadingDraft(false);
        return;
      }

      setLoadingDraft(true);
      setError(null);

      const response = await fetch(`/api/submissions/${draftId}`);
      const data = await response.json().catch(() => null);

      if (cancelled) return;

      if (!response.ok) {
        setError(data?.error ?? "Unable to load draft submission.");
        setLoadingDraft(false);
        return;
      }

      if (data.submission.status !== "DRAFT") {
        setError("Only draft submissions can be edited from this page.");
        setLoadingDraft(false);
        return;
      }

      setValues({
        title: data.submission.title,
        language: data.submission.language,
        topic: data.submission.topic,
        difficulty: data.submission.difficulty,
        prompt: data.submission.prompt,
        sourceCode: data.submission.sourceCode,
        saveAsDraft: true
      });
      setLoadingDraft(false);
    }

    void loadDraft();

    return () => {
      cancelled = true;
    };
  }, [draftId]);

  if (loadingDraft) {
    return (
      <div className="p-6">
        <LoadingState />
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">{draftId ? "Edit Draft" : "New Submission"}</h1>
        <p className="mt-1 text-sm text-[var(--muted)]">{draftId ? "Update your saved draft before sending it for review." : "Create a draft or submit directly for review."}</p>
      </div>

      {error ? <ErrorState title="Draft load failed" description={error} /> : null}

      <SubmissionEditorForm mode={draftId ? "edit" : "create"} submissionId={draftId ?? undefined} initialValues={values} />
    </div>
  );
}