"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { useLazyQuery, useMutation } from "@apollo/client/react";
import Link from "next/link";
import Image from "next/image";
import { formatPrice } from "@/lib/formatPrice";
import {
  CUSTOMER_ALL_ORDER_ITEMS_QUERY,
  PRODUCTS_BY_SKU_QUERY,
} from "@/lib/graphql/queries/customer";
import {
  CREATE_EMPTY_CART,
  ADD_PRODUCTS_TO_CART,
} from "@/lib/graphql/mutations/cart";
import { getCartToken, setCartToken } from "@/lib/cart/cartToken";

interface OrderProduct {
  sku: string;
  name: string;
  timesOrdered: number;
  totalQtyOrdered: number;
  lastOrderDate: string;
  lastPrice: number;
  currency: string;
}

interface ProductData {
  sku: string;
  name: string;
  url_key: string;
  stock_status: string;
  small_image: { url: string; label: string };
  price_range: {
    minimum_price: {
      regular_price: { value: number; currency: string };
      final_price: { value: number; currency: string };
    };
  };
}

type SortKey = "lastOrdered" | "timesOrdered" | "name" | "sku";

export default function ReorderPage() {
  const [orderProducts, setOrderProducts] = useState<OrderProduct[]>([]);
  const [productData, setProductData] = useState<Map<string, ProductData>>(
    new Map(),
  );
  const [loading, setLoading] = useState(true);
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [addedSkus, setAddedSkus] = useState<Set<string>>(new Set());
  const [errorSkus, setErrorSkus] = useState<Record<string, string>>({});
  const [addingSkus, setAddingSkus] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<SortKey>("lastOrdered");

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [fetchOrders] = useLazyQuery<any>(CUSTOMER_ALL_ORDER_ITEMS_QUERY);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [fetchProducts] = useLazyQuery<any>(PRODUCTS_BY_SKU_QUERY);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [createEmptyCart] = useMutation<any>(CREATE_EMPTY_CART);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [addProducts] = useMutation<any>(ADD_PRODUCTS_TO_CART);

  useEffect(() => {
    async function loadAll() {
      try {
        // Fetch all order pages
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let allOrders: any[] = [];
        let currentPage = 1;
        let totalPages = 1;

        while (currentPage <= totalPages) {
          const { data } = await fetchOrders({
            variables: { pageSize: 50, currentPage },
          });
          const orders = data?.customer?.orders;
          if (orders) {
            allOrders = [...allOrders, ...orders.items];
            totalPages = orders.page_info?.total_pages || 1;
          }
          currentPage++;
        }

        // Aggregate unique products by SKU
        const skuMap = new Map<string, OrderProduct>();
        for (const order of allOrders) {
          for (const item of order.items || []) {
            const existing = skuMap.get(item.product_sku);
            const orderDate = order.order_date;
            if (existing) {
              existing.timesOrdered += 1;
              existing.totalQtyOrdered += item.quantity_ordered;
              if (orderDate > existing.lastOrderDate) {
                existing.lastOrderDate = orderDate;
                existing.lastPrice = item.product_sale_price?.value || 0;
                existing.currency =
                  item.product_sale_price?.currency || "USD";
              }
            } else {
              skuMap.set(item.product_sku, {
                sku: item.product_sku,
                name: item.product_name,
                timesOrdered: 1,
                totalQtyOrdered: item.quantity_ordered,
                lastOrderDate: orderDate,
                lastPrice: item.product_sale_price?.value || 0,
                currency: item.product_sale_price?.currency || "USD",
              });
            }
          }
        }

        const products = Array.from(skuMap.values());
        setOrderProducts(products);

        // Set default quantities to 1
        const defaultQty: Record<string, number> = {};
        products.forEach((p) => (defaultQty[p.sku] = 1));
        setQuantities(defaultQty);

        // Fetch current product data for all SKUs (images, price, stock)
        if (products.length > 0) {
          const skus = products.map((p) => p.sku);
          // Batch in groups of 100
          for (let i = 0; i < skus.length; i += 100) {
            const batch = skus.slice(i, i + 100);
            const { data: prodData } = await fetchProducts({
              variables: { skus: batch, pageSize: 100 },
            });
            if (prodData?.products?.items) {
              setProductData((prev) => {
                const next = new Map(prev);
                for (const p of prodData.products.items) {
                  next.set(p.sku, p);
                }
                return next;
              });
            }
          }
        }
      } catch (err) {
        console.error("Failed to load reorder data:", err);
      } finally {
        setLoading(false);
      }
    }
    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleAddToCart = useCallback(
    async (sku: string) => {
      setAddingSkus((prev) => new Set(prev).add(sku));
      setErrorSkus((prev) => {
        const next = { ...prev };
        delete next[sku];
        return next;
      });

      try {
        let cartId = getCartToken();
        if (!cartId) {
          const { data } = await createEmptyCart();
          cartId = data.createEmptyCart;
          setCartToken(cartId!);
        }

        const qty = quantities[sku] || 1;
        const { data } = await addProducts({
          variables: {
            cartId,
            cartItems: [{ sku, quantity: qty }],
          },
        });

        if (data?.addProductsToCart?.user_errors?.length) {
          setErrorSkus((prev) => ({
            ...prev,
            [sku]: data.addProductsToCart.user_errors[0].message,
          }));
        } else {
          setAddedSkus((prev) => new Set(prev).add(sku));
          setTimeout(() => {
            setAddedSkus((prev) => {
              const next = new Set(prev);
              next.delete(sku);
              return next;
            });
          }, 3000);
        }
      } catch (err) {
        setErrorSkus((prev) => ({
          ...prev,
          [sku]: err instanceof Error ? err.message : "Failed to add to cart",
        }));
      } finally {
        setAddingSkus((prev) => {
          const next = new Set(prev);
          next.delete(sku);
          return next;
        });
      }
    },
    [quantities, createEmptyCart, addProducts],
  );

  const filtered = useMemo(() => {
    let list = orderProducts;
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.sku.toLowerCase().includes(q),
      );
    }
    list = [...list].sort((a, b) => {
      switch (sortBy) {
        case "lastOrdered":
          return b.lastOrderDate.localeCompare(a.lastOrderDate);
        case "timesOrdered":
          return b.timesOrdered - a.timesOrdered;
        case "name":
          return a.name.localeCompare(b.name);
        case "sku":
          return a.sku.localeCompare(b.sku);
        default:
          return 0;
      }
    });
    return list;
  }, [orderProducts, search, sortBy]);

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-64 animate-pulse rounded bg-gray-200" />
        <div className="h-12 animate-pulse rounded-lg bg-gray-200" />
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-20 animate-pulse rounded-lg bg-gray-200" />
        ))}
      </div>
    );
  }

  if (orderProducts.length === 0) {
    return (
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="flex items-center gap-2 bg-gray-900 px-6 py-4">
          <span className="h-4 w-[3px] rounded-sm bg-red-600" />
          <h2 className="text-sm font-semibold uppercase tracking-[1px] text-white">
            My Products
          </h2>
        </div>
        <div className="px-6 py-16 text-center">
          <svg
            className="mx-auto mb-4 h-12 w-12 text-gray-300"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            strokeWidth="1.5"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
            />
          </svg>
          <p className="text-lg font-semibold text-gray-900">
            No products ordered yet
          </p>
          <p className="mt-1 text-sm text-gray-500">
            Products you order will appear here for quick reordering.
          </p>
          <Link
            href="/"
            className="mt-6 inline-block rounded-lg bg-red-600 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700"
          >
            Browse Products
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header card */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="flex items-center gap-2 bg-gray-900 px-6 py-4">
          <span className="h-4 w-[3px] rounded-sm bg-red-600" />
          <h2 className="text-sm font-semibold uppercase tracking-[1px] text-white">
            My Products
          </h2>
          <span className="ml-auto rounded-full bg-gray-700 px-2.5 py-0.5 text-xs font-medium text-gray-300">
            {orderProducts.length} product
            {orderProducts.length !== 1 ? "s" : ""}
          </span>
        </div>

        {/* Search & sort toolbar */}
        <div className="flex flex-col gap-3 border-b border-gray-100 px-6 py-4 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <svg
              className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              strokeWidth="2"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              placeholder="Search by product name or SKU..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg border border-gray-200 bg-gray-50 py-2.5 pl-10 pr-4 text-sm text-gray-900 outline-none transition focus:border-red-300 focus:bg-white focus:ring-2 focus:ring-red-100"
            />
          </div>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortKey)}
            className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-700 outline-none transition focus:border-red-300 focus:ring-2 focus:ring-red-100"
          >
            <option value="lastOrdered">Last Ordered</option>
            <option value="timesOrdered">Most Ordered</option>
            <option value="name">Name A–Z</option>
            <option value="sku">SKU A–Z</option>
          </select>
        </div>

        {/* Product list */}
        <div className="divide-y divide-gray-100">
          {filtered.length === 0 ? (
            <div className="px-6 py-12 text-center text-sm text-gray-500">
              No products match &ldquo;{search}&rdquo;
            </div>
          ) : (
            filtered.map((product) => {
              const pd = productData.get(product.sku);
              const isAdding = addingSkus.has(product.sku);
              const isAdded = addedSkus.has(product.sku);
              const error = errorSkus[product.sku];
              const isOutOfStock = pd?.stock_status === "OUT_OF_STOCK";
              const currentPrice =
                pd?.price_range?.minimum_price?.final_price?.value;
              const imageUrl = pd?.small_image?.url;
              const urlKey = pd?.url_key;
              const qty = quantities[product.sku] || 1;

              return (
                <div
                  key={product.sku}
                  className="flex flex-col gap-4 px-6 py-4 sm:flex-row sm:items-center"
                >
                  {/* Image + info */}
                  <div className="flex min-w-0 flex-1 items-start gap-4 sm:items-center">
                    <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg border border-gray-100 bg-gray-50">
                      {imageUrl ? (
                        <Image
                          src={imageUrl}
                          alt={product.name}
                          fill
                          className="object-contain p-1"
                          sizes="64px"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-gray-300">
                          <svg
                            className="h-6 w-6"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            strokeWidth="1.5"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                            />
                          </svg>
                        </div>
                      )}
                    </div>

                    {/* Product info */}
                    <div className="min-w-0 flex-1">
                      {urlKey ? (
                        <Link
                          href={`/product/${urlKey}`}
                          className="block truncate text-sm font-semibold text-gray-900 hover:text-red-600"
                          title={pd?.name || product.name}
                        >
                          {pd?.name || product.name}
                        </Link>
                      ) : (
                        <span
                          className="block truncate text-sm font-semibold text-gray-900"
                          title={product.name}
                        >
                          {product.name}
                        </span>
                      )}
                      <p className="mt-0.5 font-mono text-xs text-gray-400">
                        {product.sku}
                      </p>
                      <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-500">
                        <span>
                          Ordered{" "}
                          <strong className="text-gray-700">
                            {product.timesOrdered}x
                          </strong>
                        </span>
                        <span className="text-gray-300">|</span>
                        <span>
                          Last{" "}
                          {new Date(product.lastOrderDate).toLocaleDateString(
                            "en-US",
                            {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            },
                          )}
                        </span>
                        {isOutOfStock && (
                          <>
                            <span className="text-gray-300">|</span>
                            <span className="font-medium text-red-500">
                              Out of Stock
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Price + qty + add to cart */}
                  <div className="flex items-center gap-3 sm:ml-auto sm:shrink-0">
                    {/* Current price */}
                    <div className="w-20 text-right">
                      {currentPrice != null ? (
                        <span className="text-sm font-semibold text-gray-900">
                          ${formatPrice(currentPrice)}
                        </span>
                      ) : (
                        <span className="text-xs text-gray-400">
                          ${formatPrice(product.lastPrice)}
                        </span>
                      )}
                    </div>

                    {/* Qty */}
                    <div className="flex items-center overflow-hidden rounded-lg border border-gray-200 bg-white">
                      <button
                        onClick={() =>
                          setQuantities((prev) => ({
                            ...prev,
                            [product.sku]: Math.max(1, qty - 1),
                          }))
                        }
                        className="px-2.5 py-2 text-sm text-gray-500 transition hover:bg-gray-50 hover:text-gray-900"
                      >
                        -
                      </button>
                      <input
                        type="number"
                        min={1}
                        value={qty}
                        onChange={(e) =>
                          setQuantities((prev) => ({
                            ...prev,
                            [product.sku]: Math.max(
                              1,
                              parseInt(e.target.value, 10) || 1,
                            ),
                          }))
                        }
                        className="w-10 border-x border-gray-100 bg-transparent text-center font-mono text-xs font-medium text-gray-900 outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                      />
                      <button
                        onClick={() =>
                          setQuantities((prev) => ({
                            ...prev,
                            [product.sku]: qty + 1,
                          }))
                        }
                        className="px-2.5 py-2 text-sm text-gray-500 transition hover:bg-gray-50 hover:text-gray-900"
                      >
                        +
                      </button>
                    </div>

                    {/* Add to cart */}
                    <button
                      onClick={() => handleAddToCart(product.sku)}
                      disabled={isAdding || isOutOfStock}
                      className={`flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-semibold transition ${
                        isAdded
                          ? "bg-green-600 text-white"
                          : isOutOfStock
                            ? "cursor-not-allowed bg-gray-100 text-gray-400"
                            : "bg-red-600 text-white hover:bg-red-700 active:scale-[0.98]"
                      }`}
                    >
                      {isAdding ? (
                        <svg
                          className="h-4 w-4 animate-spin"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          />
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                          />
                        </svg>
                      ) : isAdded ? (
                        <>
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
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                          Added
                        </>
                      ) : (
                        <>
                          <svg
                            className="h-4 w-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            strokeWidth="2"
                          >
                            <circle cx="9" cy="21" r="1" />
                            <circle cx="20" cy="21" r="1" />
                            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
                          </svg>
                          <span className="hidden sm:inline">Add</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Per-row error */}
                  {error && (
                    <p className="w-full text-xs font-medium text-red-600 sm:pl-20">
                      {error}
                    </p>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Tip */}
      <div className="rounded-lg border border-blue-100 bg-blue-50 px-5 py-3">
        <p className="text-xs text-blue-700">
          <strong>Tip:</strong> This list automatically updates as you place
          orders. Products stay here even after adding to cart so you can
          always reorder.
        </p>
      </div>
    </div>
  );
}
