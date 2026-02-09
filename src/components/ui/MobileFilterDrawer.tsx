"use client";

import { useState, useEffect } from "react";
import { FilterGroup } from "./FilterGroup";
import { PriceRangeFilter } from "./PriceRangeFilter";

interface Aggregation {
  attribute_code: string;
  label: string;
  options: { label: string; value: string; count: number }[];
}

interface MobileFilterDrawerProps {
  aggregations: Aggregation[];
  activeFilters: Record<string, string[]>;
  basePath: string;
  currentParams: Record<string, string>;
  activeFilterCount: number;
  priceRange: { from: string; to: string } | null;
}

export function MobileFilterDrawer({
  aggregations,
  activeFilters,
  basePath,
  currentParams,
  activeFilterCount,
  priceRange,
}: MobileFilterDrawerProps) {
  const [open, setOpen] = useState(false);

  // Lock body scroll when open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      {/* Trigger button */}
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition hover:border-gray-400 lg:hidden"
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
            d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
          />
        </svg>
        Filters
        {activeFilterCount > 0 && (
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-xs font-bold text-white">
            {activeFilterCount}
          </span>
        )}
      </button>

      {/* Overlay */}
      {open && (
        <div
          className="fixed inset-0 z-[100] bg-black/50 transition-opacity lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Drawer panel */}
      <div
        className={`fixed inset-y-0 left-0 z-[101] w-80 max-w-[85vw] transform bg-white shadow-2xl transition-transform duration-300 lg:hidden ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 bg-gray-900 px-5 py-4">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-white">
            Filters
          </h2>
          <button
            onClick={() => setOpen(false)}
            aria-label="Close filters"
            className="rounded p-1 text-gray-400 transition hover:bg-gray-800 hover:text-white"
          >
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
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Filter content */}
        <div className="h-[calc(100%-57px)] overflow-y-auto px-5 py-4">
          <div className="space-y-6">
            {/* Price range */}
            <PriceRangeFilter
              basePath={basePath}
              currentParams={currentParams}
              activeRange={priceRange}
            />

            {/* Attribute filters */}
            {aggregations.map((agg) => (
              <FilterGroup
                key={agg.attribute_code}
                label={
                  agg.attribute_code === "manufacturer" ? "Brand" : agg.label
                }
                attrCode={agg.attribute_code}
                options={agg.options}
                activeValues={activeFilters[agg.attribute_code] || []}
                basePath={basePath}
                currentParams={currentParams}
              />
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
