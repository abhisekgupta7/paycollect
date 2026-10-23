"use client";

import { useEffect } from "react";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Dashboard failed to load:", error);
  }, [error]);

  return (
    <div className="mx-auto max-w-xl px-5 py-20 text-center sm:px-8">
      <h1 className="text-xl font-semibold text-[#172033]">
        Dashboard unavailable
      </h1>
      <p className="mt-2 text-sm text-[#667085]">
        We could not load your receivables summary. Please try again.
      </p>
      <button
        type="button"
        onClick={reset}
        className="mt-6 rounded-lg bg-[#243b64] px-4 py-2 text-sm font-medium text-white hover:bg-[#1b2f52]"
      >
        Try again
      </button>
    </div>
  );
}
