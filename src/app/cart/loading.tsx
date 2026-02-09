export default function CartLoading() {
  return (
    <div className="bg-gray-50 pb-16">
      {/* Hero skeleton */}
      <div className="bg-gradient-to-br from-gray-900 via-gray-900 to-gray-800">
        <div className="mx-auto max-w-7xl px-4 py-10">
          <div className="h-9 w-48 animate-pulse rounded bg-gray-700" />
        </div>
      </div>
      {/* Content skeleton */}
      <div className="mx-auto max-w-7xl px-4 pt-8">
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Cart items */}
          <div className="lg:col-span-2">
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={i}
                  className="flex gap-4 rounded-xl border border-gray-200 bg-white p-4"
                >
                  <div className="h-24 w-24 shrink-0 animate-pulse rounded-lg bg-gray-200" />
                  <div className="flex-1 space-y-3">
                    <div className="h-4 w-3/4 animate-pulse rounded bg-gray-200" />
                    <div className="h-3 w-1/4 animate-pulse rounded bg-gray-200" />
                    <div className="h-3 w-1/3 animate-pulse rounded bg-gray-200" />
                  </div>
                </div>
              ))}
            </div>
          </div>
          {/* Order summary */}
          <div className="lg:col-span-1">
            <div className="h-64 animate-pulse rounded-xl bg-gray-200" />
          </div>
        </div>
      </div>
    </div>
  );
}
