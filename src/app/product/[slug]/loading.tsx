export default function ProductLoading() {
  return (
    <div className="bg-gray-50">
      {/* Hero skeleton */}
      <div className="bg-gradient-to-br from-gray-900 via-gray-900 to-gray-800">
        <div className="mx-auto max-w-7xl px-4 py-7">
          <div className="mb-4 h-4 w-64 animate-pulse rounded bg-gray-700" />
          <div className="mb-2 h-4 w-24 animate-pulse rounded bg-gray-700" />
          <div className="h-8 w-96 animate-pulse rounded bg-gray-700" />
          <div className="mt-3 h-4 w-32 animate-pulse rounded bg-gray-700" />
        </div>
      </div>
      {/* Content skeleton */}
      <div className="mx-auto max-w-7xl px-4 py-9">
        <div className="grid gap-12 md:grid-cols-2">
          {/* Gallery placeholder */}
          <div className="aspect-square animate-pulse rounded-xl bg-gray-200" />
          {/* Info placeholder */}
          <div className="space-y-4">
            <div className="h-10 w-32 animate-pulse rounded-lg bg-gray-200" />
            <div className="h-24 animate-pulse rounded-xl bg-gray-200" />
            <div className="h-12 animate-pulse rounded-lg bg-gray-200" />
            <div className="h-12 animate-pulse rounded-lg bg-gray-200" />
            <div className="h-48 animate-pulse rounded-xl bg-gray-200" />
          </div>
        </div>
      </div>
    </div>
  );
}
