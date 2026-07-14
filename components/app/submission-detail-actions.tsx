"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

type SubmissionDetailActionsProps = {
  submissionId: string;
  status: string;
};

export function SubmissionDetailActions({ submissionId, status }: SubmissionDetailActionsProps) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  const isDraft = status === "DRAFT";
  const isArchived = status === "ARCHIVED";

  async function handleDeleteOrArchive() {
    setBusy(true);

    const response = await fetch(`/api/submissions/${submissionId}`, {
      method: "DELETE"
    });

    if (response.ok) {
      router.push("/dashboard/submissions");
      router.refresh();
      return;
    }

    setBusy(false);
  }

  return (
    <div className="flex flex-wrap gap-3">
      {isDraft ? (
        <Link
          href={`/dashboard/submissions/new?draft=${submissionId}`}
          className="inline-flex h-10 items-center justify-center rounded-md bg-[var(--primary)] px-4 text-sm font-medium text-[var(--primary-foreground)] transition hover:bg-blue-700"
        >
          Edit draft
        </Link>
      ) : null}

      {!isArchived ? (
        <Button variant={isDraft ? "danger" : "secondary"} onClick={handleDeleteOrArchive} disabled={busy}>
          {isDraft ? "Delete draft" : "Archive submission"}
        </Button>
      ) : null}
    </div>
  );
}