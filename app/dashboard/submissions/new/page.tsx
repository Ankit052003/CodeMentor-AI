import { Suspense } from "react";
import { LoadingState } from "@/components/ui/loading-state";
import { NewSubmissionPageClient } from "./new-submission-page-client";

export default function NewSubmissionPage() {
  return (
    <Suspense
      fallback={
        <div className="p-6">
          <LoadingState />
        </div>
      }
    >
      <NewSubmissionPageClient />
    </Suspense>
  );
}