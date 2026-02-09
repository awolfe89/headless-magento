export default function BlogPostLoading() {
  return (
    <article>
      {/* Hero skeleton */}
      <div className="bg-gradient-to-br from-gray-900 via-gray-900 to-gray-800">
        <div className="mx-auto max-w-4xl px-4 py-12">
          <div className="mb-4 h-4 w-48 animate-pulse rounded bg-gray-700" />
          <div className="mb-3 flex gap-2">
            <div className="h-6 w-20 animate-pulse rounded-full bg-gray-700" />
            <div className="h-6 w-24 animate-pulse rounded-full bg-gray-700" />
          </div>
          <div className="h-10 w-3/4 animate-pulse rounded bg-gray-700" />
          <div className="mt-4 h-4 w-40 animate-pulse rounded bg-gray-700" />
        </div>
      </div>
      {/* Content skeleton */}
      <div className="mx-auto max-w-4xl px-4 py-10">
        <div className="space-y-4">
          {[85, 92, 78, 95, 70, 88, 82, 90].map((w, i) => (
            <div
              key={i}
              className="h-5 animate-pulse rounded bg-gray-200"
              style={{ width: `${w}%` }}
            />
          ))}
          <div className="h-64 animate-pulse rounded-lg bg-gray-200" />
          {[75, 88, 95, 68, 82].map((w, i) => (
            <div
              key={`b-${i}`}
              className="h-5 animate-pulse rounded bg-gray-200"
              style={{ width: `${w}%` }}
            />
          ))}
        </div>
      </div>
    </article>
  );
}
