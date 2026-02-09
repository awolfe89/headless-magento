"use client";

import { useState } from "react";
 
import { useMutation } from "@apollo/client/react";
import {
  APPLY_COUPON,
  REMOVE_COUPON,
} from "@/lib/graphql/mutations/checkout";
import { CART_QUERY } from "@/lib/graphql/queries/cart";

interface CouponCodeProps {
  cartId: string;
  appliedCoupon?: string | null;
}

export function CouponCode({ cartId, appliedCoupon }: CouponCodeProps) {
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(!!appliedCoupon);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [applyCoupon, { loading: applying }] = useMutation<any>(APPLY_COUPON, {
    refetchQueries: [{ query: CART_QUERY, variables: { cartId } }],
  });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [removeCoupon, { loading: removing }] = useMutation<any>(
    REMOVE_COUPON,
    {
      refetchQueries: [{ query: CART_QUERY, variables: { cartId } }],
    },
  );

  async function handleApply() {
    setError(null);
    const trimmed = code.trim();
    if (!trimmed) return;
    try {
      await applyCoupon({
        variables: { cartId, couponCode: trimmed },
      });
      setCode("");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Invalid coupon code",
      );
    }
  }

  async function handleRemove() {
    setError(null);
    try {
      await removeCoupon({ variables: { cartId } });
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to remove coupon",
      );
    }
  }

  if (appliedCoupon) {
    return (
      <div className="mb-3 flex items-center justify-between rounded-lg border border-green-200 bg-green-50 px-4 py-2.5">
        <div className="flex items-center gap-2">
          <svg
            className="h-4 w-4 text-green-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            strokeWidth="2"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
            />
          </svg>
          <span className="text-sm font-semibold text-green-700">
            {appliedCoupon}
          </span>
        </div>
        <button
          onClick={handleRemove}
          disabled={removing}
          className="text-xs font-medium text-green-600 transition hover:text-red-600"
        >
          {removing ? "..." : "Remove"}
        </button>
      </div>
    );
  }

  return (
    <div className="mb-3">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between text-sm text-gray-500 transition hover:text-gray-700"
      >
        <span className="flex items-center gap-1.5">
          <svg
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            strokeWidth="1.5"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
            />
          </svg>
          Have a coupon code?
        </span>
        <svg
          className={`h-4 w-4 transition ${open ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          strokeWidth="2"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {open && (
        <div className="mt-2 flex gap-2">
          <input
            type="text"
            value={code}
            onChange={(e) => {
              setCode(e.target.value.toUpperCase());
              setError(null);
            }}
            placeholder="Enter code"
            className="flex-1 rounded-lg border border-gray-200 px-3 py-2 text-sm uppercase outline-none transition focus:border-red-300 focus:ring-2 focus:ring-red-100"
            onKeyDown={(e) => e.key === "Enter" && handleApply()}
          />
          <button
            onClick={handleApply}
            disabled={applying || !code.trim()}
            className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-gray-800 disabled:opacity-50"
          >
            {applying ? "..." : "Apply"}
          </button>
        </div>
      )}

      {error && (
        <p className="mt-1.5 text-xs font-medium text-red-600">{error}</p>
      )}
    </div>
  );
}
