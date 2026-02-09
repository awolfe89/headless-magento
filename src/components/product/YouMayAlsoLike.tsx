"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { getRecentlyViewed } from "@/lib/recentlyViewed";
import { ProductCard } from "./ProductCard";

interface Product {
  uid: string;
  name: string;
  sku: string;
  url_key: string;
  stock_status: string;
  manufacturer?: number | null;
  small_image: { url: string; label: string | null };
  price_range?: {
    minimum_price: {
      final_price: { value: number; currency: string };
      regular_price: { value: number; currency: string };
      discount: { percent_off: number } | null;
    };
  };
}

interface Props {
  relatedProducts: Product[];
  categoryProducts?: Product[];
  currentUrlKey: string;
  brandLabel?: string | null;
}

export function YouMayAlsoLike({
  relatedProducts,
  categoryProducts = [],
  currentUrlKey,
}: Props) {
  const [mergedProducts, setMergedProducts] = useState<Product[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  useEffect(() => {
    const id = requestAnimationFrame(() => {
      const seen = new Set<string>();
      seen.add(currentUrlKey);

      const recentKeys = new Set(
        getRecentlyViewed()
          .slice(0, 5)
          .map((p) => p.url_key),
      );

      const result: Product[] = [];

      for (const p of relatedProducts) {
        if (!seen.has(p.url_key) && p.price_range?.minimum_price) {
          seen.add(p.url_key);
          result.push(p);
        }
      }

      for (const p of categoryProducts) {
        if (result.length >= 8) break;
        if (!seen.has(p.url_key) && !recentKeys.has(p.url_key) && p.price_range?.minimum_price) {
          seen.add(p.url_key);
          result.push(p);
        }
      }

      if (result.length < 4) {
        for (const p of categoryProducts) {
          if (result.length >= 8) break;
          if (!seen.has(p.url_key) && p.price_range?.minimum_price) {
            seen.add(p.url_key);
            result.push(p);
          }
        }
      }

      setMergedProducts(result.slice(0, 8));
    });
    return () => cancelAnimationFrame(id);
  }, [relatedProducts, categoryProducts, currentUrlKey]);

  const updateScrollState = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 4);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  }, []);

  useEffect(() => {
    updateScrollState();
    const el = scrollRef.current;
    if (!el) return;
    el.addEventListener("scroll", updateScrollState, { passive: true });
    window.addEventListener("resize", updateScrollState);
    return () => {
      el.removeEventListener("scroll", updateScrollState);
      window.removeEventListener("resize", updateScrollState);
    };
  }, [mergedProducts, updateScrollState]);

  function scroll(direction: "left" | "right") {
    const el = scrollRef.current;
    if (!el) return;
    const cardWidth = el.querySelector("div")?.offsetWidth || 250;
    el.scrollBy({
      left: direction === "left" ? -cardWidth * 2 : cardWidth * 2,
      behavior: "smooth",
    });
  }

  if (mergedProducts.length === 0) return null;

  return (
    <div>
      <div className="mb-6 flex items-center gap-3">
        <h2 className="shrink-0 text-xl font-bold text-gray-900">
          You May Also Like
        </h2>
        <div className="h-px flex-1 bg-gray-200" />
        {/* Nav arrows */}
        <div className="flex gap-1.5">
          <button
            onClick={() => scroll("left")}
            disabled={!canScrollLeft}
            className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-500 transition hover:border-gray-400 hover:text-gray-900 disabled:opacity-30 disabled:hover:border-gray-200 disabled:hover:text-gray-500"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            onClick={() => scroll("right")}
            disabled={!canScrollRight}
            className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-500 transition hover:border-gray-400 hover:text-gray-900 disabled:opacity-30 disabled:hover:border-gray-200 disabled:hover:text-gray-500"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
      <div
        ref={scrollRef}
        className="scrollbar-hide flex gap-4 overflow-x-auto scroll-smooth"
      >
        {mergedProducts.map((product) => (
          <div
            key={product.uid}
            className="w-[calc(50%-8px)] shrink-0 md:w-[calc(25%-12px)]"
          >
            <ProductCard product={product} />
          </div>
        ))}
      </div>
    </div>
  );
}
