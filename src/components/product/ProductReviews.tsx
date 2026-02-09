"use client";

import { useState } from "react";
import { useMutation, useQuery } from "@apollo/client/react";
import { CREATE_PRODUCT_REVIEW, PRODUCT_REVIEW_RATINGS_METADATA } from "@/lib/graphql/mutations/review";
import { useToast } from "@/components/ui/Toast";

interface Review {
  nickname: string;
  summary: string;
  text: string;
  average_rating: number;
  created_at: string;
  ratings_breakdown: { name: string; value: string }[];
}

interface ProductReviewsProps {
  sku: string;
  reviewCount: number;
  ratingSummary: number;
  reviews: Review[];
}

function StarRating({ rating, max = 5, size = "md" }: { rating: number; max?: number; size?: "sm" | "md" }) {
  const filled = Math.round((rating / 100) * max);
  const sizeClass = size === "sm" ? "h-3.5 w-3.5" : "h-5 w-5";
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: max }, (_, i) => (
        <svg
          key={i}
          className={`${sizeClass} ${i < filled ? "text-yellow-400" : "text-gray-200"}`}
          fill="currentColor"
          viewBox="0 0 24 24"
        >
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      ))}
    </div>
  );
}

function InteractiveStars({
  value,
  onChange,
}: {
  value: number;
  onChange: (v: number) => void;
}) {
  const [hovered, setHovered] = useState(0);
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onMouseEnter={() => setHovered(star)}
          onMouseLeave={() => setHovered(0)}
          onClick={() => onChange(star)}
          className="p-0.5"
        >
          <svg
            className={`h-7 w-7 transition ${
              star <= (hovered || value)
                ? "text-yellow-400"
                : "text-gray-200"
            }`}
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
        </button>
      ))}
    </div>
  );
}

function formatDate(dateStr: string) {
  try {
    return new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return dateStr;
  }
}

export function ProductReviews({
  sku,
  reviewCount,
  ratingSummary,
  reviews,
}: ProductReviewsProps) {
  const [showForm, setShowForm] = useState(false);
  const [nickname, setNickname] = useState("");
  const [summary, setSummary] = useState("");
  const [text, setText] = useState("");
  const [starRating, setStarRating] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const { addToast } = useToast();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: metaData } = useQuery<any>(PRODUCT_REVIEW_RATINGS_METADATA);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [createReview, { loading }] = useMutation<any>(CREATE_PRODUCT_REVIEW);

  const ratingsMeta = metaData?.productReviewRatingsMetadata?.items || [];

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (starRating === 0) {
      setError("Please select a star rating.");
      return;
    }

    // Build ratings from metadata — map star value (1-5) to the matching value_id
    const ratings = ratingsMeta.map((meta: { id: string; values: { value_id: string; value: string }[] }) => {
      const matchedValue = meta.values.find(
        (v: { value: string }) => v.value === String(starRating),
      );
      return {
        id: meta.id,
        value_id: matchedValue?.value_id || meta.values[starRating - 1]?.value_id || meta.values[0]?.value_id,
      };
    });

    if (ratings.length === 0) {
      setError("Unable to load rating categories. Please try again.");
      return;
    }

    try {
      await createReview({
        variables: {
          sku,
          nickname,
          summary,
          text,
          ratings,
        },
      });
      addToast("Review submitted! It will appear after approval.", "success");
      setShowForm(false);
      setNickname("");
      setSummary("");
      setText("");
      setStarRating(0);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to submit review";
      setError(msg);
      addToast(msg, "error");
    }
  }

  return (
    <div>
      {/* Summary header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <StarRating rating={ratingSummary} />
            <span className="text-sm font-medium text-gray-600">
              {ratingSummary > 0
                ? `${(ratingSummary / 20).toFixed(1)} out of 5`
                : "No ratings yet"}
            </span>
          </div>
          <span className="text-sm text-gray-400">
            ({reviewCount} {reviewCount === 1 ? "review" : "reviews"})
          </span>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700 active:scale-[0.98]"
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
              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
            />
          </svg>
          Write a Review
        </button>
      </div>

      {/* Review Form */}
      {showForm && (
        <div className="mb-8 rounded-xl border border-gray-200 bg-gray-50 p-6">
          <h3 className="mb-4 text-base font-semibold text-gray-900">
            Write Your Review
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Star rating */}
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Your Rating <span className="text-red-500">*</span>
              </label>
              <InteractiveStars value={starRating} onChange={setStarRating} />
            </div>

            {/* Nickname + Summary row */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Nickname <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 outline-none focus:border-red-300 focus:ring-2 focus:ring-red-100"
                  placeholder="Your name"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Summary <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 outline-none focus:border-red-300 focus:ring-2 focus:ring-red-100"
                  placeholder="Brief summary of your review"
                />
              </div>
            </div>

            {/* Review text */}
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Review <span className="text-red-500">*</span>
              </label>
              <textarea
                required
                rows={4}
                value={text}
                onChange={(e) => setText(e.target.value)}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 outline-none focus:border-red-300 focus:ring-2 focus:ring-red-100"
                placeholder="Share your experience with this product..."
              />
            </div>

            {error && (
              <p className="text-sm font-medium text-red-600">{error}</p>
            )}

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={loading}
                className="rounded-lg bg-red-600 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700 disabled:opacity-50"
              >
                {loading ? "Submitting..." : "Submit Review"}
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="rounded-lg border border-gray-200 px-6 py-2.5 text-sm font-medium text-gray-600 transition hover:bg-gray-100"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Reviews list */}
      {reviews.length > 0 ? (
        <div className="space-y-4">
          {reviews.map((review, idx) => (
            <div
              key={idx}
              className="rounded-xl border border-gray-200 bg-white p-5"
            >
              <div className="mb-2 flex items-start justify-between">
                <div>
                  <StarRating rating={review.average_rating} size="sm" />
                  <h4 className="mt-1 text-sm font-semibold text-gray-900">
                    {review.summary}
                  </h4>
                </div>
                <div className="text-right text-xs text-gray-400">
                  <p className="font-medium text-gray-600">
                    {review.nickname}
                  </p>
                  <p>{formatDate(review.created_at)}</p>
                </div>
              </div>
              <p className="text-sm leading-relaxed text-gray-600">
                {review.text}
              </p>
            </div>
          ))}
        </div>
      ) : !showForm ? (
        <div className="rounded-xl border border-dashed border-gray-200 py-12 text-center">
          <svg
            className="mx-auto mb-3 h-10 w-10 text-gray-300"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            strokeWidth="1.5"
          >
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
          <p className="text-sm text-gray-400">
            No reviews yet. Be the first to review this product!
          </p>
        </div>
      ) : null}
    </div>
  );
}
