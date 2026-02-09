"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
 
import { useMutation } from "@apollo/client/react";
import {
  CREATE_EMPTY_CART,
  ADD_PRODUCTS_TO_CART,
} from "@/lib/graphql/mutations/cart";
import { getCartToken, setCartToken } from "@/lib/cart/cartToken";
import Link from "next/link";

interface OrderLine {
  sku: string;
  qty: number;
}

export default function QuickOrderPage() {
  const router = useRouter();
  const [lines, setLines] = useState<OrderLine[]>([
    { sku: "", qty: 1 },
    { sku: "", qty: 1 },
    { sku: "", qty: 1 },
    { sku: "", qty: 1 },
    { sku: "", qty: 1 },
  ]);
  const [pasteMode, setPasteMode] = useState(false);
  const [pasteText, setPasteText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [successCount, setSuccessCount] = useState(0);
  const [userErrors, setUserErrors] = useState<string[]>([]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [createCart] = useMutation<any>(CREATE_EMPTY_CART);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [addProducts, { loading }] = useMutation<any>(ADD_PRODUCTS_TO_CART);

  function updateLine(index: number, field: "sku" | "qty", value: string) {
    setLines((prev) =>
      prev.map((line, i) =>
        i === index
          ? {
              ...line,
              [field]: field === "qty" ? Math.max(1, parseInt(value) || 1) : value.trim(),
            }
          : line,
      ),
    );
  }

  function addRow() {
    setLines((prev) => [...prev, { sku: "", qty: 1 }]);
  }

  function removeRow(index: number) {
    setLines((prev) => prev.filter((_, i) => i !== index));
  }

  const MAX_LINES = 100;

  function parsePasteText() {
    const parsed: OrderLine[] = pasteText
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.length > 0)
      .map((line) => {
        // Support: "SKU,QTY" or "SKU QTY" or "SKU\tQTY" or just "SKU"
        const parts = line.split(/[\t,\s]+/);
        const sku = parts[0]?.trim() || "";
        const qty = parseInt(parts[1]?.trim() || "1", 10) || 1;
        return { sku, qty };
      })
      .filter((item) => item.sku.length > 0 && item.sku.length <= 64);

    if (parsed.length === 0) {
      setError("No valid SKUs found. Enter one SKU per line.");
      return;
    }

    if (parsed.length > MAX_LINES) {
      setError(
        `Too many items (${parsed.length}). Maximum is ${MAX_LINES} SKUs per order. Please split into multiple orders.`,
      );
      return;
    }

    setLines(parsed);
    setPasteMode(false);
    setError(null);
  }

  async function handleSubmit() {
    setError(null);
    setSuccessCount(0);
    setUserErrors([]);

    const validLines = lines.filter((l) => l.sku.length > 0 && l.sku.length <= 64);
    if (validLines.length === 0) {
      setError("Please enter at least one valid SKU.");
      return;
    }

    if (validLines.length > MAX_LINES) {
      setError(`Maximum ${MAX_LINES} items per order.`);
      return;
    }

    try {
      let cartId = getCartToken();
      if (!cartId) {
        const { data: cartData } = await createCart();
        cartId = cartData.createEmptyCart;
        setCartToken(cartId!);
      }

      const cartItems = validLines.map((l) => ({
        sku: l.sku,
        quantity: l.qty,
      }));

      const { data } = await addProducts({
        variables: { cartId, cartItems },
      });

      const errors = data?.addProductsToCart?.user_errors || [];
      if (errors.length > 0) {
        setUserErrors(errors.map((e: { message: string }) => e.message));
        // Some items may have been added successfully
        const addedCount = validLines.length - errors.length;
        if (addedCount > 0) {
          setSuccessCount(addedCount);
        }
      } else {
        setSuccessCount(validLines.length);
        // Redirect to cart after short delay
        setTimeout(() => router.push("/cart"), 1500);
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to add items to cart.",
      );
    }
  }

  return (
    <div className="bg-gray-50 pb-16">
      {/* Hero */}
      <div className="bg-gradient-to-r from-gray-900 to-gray-800">
        <div className="mx-auto max-w-7xl px-4 py-6">
          <nav className="mb-3 text-sm text-gray-400">
            <Link href="/" className="transition hover:text-white">
              Home
            </Link>
            <span className="mx-2 text-gray-600">/</span>
            <span className="text-gray-200">Quick Order</span>
          </nav>
          <h1 className="text-2xl font-bold text-white md:text-3xl">
            Quick Order
          </h1>
          <p className="mt-1 text-sm text-gray-400">
            Add multiple products to your cart by SKU
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-4 py-8">
        {/* Mode toggle */}
        <div className="mb-6 flex gap-2">
          <button
            onClick={() => setPasteMode(false)}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
              !pasteMode
                ? "bg-gray-900 text-white"
                : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
            }`}
          >
            Line by Line
          </button>
          <button
            onClick={() => setPasteMode(true)}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
              pasteMode
                ? "bg-gray-900 text-white"
                : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
            }`}
          >
            Paste SKUs
          </button>
        </div>

        {/* Success */}
        {successCount > 0 && (
          <div className="mb-6 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
            {successCount} item{successCount !== 1 ? "s" : ""} added to cart
            successfully!
          </div>
        )}

        {/* User errors (per-SKU) */}
        {userErrors.length > 0 && (
          <div className="mb-6 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
            <p className="font-medium">Some items could not be added:</p>
            <ul className="mt-1 list-inside list-disc">
              {userErrors.map((msg, i) => (
                <li key={i}>{msg}</li>
              ))}
            </ul>
          </div>
        )}

        {/* General error */}
        {error && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {pasteMode ? (
          /* Paste mode */
          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
            <div className="flex items-center gap-2 bg-gray-900 px-5 py-3">
              <span className="h-3.5 w-[3px] rounded-sm bg-red-600" />
              <h2 className="text-xs font-semibold uppercase tracking-[1px] text-gray-400">
                Paste SKUs
              </h2>
            </div>
            <div className="p-6">
              <p className="mb-3 text-sm text-gray-500">
                Paste one SKU per line. Optionally include quantity separated by
                a comma, tab, or space.
              </p>
              <p className="mb-4 text-xs text-gray-400">
                Example: <code className="rounded bg-gray-100 px-1.5 py-0.5">ABC123, 5</code> or{" "}
                <code className="rounded bg-gray-100 px-1.5 py-0.5">ABC123</code> (defaults
                to qty 1)
              </p>
              <textarea
                value={pasteText}
                onChange={(e) => setPasteText(e.target.value)}
                rows={10}
                placeholder={"SKU001, 2\nSKU002, 5\nSKU003"}
                className="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 font-mono text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-red-300 focus:bg-white focus:ring-2 focus:ring-red-100"
              />
              <button
                onClick={parsePasteText}
                className="mt-4 rounded-lg bg-gray-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-gray-800"
              >
                Parse & Review
              </button>
            </div>
          </div>
        ) : (
          /* Line-by-line mode */
          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
            <div className="flex items-center gap-2 bg-gray-900 px-5 py-3">
              <span className="h-3.5 w-[3px] rounded-sm bg-red-600" />
              <h2 className="text-xs font-semibold uppercase tracking-[1px] text-gray-400">
                Enter SKUs
              </h2>
            </div>

            {/* Header */}
            <div className="grid grid-cols-[1fr_100px_40px] gap-3 border-b border-gray-100 bg-gray-50 px-5 py-2.5 text-xs font-semibold uppercase tracking-wider text-gray-500">
              <span>SKU / Part Number</span>
              <span className="text-center">Qty</span>
              <span />
            </div>

            {/* Rows */}
            <div className="divide-y divide-gray-100">
              {lines.map((line, i) => (
                <div
                  key={i}
                  className="grid grid-cols-[1fr_100px_40px] items-center gap-3 px-5 py-2.5"
                >
                  <input
                    type="text"
                    value={line.sku}
                    onChange={(e) => updateLine(i, "sku", e.target.value)}
                    placeholder="Enter SKU..."
                    className="w-full rounded-md border border-gray-200 bg-white px-3 py-2 font-mono text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-red-300 focus:ring-2 focus:ring-red-100"
                  />
                  <input
                    type="number"
                    min="1"
                    value={line.qty}
                    onChange={(e) => updateLine(i, "qty", e.target.value)}
                    className="w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-center text-sm text-gray-900 outline-none transition focus:border-red-300 focus:ring-2 focus:ring-red-100"
                  />
                  <button
                    onClick={() => removeRow(i)}
                    className="flex items-center justify-center text-gray-400 transition hover:text-red-500"
                    aria-label="Remove row"
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
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>
              ))}
            </div>

            {/* Add row */}
            <div className="border-t border-gray-100 px-5 py-3">
              <button
                onClick={addRow}
                className="flex items-center gap-1.5 text-sm font-medium text-red-600 transition hover:text-red-700"
              >
                <svg
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  strokeWidth="2"
                >
                  <path strokeLinecap="round" d="M12 5v14m-7-7h14" />
                </svg>
                Add Another Row
              </button>
            </div>
          </div>
        )}

        {/* Submit */}
        {!pasteMode && (
          <div className="mt-6 flex items-center gap-4">
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="rounded-lg bg-red-600 px-8 py-3 text-sm font-semibold text-white transition hover:bg-red-700 disabled:opacity-50"
            >
              {loading ? "Adding to Cart..." : "Add All to Cart"}
            </button>
            <span className="text-sm text-gray-400">
              {lines.filter((l) => l.sku.length > 0).length} item
              {lines.filter((l) => l.sku.length > 0).length !== 1 ? "s" : ""}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
