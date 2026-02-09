"use client";

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body className="antialiased">
        <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
          <div className="text-center">
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
            <h1 className="mb-2 text-2xl font-bold text-gray-900">
              Something went wrong
            </h1>
            <p className="mb-8 text-gray-600">
              An unexpected error occurred. Please try again.
            </p>
            <div className="flex items-center justify-center gap-4">
              <button
                onClick={reset}
                className="rounded-lg bg-red-600 px-6 py-2.5 text-sm font-medium text-white transition hover:bg-red-700"
              >
                Try Again
              </button>
              <a
                href="/"
                className="rounded-lg border border-gray-200 bg-white px-6 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
              >
                Go Home
              </a>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
