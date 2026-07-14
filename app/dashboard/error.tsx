"use client";

import { useEffect } from "react";
import { ErrorState } from "@/components/ui/error-state";

type DashboardErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function DashboardError({ error, reset }: DashboardErrorProps) {
  useEffect(() => {
    console.error("Dashboard error:", error);
  }, [error]);

  return (
    <div className="space-y-4 p-6">
      <ErrorState
        title="Dashboard error"
        description="Something went wrong loading this page. Please try again."
      />
      <button
        onClick={reset}
        className="rounded-xl bg-[var(--primary)] px-6 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90"
      >
        Try again
      </button>
    </div>
  );
}
