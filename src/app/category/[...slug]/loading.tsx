export default function CategoryLoading() {
  return (
    <div className="bg-gray-50 pb-16">
      {/* Hero skeleton */}
      <div className="bg-gradient-to-br from-gray-900 via-gray-900 to-gray-800">
        <div className="mx-auto max-w-7xl px-4 py-10">
          <div className="mb-3 h-4 w-48 animate-pulse rounded bg-gray-700" />
          <div className="h-9 w-72 animate-pulse rounded bg-gray-700" />
        </div>
      </div>
      {/* Content skeleton */}
      <div className="mx-auto max-w-7xl px-4 pt-8">
        <div className="flex gap-8">
          {/* Sidebar */}
          <div className="hidden w-60 shrink-0 space-y-3 lg:block">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="h-10 animate-pulse rounded-lg bg-gray-200"
              />
            ))}
          </div>
          {/* Product grid */}
          <div className="flex-1">
            <div className="mb-6 h-10 w-full animate-pulse rounded-lg bg-gray-200" />
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div
                  key={i}
                  className="h-72 animate-pulse rounded-xl bg-gray-200"
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
