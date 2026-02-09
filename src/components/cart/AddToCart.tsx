"use client";

import { useMutation } from "@apollo/client/react";
import {
  CREATE_EMPTY_CART,
  ADD_PRODUCTS_TO_CART,
} from "@/lib/graphql/mutations/cart";
import { getCartToken, setCartToken } from "@/lib/cart/cartToken";
import { useState } from "react";
import { useToast } from "@/components/ui/Toast";

interface AddToCartProps {
  product: {
    sku: string;
    stock_status: string;
  };
  /** Selected option UIDs for configurable products */
  selectedOptions?: string[];
  /** Whether all required options have been selected */
  optionsComplete?: boolean;
}

export function AddToCart({
  product,
  selectedOptions,
  optionsComplete = true,
}: AddToCartProps) {
  const MAX_QTY = 10000;
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { addToast } = useToast();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [createEmptyCart] = useMutation<any>(CREATE_EMPTY_CART);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [addProducts, { loading }] = useMutation<any>(ADD_PRODUCTS_TO_CART);

  async function handleAddToCart() {
    setError(null);
    setAdded(false);

    try {
      let cartId = getCartToken();

      if (!cartId) {
        const { data } = await createEmptyCart();
        cartId = data.createEmptyCart;
        setCartToken(cartId!);
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const cartItem: any = { sku: product.sku, quantity };
      if (selectedOptions && selectedOptions.length > 0) {
        cartItem.selected_options = selectedOptions;
      }

      const { data } = await addProducts({
        variables: {
          cartId,
          cartItems: [cartItem],
        },
      });

      if (data?.addProductsToCart?.user_errors?.length) {
        setError(data.addProductsToCart.user_errors[0].message);
        return;
      }

      setAdded(true);
      addToast(`Added ${quantity} item${quantity > 1 ? "s" : ""} to cart`, "success");
      window.dispatchEvent(new Event("cart-updated"));
      setTimeout(() => setAdded(false), 3000);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to add to cart";
      setError(msg);
      addToast(msg, "error");
    }
  }

  const isOutOfStock = product.stock_status === "OUT_OF_STOCK";
  const needsOptions = selectedOptions !== undefined && !optionsComplete;

  return (
    <div>
      {/* Sentinel for sticky bar */}
      <div id="sticky-sentinel" />

      <div className="flex gap-3">
        {/* Qty wrapper */}
        <div className="flex items-center overflow-hidden rounded-lg border border-gray-200 bg-white">
          <button
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            aria-label="Decrease quantity"
            className="px-3.5 py-3 text-lg text-gray-500 transition hover:bg-gray-50 hover:text-gray-900"
          >
            -
          </button>
          <input
            type="number"
            min={1}
            max={MAX_QTY}
            value={quantity}
            onChange={(e) =>
              setQuantity(Math.min(MAX_QTY, Math.max(1, parseInt(e.target.value, 10) || 1)))
            }
            className="w-12 border-x border-gray-100 bg-transparent text-center font-mono text-sm font-medium text-gray-900 outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
          />
          <button
            onClick={() => setQuantity((q) => Math.min(MAX_QTY, q + 1))}
            aria-label="Increase quantity"
            className="px-3.5 py-3 text-lg text-gray-500 transition hover:bg-gray-50 hover:text-gray-900"
          >
            +
          </button>
        </div>

        {/* Add to Cart button */}
        <button
          onClick={handleAddToCart}
          disabled={loading || isOutOfStock || needsOptions}
          className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-8 py-3.5 text-base font-semibold transition ${
            added
              ? "bg-green-600 text-white"
              : isOutOfStock
                ? "cursor-not-allowed bg-gray-200 text-gray-500"
                : needsOptions
                  ? "cursor-not-allowed bg-gray-200 text-gray-500"
                  : "bg-red-600 text-white shadow-sm hover:bg-red-700 hover:shadow-md active:scale-[0.98]"
          }`}
        >
          {loading ? (
            "Adding..."
          ) : added ? (
            <>
              <svg
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                strokeWidth="2"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M5 13l4 4L19 7"
                />
              </svg>
              Added to Cart!
            </>
          ) : isOutOfStock ? (
            "Out of Stock"
          ) : needsOptions ? (
            "Select Options"
          ) : (
            <>
              <svg
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                strokeWidth="2"
              >
                <circle cx="9" cy="21" r="1" />
                <circle cx="20" cy="21" r="1" />
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
              </svg>
              Add to Cart
            </>
          )}
        </button>
      </div>

      {error && (
        <p className="mt-2 text-sm font-medium text-red-600">{error}</p>
      )}
    </div>
  );
}
