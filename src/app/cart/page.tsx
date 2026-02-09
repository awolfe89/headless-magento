"use client";

import { useQuery } from "@apollo/client/react";
import { CART_QUERY } from "@/lib/graphql/queries/cart";
import { CartItemRow } from "@/components/cart/CartItemRow";
import { CouponCode } from "@/components/cart/CouponCode";
import { getCartToken } from "@/lib/cart/cartToken";
import { useEffect, useState } from "react";
import Link from "next/link";
import { formatPrice } from "@/lib/formatPrice";

export default function CartPage() {
  const [cartId, setCartId] = useState<string | null>(null);
  const [freeShippingThreshold, setFreeShippingThreshold] = useState<number | null>(null);

  useEffect(() => {
    setCartId(getCartToken());
    fetch("/api/free-shipping")
      .then((r) => r.json())
      .then((d) => setFreeShippingThreshold(d.threshold))
      .catch(() => {});
  }, []);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, loading, error } = useQuery<any>(CART_QUERY, {
    variables: { cartId: cartId || "" },
    skip: !cartId,
  });

  if (!cartId || (!loading && !data?.cart?.items?.length)) {
    return (
      <div className="bg-gray-50 pb-16">
        {/* Hero */}
        <div className="bg-gradient-to-br from-gray-900 via-gray-900 to-gray-800">
          <div className="mx-auto max-w-7xl px-4 py-10">
            <h1 className="text-3xl font-bold text-white">Your Cart</h1>
          </div>
        </div>
        <div className="mx-auto max-w-7xl px-4 pt-12 text-center">
          <div className="mx-auto max-w-md rounded-xl border border-gray-200 bg-white p-10 shadow-sm">
            <svg
              className="mx-auto mb-4 h-16 w-16 text-gray-300"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              strokeWidth="1"
            >
              <circle cx="9" cy="21" r="1" />
              <circle cx="20" cy="21" r="1" />
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
            </svg>
            <h2 className="mb-2 text-lg font-semibold text-gray-900">
              Your cart is empty
            </h2>
            <p className="mb-6 text-sm text-gray-500">
              Looks like you haven&apos;t added anything yet.
            </p>
            <Link
              href="/"
              className="inline-block rounded-lg bg-red-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-red-700"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="bg-gray-50 pb-16">
        <div className="bg-gradient-to-br from-gray-900 via-gray-900 to-gray-800">
          <div className="mx-auto max-w-7xl px-4 py-10">
            <h1 className="text-3xl font-bold text-white">Your Cart</h1>
          </div>
        </div>
        <div className="mx-auto max-w-7xl px-4 pt-12">
          <div className="animate-pulse space-y-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="flex gap-4 rounded-xl border border-gray-200 bg-white p-4"
              >
                <div className="h-24 w-24 rounded-lg bg-gray-200" />
                <div className="flex-1 space-y-3">
                  <div className="h-4 w-3/4 rounded bg-gray-200" />
                  <div className="h-3 w-1/4 rounded bg-gray-200" />
                  <div className="h-3 w-1/3 rounded bg-gray-200" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gray-50 pb-16">
        <div className="bg-gradient-to-br from-gray-900 via-gray-900 to-gray-800">
          <div className="mx-auto max-w-7xl px-4 py-10">
            <h1 className="text-3xl font-bold text-white">Your Cart</h1>
          </div>
        </div>
        <div className="mx-auto max-w-7xl px-4 pt-12 text-center">
          <p className="text-red-600">
            Error loading cart. Please try again.
          </p>
        </div>
      </div>
    );
  }

  const cart = data.cart;
  const subtotal = cart.prices.subtotal_excluding_tax?.value || 0;
  const grandTotal = cart.prices.grand_total.value;
  const currency = cart.prices.grand_total.currency;
  const remainingForFree = freeShippingThreshold !== null ? Math.max(0, freeShippingThreshold - subtotal) : null;

  return (
    <div className="bg-gray-50 pb-16">
      {/* Hero */}
      <div className="bg-gradient-to-br from-gray-900 via-gray-900 to-gray-800">
        <div className="relative mx-auto max-w-7xl px-4 py-10">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_80%_50%,rgba(200,16,46,0.06)_0%,transparent_60%)]" />
          <div className="relative">
            <h1 className="text-3xl font-bold text-white">
              Your Cart{" "}
              <span className="text-lg font-normal text-gray-400">
                ({cart.total_quantity}{" "}
                {cart.total_quantity === 1 ? "item" : "items"})
              </span>
            </h1>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 pt-8">
        {/* Free shipping progress */}
        {freeShippingThreshold !== null && remainingForFree !== null && remainingForFree > 0 && (
          <div className="mb-6 rounded-xl border border-blue-200/60 bg-blue-50/50 px-5 py-3">
            <div className="mb-2 flex items-center justify-between text-sm">
              <span className="font-medium text-blue-700">
                Add ${formatPrice(remainingForFree)} more for{" "}
                <span className="font-bold">FREE shipping</span>
              </span>
              <span className="text-xs text-blue-500">
                ${formatPrice(subtotal)} / ${formatPrice(freeShippingThreshold)}
              </span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-blue-100">
              <div
                className="h-full rounded-full bg-blue-500 transition-all"
                style={{
                  width: `${Math.min(100, (subtotal / freeShippingThreshold) * 100)}%`,
                }}
              />
            </div>
          </div>
        )}
        {freeShippingThreshold !== null && remainingForFree !== null && remainingForFree <= 0 && (
          <div className="mb-6 flex items-center gap-2 rounded-xl border border-green-200/60 bg-green-50/50 px-5 py-3 text-sm font-medium text-green-700">
            <svg
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            You qualify for FREE ground shipping!
          </div>
        )}

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Left: Cart items */}
          <div className="lg:col-span-2">
            <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
              {/* Header */}
              <div className="border-b border-gray-100 bg-gray-50/50 px-5 py-3">
                <div className="grid grid-cols-12 text-xs font-semibold uppercase tracking-wide text-gray-400">
                  <span className="col-span-6">Product</span>
                  <span className="col-span-2 text-center">Qty</span>
                  <span className="col-span-2 text-right">Price</span>
                  <span className="col-span-2 text-right">Total</span>
                </div>
              </div>

              {/* Items */}
              <div className="divide-y divide-gray-100">
                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                {cart.items.map((item: any) => (
                  <CartItemRow
                    key={item.uid}
                    item={item}
                    cartId={cartId!}
                  />
                ))}
              </div>
            </div>

            {/* Continue shopping */}
            <div className="mt-4">
              <Link
                href="/"
                className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 transition hover:text-gray-900"
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
                    d="M10 19l-7-7m0 0l7-7m-7 7h18"
                  />
                </svg>
                Continue Shopping
              </Link>
            </div>
          </div>

          {/* Right: Order Summary */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
              <div className="flex items-center gap-2 bg-gray-900 px-5 py-3">
                <span className="h-3.5 w-[3px] rounded-sm bg-red-600" />
                <h2 className="text-xs font-semibold uppercase tracking-[1px] text-gray-400">
                  Order Summary
                </h2>
              </div>

              <div className="p-5">
                {/* Subtotal */}
                <div className="mb-3 flex justify-between text-sm">
                  <span className="text-gray-500">Subtotal</span>
                  <span className="font-medium text-gray-900">
                    ${formatPrice(subtotal)} {currency}
                  </span>
                </div>

                {/* Taxes */}
                {cart.prices.applied_taxes?.map(
                  (tax: {
                    label: string;
                    amount: { value: number; currency: string };
                  }) => (
                    <div
                      key={tax.label}
                      className="mb-3 flex justify-between text-sm"
                    >
                      <span className="text-gray-500">{tax.label}</span>
                      <span className="font-medium text-gray-900">
                        ${formatPrice(tax.amount.value)}
                      </span>
                    </div>
                  ),
                )}

                {/* Discounts */}
                {cart.prices.discounts?.map(
                  (discount: {
                    label: string;
                    amount: { value: number; currency: string };
                  }) => (
                    <div
                      key={discount.label}
                      className="mb-3 flex justify-between text-sm"
                    >
                      <span className="text-green-600">{discount.label}</span>
                      <span className="font-medium text-green-600">
                        -${formatPrice(discount.amount.value)}
                      </span>
                    </div>
                  ),
                )}

                {/* Shipping note */}
                <div className="mb-3 flex justify-between text-sm">
                  <span className="text-gray-500">Shipping</span>
                  <span className="text-xs text-gray-400">
                    Calculated at checkout
                  </span>
                </div>

                {/* Coupon code */}
                <div className="mb-3 border-t border-gray-200 pt-3">
                  <CouponCode
                    cartId={cartId!}
                    appliedCoupon={cart.applied_coupons?.[0]?.code || null}
                  />
                </div>

                {/* Grand total */}
                <div className="mt-4 flex justify-between border-t border-gray-200 pt-4">
                  <span className="text-base font-bold text-gray-900">
                    Estimated Total
                  </span>
                  <span className="text-xl font-bold text-gray-900">
                    ${formatPrice(grandTotal)}
                  </span>
                </div>

                {/* Checkout button */}
                <Link
                  href="/checkout"
                  className="mt-5 flex w-full items-center justify-center gap-2 rounded-lg bg-red-600 px-6 py-3.5 text-base font-semibold text-white shadow-sm transition hover:bg-red-700 hover:shadow-md active:scale-[0.98]"
                >
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    strokeWidth="2"
                  >
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0110 0v4" />
                  </svg>
                  Proceed to Checkout
                </Link>

                {/* Trust badges */}
                <div className="mt-4 flex items-center justify-center gap-3 text-xs text-gray-400">
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
                      d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                    />
                  </svg>
                  Secure checkout &middot; SSL encrypted
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
