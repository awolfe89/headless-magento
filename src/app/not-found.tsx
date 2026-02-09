import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-[70vh] bg-gray-50">
      {/* Hero strip */}
      <div className="bg-gradient-to-r from-gray-900 to-gray-800">
        <div className="mx-auto max-w-7xl px-4 py-8">
          <h1 className="text-2xl font-bold text-white">Page Not Found</h1>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-7xl px-4 py-16 text-center">
        <p className="text-[120px] font-bold leading-none text-gray-200">
          404
        </p>
        <h2 className="mt-4 text-xl font-bold text-gray-900">
          We can&apos;t find that page
        </h2>
        <p className="mt-2 text-sm text-gray-500">
          The page you&apos;re looking for may have been moved, deleted, or
          doesn&apos;t exist.
        </p>

        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-red-700"
          >
            <svg
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              strokeWidth="2"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
              />
            </svg>
            Back to Home
          </Link>
          <Link
            href="/brands"
            className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-6 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
          >
            Browse Brands
          </Link>
        </div>

        <p className="mt-10 text-xs text-gray-400">
          Need help? Call us at{" "}
          <a
            href={`tel:${process.env.NEXT_PUBLIC_COMPANY_PHONE || "847-639-4700"}`}
            className="font-medium text-red-600 hover:underline"
          >
            {process.env.NEXT_PUBLIC_COMPANY_PHONE || "847-639-4700"}
          </a>{" "}
          · Mon–Fri, 8am–5pm CST
        </p>
      </div>
    </div>
  );
}
