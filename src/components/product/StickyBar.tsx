"use client";

import { useEffect, useState, useRef } from "react";
import { QuickAddToCart } from "@/components/cart/QuickAddToCart";
import { formatPrice } from "@/lib/formatPrice";

interface StickyBarProps {
  name: string;
  sku: string;
  price: number;
  stockStatus: string;
}

export function StickyBar({ name, sku, price, stockStatus }: StickyBarProps) {
  const [visible, setVisible] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const sentinel = document.getElementById("sticky-sentinel");
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      ([entry]) => setVisible(!entry.isIntersecting),
      { threshold: 0 },
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, []);

  return (
    <>
      <div ref={sentinelRef} />
      <div
        className={`fixed inset-x-0 bottom-0 z-50 border-t border-gray-200 bg-white shadow-[0_-2px_12px_rgba(0,0,0,0.08)] transition-transform duration-300 ${
          visible ? "translate-y-0" : "translate-y-full"
        }`}
      >
        <div className="mx-auto flex max-w-7xl items-center gap-5 px-4 py-2.5">
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-gray-900">
              {name}
            </p>
          </div>
          <span className="shrink-0 text-xl font-bold text-gray-900">
            ${formatPrice(price)}
          </span>
          <div className="w-32 shrink-0">
            <QuickAddToCart sku={sku} stockStatus={stockStatus} />
          </div>
        </div>
      </div>
    </>
  );
}
