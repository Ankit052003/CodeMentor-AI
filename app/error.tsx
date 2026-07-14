"use client";

import { useEffect } from "react";

type ErrorPageProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function RootError({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    console.error("Root error boundary caught:", error);
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--background)] p-6">
      <div className="max-w-md text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
          <span className="text-2xl font-bold text-red-600">!</span>
        </div>
        <h1 className="mt-6 text-2xl font-bold text-[var(--foreground)]">Something went wrong</h1>
        <p className="mt-2 text-[var(--muted)]">
          An unexpected error occurred. Please try again.
        </p>
        <button
          onClick={reset}
          className="mt-6 rounded-xl bg-[var(--primary)] px-6 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90"
        >
          Try again
        </button>
      </div>
    </div>
  );
}
