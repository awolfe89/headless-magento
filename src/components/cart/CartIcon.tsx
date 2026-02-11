"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useQuery } from "@apollo/client/react";
import { CART_QUERY } from "@/lib/graphql/queries/cart";
import { getCartToken } from "@/lib/cart/cartToken";

export function CartIcon() {
  const [cartId, setCartId] = useState<string | null>(null);

  useEffect(() => {
    setCartId(getCartToken());

    function onCartUpdate() {
      setCartId(getCartToken());
    }
    window.addEventListener("cart-updated", onCartUpdate);
    window.addEventListener("cart-change", onCartUpdate);
    window.addEventListener("storage", onCartUpdate);
    return () => {
      window.removeEventListener("cart-updated", onCartUpdate);
      window.removeEventListener("cart-change", onCartUpdate);
      window.removeEventListener("storage", onCartUpdate);
    };
  }, []);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, refetch } = useQuery<any>(CART_QUERY, {
    variables: { cartId: cartId || "" },
    skip: !cartId,
    pollInterval: 30000,
  });

  // Refetch cart data when cart changes
  useEffect(() => {
    if (!cartId) return;
    function onCartUpdate() {
      refetch();
    }
    window.addEventListener("cart-updated", onCartUpdate);
    window.addEventListener("cart-change", onCartUpdate);
    return () => {
      window.removeEventListener("cart-updated", onCartUpdate);
      window.removeEventListener("cart-change", onCartUpdate);
    };
  }, [cartId, refetch]);

  const count = data?.cart?.total_quantity || 0;

  return (
    <Link
      href="/cart"
      className="relative flex items-center gap-1.5 text-gray-600 transition hover:text-gray-900"
      aria-label={`Cart with ${count} items`}
    >
      <svg
        className="h-6 w-6"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="9" cy="21" r="1" />
        <circle cx="20" cy="21" r="1" />
        <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
      </svg>
      {count > 0 && (
        <span className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-xs font-bold text-white">
          {count}
        </span>
      )}
    </Link>
  );
}
