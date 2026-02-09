export default function SearchLoading() {
  return (
    <div className="bg-gray-50 pb-16">
      {/* Hero skeleton */}
      <div className="bg-gradient-to-r from-gray-900 to-gray-800">
        <div className="mx-auto max-w-7xl px-4 py-8">
          <div className="h-9 w-48 animate-pulse rounded bg-gray-700" />
          <div className="mt-2 h-4 w-64 animate-pulse rounded bg-gray-700" />
        </div>
      </div>
      {/* Content skeleton */}
      <div className="mx-auto max-w-7xl px-4 pt-8">
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
  );
}
