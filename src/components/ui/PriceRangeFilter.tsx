"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface PriceRangeFilterProps {
  basePath: string;
  currentParams: Record<string, string>;
  activeRange: { from: string; to: string } | null;
}

export function PriceRangeFilter({
  basePath,
  currentParams,
  activeRange,
}: PriceRangeFilterProps) {
  const [min, setMin] = useState(activeRange?.from || "");
  const [max, setMax] = useState(activeRange?.to || "");
  const router = useRouter();

  function handleApply() {
    const params = new URLSearchParams(currentParams);
    params.delete("page");

    if (min || max) {
      const from = min || "0";
      const to = max || "999999";
      params.set("f_price", `${from}-${to}`);
    } else {
      params.delete("f_price");
    }

    const qs = params.toString();
    router.push(qs ? `${basePath}?${qs}` : basePath);
  }

  function handleClear() {
    setMin("");
    setMax("");
    const params = new URLSearchParams(currentParams);
    params.delete("page");
    params.delete("f_price");
    const qs = params.toString();
    router.push(qs ? `${basePath}?${qs}` : basePath);
  }

  return (
    <div>
      <h3 className="mb-2 text-xs font-bold uppercase tracking-wider text-gray-700">
        Price
      </h3>
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs text-gray-400">
            $
          </span>
          <input
            type="number"
            min="0"
            placeholder="Min"
            value={min}
            onChange={(e) => setMin(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleApply()}
            className="w-full rounded border border-gray-200 bg-white py-1.5 pl-5 pr-2 text-xs text-gray-900 outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-200 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
          />
        </div>
        <span className="text-xs text-gray-400">–</span>
        <div className="relative flex-1">
          <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs text-gray-400">
            $
          </span>
          <input
            type="number"
            min="0"
            placeholder="Max"
            value={max}
            onChange={(e) => setMax(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleApply()}
            className="w-full rounded border border-gray-200 bg-white py-1.5 pl-5 pr-2 text-xs text-gray-900 outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-200 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
          />
        </div>
      </div>
      <div className="mt-2 flex gap-2">
        <button
          onClick={handleApply}
          className="flex-1 rounded bg-gray-900 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-gray-700"
        >
          Apply
        </button>
        {activeRange && (
          <button
            onClick={handleClear}
            className="rounded border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 transition hover:bg-gray-50"
          >
            Clear
          </button>
        )}
      </div>
    </div>
  );
}
