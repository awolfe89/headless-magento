export default function BlogLoading() {
  return (
    <div className="bg-gray-50 pb-16">
      {/* Hero skeleton */}
      <div className="bg-gradient-to-br from-gray-900 via-gray-900 to-gray-800">
        <div className="mx-auto max-w-7xl px-4 py-12">
          <div className="h-9 w-32 animate-pulse rounded bg-gray-700" />
          <div className="mt-3 h-5 w-96 animate-pulse rounded bg-gray-700" />
          <div className="mt-6 h-12 w-full max-w-md animate-pulse rounded-lg bg-gray-800" />
        </div>
      </div>
      {/* Content skeleton */}
      <div className="mx-auto max-w-7xl px-4 pt-8">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="overflow-hidden rounded-xl bg-white shadow-sm">
              <div className="aspect-video animate-pulse bg-gray-200" />
              <div className="space-y-3 p-5">
                <div className="h-5 w-3/4 animate-pulse rounded bg-gray-200" />
                <div className="h-4 w-full animate-pulse rounded bg-gray-200" />
                <div className="h-4 w-1/2 animate-pulse rounded bg-gray-200" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
