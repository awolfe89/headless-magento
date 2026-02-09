"use client";

import Link from "next/link";

interface ErrorFallbackProps {
  title?: string;
  message?: string;
  reset?: () => void;
}

export function ErrorFallback({
  title = "Something went wrong",
  message = "We couldn't load this page. Please try again.",
  reset,
}: ErrorFallbackProps) {
  return (
    <div className="bg-gray-50 pb-16">
      <div className="bg-gradient-to-br from-gray-900 via-gray-900 to-gray-800">
        <div className="mx-auto max-w-7xl px-4 py-10">
          <h1 className="text-2xl font-bold text-white">{title}</h1>
        </div>
      </div>
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
        <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
          <svg
            className="h-8 w-8 text-red-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            strokeWidth="1.5"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
            />
          </svg>
        </div>
        <p className="mb-8 text-gray-600">{message}</p>
        <div className="flex items-center justify-center gap-4">
          {reset && (
            <button
              onClick={reset}
              className="rounded-lg bg-red-600 px-6 py-2.5 text-sm font-medium text-white transition hover:bg-red-700"
            >
              Try Again
            </button>
          )}
          <Link
            href="/"
            className="rounded-lg border border-gray-200 bg-white px-6 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
          >
            Go Home
          </Link>
        </div>
      </div>
    </div>
  );
}
