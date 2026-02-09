export default function CheckoutLoading() {
  return (
    <div className="bg-gray-50 pb-16">
      {/* Hero skeleton */}
      <div className="bg-gradient-to-br from-gray-900 via-gray-900 to-gray-800">
        <div className="mx-auto max-w-7xl px-4 py-8">
          <div className="h-8 w-36 animate-pulse rounded bg-gray-700" />
        </div>
      </div>
      {/* Content skeleton */}
      <div className="mx-auto max-w-7xl px-4 pt-6">
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Form area */}
          <div className="space-y-6 lg:col-span-2">
            <div className="h-80 animate-pulse rounded-xl bg-gray-200" />
            <div className="h-48 animate-pulse rounded-xl bg-gray-200" />
          </div>
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="h-64 animate-pulse rounded-xl bg-gray-200" />
          </div>
        </div>
      </div>
    </div>
  );
}
