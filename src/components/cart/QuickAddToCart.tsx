"use client";

import { useMutation } from "@apollo/client/react";
import {
  CREATE_EMPTY_CART,
  ADD_PRODUCTS_TO_CART,
} from "@/lib/graphql/mutations/cart";
import { getCartToken, setCartToken } from "@/lib/cart/cartToken";
import { useState } from "react";

interface QuickAddToCartProps {
  sku: string;
  stockStatus: string;
}

export function QuickAddToCart({ sku, stockStatus }: QuickAddToCartProps) {
  const [state, setState] = useState<"idle" | "loading" | "added" | "error">(
    "idle",
  );
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [createEmptyCart] = useMutation<any>(CREATE_EMPTY_CART);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [addProducts] = useMutation<any>(ADD_PRODUCTS_TO_CART);

  const isOutOfStock = stockStatus === "OUT_OF_STOCK";

  async function handleAdd(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (isOutOfStock || state === "loading") return;
    setState("loading");

    try {
      let cartId = getCartToken();
      if (!cartId) {
        const { data } = await createEmptyCart();
        cartId = data.createEmptyCart;
        setCartToken(cartId!);
      }

      const { data } = await addProducts({
        variables: {
          cartId,
          cartItems: [{ sku, quantity: 1 }],
        },
      });

      if (data?.addProductsToCart?.user_errors?.length) {
        setState("error");
        setTimeout(() => setState("idle"), 2000);
        return;
      }

      setState("added");
      window.dispatchEvent(new Event("cart-updated"));
      setTimeout(() => setState("idle"), 2000);
    } catch {
      setState("error");
      setTimeout(() => setState("idle"), 2000);
    }
  }

  if (isOutOfStock) {
    return (
      <span className="block rounded bg-gray-100 py-1.5 text-center text-xs font-medium text-gray-400">
        Out of Stock
      </span>
    );
  }

  return (
    <button
      onClick={handleAdd}
      disabled={state === "loading"}
      className={`w-full rounded py-1.5 text-xs font-semibold transition ${
        state === "added"
          ? "bg-green-600 text-white"
          : state === "error"
            ? "bg-red-100 text-red-600"
            : "bg-blue-600 text-white hover:bg-blue-700"
      }`}
    >
      {state === "loading" && "Adding..."}
      {state === "added" && "Added!"}
      {state === "error" && "Error"}
      {state === "idle" && (
        <span className="flex items-center justify-center gap-1">
          <svg
            className="h-3.5 w-3.5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            strokeWidth="2"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 4v16m8-8H4"
            />
          </svg>
          Add to Cart
        </span>
      )}
    </button>
  );
}
