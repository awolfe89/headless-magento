"use client";

import { useQuery } from "@apollo/client/react";
import { CUSTOMER_REVIEWS_QUERY } from "@/lib/graphql/queries/customer";
import Link from "next/link";

function StarRating({ rating, max = 5 }: { rating: number; max?: number }) {
  const filled = Math.round((rating / 100) * max);
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: max }, (_, i) => (
        <svg
          key={i}
          className={`h-4 w-4 ${i < filled ? "text-yellow-400" : "text-gray-200"}`}
          fill="currentColor"
          viewBox="0 0 24 24"
        >
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      ))}
    </div>
  );
}

function formatDate(dateStr: string) {
  try {
    return new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return dateStr;
  }
}

export default function ReviewsPage() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, loading, error } = useQuery<any>(CUSTOMER_REVIEWS_QUERY, {
    variables: { pageSize: 20, currentPage: 1 },
  });

  if (loading) {
    return (
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="flex items-center gap-2 bg-gray-900 px-5 py-3">
          <span className="h-3.5 w-[3px] rounded-sm bg-red-600" />
          <h2 className="text-xs font-semibold uppercase tracking-[1px] text-gray-400">
            My Reviews
          </h2>
        </div>
        <div className="animate-pulse space-y-4 p-5">
          {[1, 2, 3].map((i) => (
            <div key={i} className="space-y-2 rounded-lg border border-gray-100 p-4">
              <div className="h-4 w-32 rounded bg-gray-200" />
              <div className="h-3 w-48 rounded bg-gray-200" />
              <div className="h-3 w-full rounded bg-gray-200" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
        Error loading reviews. Please try again.
      </div>
    );
  }

  const reviews = data?.customer?.reviews?.items || [];

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
      {/* Header */}
      <div className="flex items-center gap-2 bg-gray-900 px-5 py-3">
        <span className="h-3.5 w-[3px] rounded-sm bg-red-600" />
        <h2 className="text-xs font-semibold uppercase tracking-[1px] text-gray-400">
          My Reviews
        </h2>
        {reviews.length > 0 && (
          <span className="ml-auto text-xs text-gray-500">
            {reviews.length} review{reviews.length !== 1 ? "s" : ""}
          </span>
        )}
      </div>

      {reviews.length === 0 ? (
        /* Empty state */
        <div className="px-5 py-12 text-center">
          <svg
            className="mx-auto mb-4 h-12 w-12 text-gray-300"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            strokeWidth="1"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
            />
          </svg>
          <p className="text-sm font-medium text-gray-900">No reviews yet</p>
          <p className="mt-1 text-sm text-gray-500">
            Your product reviews will appear here.
          </p>
        </div>
      ) : (
        <div className="divide-y divide-gray-100">
          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
          {reviews.map((review: any, idx: number) => (
            <div key={idx} className="p-5">
              {/* Product + date header */}
              <div className="mb-3 flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <Link
                    href={`/product/${review.product.url_key}`}
                    className="text-sm font-semibold text-gray-900 transition hover:text-red-600"
                  >
                    {review.product.name}
                  </Link>
                  <p className="mt-0.5 text-xs text-gray-400">
                    SKU: {review.product.sku}
                  </p>
                </div>
                <span className="shrink-0 text-xs text-gray-400">
                  {formatDate(review.created_at)}
                </span>
              </div>

              {/* Rating + title */}
              <div className="mb-2 flex items-center gap-3">
                <StarRating rating={review.average_rating} />
                <span className="text-sm font-medium text-gray-900">
                  {review.summary}
                </span>
              </div>

              {/* Review text */}
              <p className="text-sm leading-relaxed text-gray-600">
                {review.text}
              </p>

              {/* Rating breakdown */}
              {review.ratings_breakdown?.length > 0 && (
                <div className="mt-2 flex gap-4">
                  {review.ratings_breakdown.map(
                    (r: { name: string; value: string }, i: number) => (
                      <span
                        key={i}
                        className="text-xs text-gray-400"
                      >
                        {r.name}: {r.value}/5
                      </span>
                    ),
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
