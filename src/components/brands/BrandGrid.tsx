"use client";

import { useState, useMemo } from "react";
import Link from "next/link";

interface Brand {
  uid: string;
  name: string;
  url_path: string;
  url_key: string;
  image: string | null;
  product_count: number;
}

interface BrandGridProps {
  brands: Brand[];
}

export function BrandGrid({ brands }: BrandGridProps) {
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    if (!search.trim()) return brands;
    const q = search.toLowerCase();
    return brands.filter((b) => b.name.toLowerCase().includes(q));
  }, [brands, search]);

  // Group by first letter
  const grouped = useMemo(() => {
    const map = new Map<string, Brand[]>();
    for (const brand of filtered) {
      const letter = brand.name[0]?.toUpperCase() || "#";
      if (!map.has(letter)) map.set(letter, []);
      map.get(letter)!.push(brand);
    }
    return Array.from(map.entries()).sort(([a], [b]) => a.localeCompare(b));
  }, [filtered]);

  // All unique first letters for the alphabet nav
  const allLetters = useMemo(() => {
    const letters = new Set<string>();
    for (const brand of brands) {
      letters.add(brand.name[0]?.toUpperCase() || "#");
    }
    return Array.from(letters).sort();
  }, [brands]);

  return (
    <div>
      {/* Search bar */}
      <div className="relative mb-8">
        <svg
          className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          strokeWidth="2"
        >
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.35-4.35" />
        </svg>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search brands..."
          className="w-full rounded-xl border border-gray-200 bg-white py-3.5 pl-12 pr-4 text-base shadow-sm outline-none transition placeholder:text-gray-400 focus:border-red-300 focus:ring-2 focus:ring-red-100"
        />
        {search && (
          <button
            onClick={() => setSearch("")}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 transition hover:text-gray-600"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Quick result count */}
      {search && (
        <p className="mb-4 text-sm text-gray-500">
          {filtered.length} brand{filtered.length !== 1 ? "s" : ""} found
        </p>
      )}

      {/* Alphabet quick-nav */}
      <div className="mb-8 flex flex-wrap gap-1.5">
        {allLetters.map((letter) => {
          const hasResults = grouped.some(([l]) => l === letter);
          return (
            <a
              key={letter}
              href={`#letter-${letter}`}
              className={`inline-flex h-9 w-9 items-center justify-center rounded-lg text-sm font-semibold transition ${
                hasResults
                  ? "bg-gray-900 text-white hover:bg-red-600"
                  : "bg-gray-100 text-gray-300 pointer-events-none"
              }`}
            >
              {letter}
            </a>
          );
        })}
      </div>

      {/* Brand groups */}
      {grouped.length === 0 ? (
        <div className="rounded-xl border border-gray-200 bg-white p-12 text-center">
          <p className="text-lg font-medium text-gray-400">
            No brands match &ldquo;{search}&rdquo;
          </p>
          <button
            onClick={() => setSearch("")}
            className="mt-3 text-sm font-medium text-red-600 hover:underline"
          >
            Clear search
          </button>
        </div>
      ) : (
        <div className="space-y-8">
          {grouped.map(([letter, items]) => (
            <div key={letter} id={`letter-${letter}`} className="scroll-mt-24">
              {/* Letter heading */}
              <div className="mb-4 flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-900 text-lg font-bold text-white">
                  {letter}
                </span>
                <div className="h-px flex-1 bg-gray-200" />
                <span className="text-xs font-medium text-gray-400">
                  {items.length} brand{items.length !== 1 ? "s" : ""}
                </span>
              </div>

              {/* Brand cards */}
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                {items.map((brand) => (
                  <Link
                    key={brand.uid}
                    href={`/category/${brand.url_path}`}
                    className="group flex flex-col items-center gap-3 rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition hover:border-red-200 hover:shadow-md"
                  >
                    {/* Brand logo placeholder or image */}
                    {brand.image ? (
                      <img
                        src={brand.image}
                        alt={brand.name}
                        className="h-12 w-auto object-contain"
                      />
                    ) : (
                      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gray-100 text-lg font-bold text-gray-400 transition group-hover:bg-red-50 group-hover:text-red-500">
                        {brand.name[0]}
                      </div>
                    )}
                    <div className="text-center">
                      <p className="text-sm font-semibold text-gray-900 group-hover:text-red-600">
                        {brand.name}
                      </p>
                      {brand.product_count > 0 && (
                        <p className="mt-0.5 text-xs text-gray-400">
                          {brand.product_count} product{brand.product_count !== 1 ? "s" : ""}
                        </p>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
