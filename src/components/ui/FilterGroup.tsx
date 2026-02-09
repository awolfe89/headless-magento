"use client";

import Link from "next/link";
import { useState } from "react";

interface FilterGroupProps {
  label: string;
  attrCode: string;
  options: { label: string; value: string; count: number }[];
  activeValues: string[];
  basePath: string;
  currentParams: Record<string, string>;
}

function buildFilterHref(
  basePath: string,
  currentParams: Record<string, string>,
  attrCode: string,
  value: string,
): string {
  const params = new URLSearchParams(currentParams);
  params.delete("page");

  const key = `f_${attrCode}`;
  const current = params.get(key);
  if (current) {
    const values = current.split(",");
    if (values.includes(value)) {
      const next = values.filter((v) => v !== value);
      if (next.length) params.set(key, next.join(","));
      else params.delete(key);
    } else {
      params.set(key, [...values, value].join(","));
    }
  } else {
    params.set(key, value);
  }

  const qs = params.toString();
  return qs ? `${basePath}?${qs}` : basePath;
}

const INITIAL_VISIBLE = 4;

export function FilterGroup({
  label,
  attrCode,
  options,
  activeValues,
  basePath,
  currentParams,
}: FilterGroupProps) {
  const [expanded, setExpanded] = useState(false);
  const sorted = [...options].sort((a, b) => b.count - a.count);
  const visible = expanded ? sorted : sorted.slice(0, INITIAL_VISIBLE);
  const hiddenCount = sorted.length - INITIAL_VISIBLE;

  return (
    <div>
      <h3 className="mb-2 text-xs font-bold uppercase tracking-wider text-gray-700">
        {label}
      </h3>
      <div className="space-y-0.5">
        {visible.map((opt) => {
          const isActive = activeValues.includes(opt.value);
          return (
            <Link
              key={opt.value}
              href={buildFilterHref(basePath, currentParams, attrCode, opt.value)}
              className={`flex items-center gap-2 rounded px-2 py-1 text-xs transition ${
                isActive
                  ? "bg-blue-50 font-semibold text-blue-700"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              <span
                className={`flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-sm border ${
                  isActive
                    ? "border-blue-600 bg-blue-600"
                    : "border-gray-300 bg-white"
                }`}
              >
                {isActive && (
                  <svg
                    className="h-2.5 w-2.5 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    strokeWidth="3"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                )}
              </span>
              <span className="truncate">{opt.label}</span>
              <span className="ml-auto shrink-0 text-[10px] text-gray-400">
                {opt.count}
              </span>
            </Link>
          );
        })}
      </div>
      {hiddenCount > 0 && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="mt-1 px-2 text-[11px] font-medium text-blue-600 hover:text-blue-700"
        >
          {expanded ? "Show less" : `Show ${hiddenCount} more`}
        </button>
      )}
    </div>
  );
}
