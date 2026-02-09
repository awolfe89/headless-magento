"use client";

import Link from "next/link";
import { useState } from "react";
import type { CategoryItem } from "./Header";

interface NavigationProps {
  categories: CategoryItem[];
}

const STATIC_NAV_ITEMS = [
  { label: "Brands", href: "/brands" },
  { label: "Quick Order", href: "/quick-order" },
  { label: "Managed Inventory", href: "/managed-inventory-program" },
  { label: "About Us", href: "/about" },
  { label: "Closeouts", href: "/closeouts" },
  { label: "Equipment", href: "/equipment" },
];

// Categories to hide from the navigation (handled by dedicated pages or irrelevant)
const HIDDEN_CATEGORIES = new Set(["shop-by-brand", "hobby"]);

export function Navigation({ categories }: NavigationProps) {
  const filteredCategories = categories.filter(
    (cat) => !HIDDEN_CATEGORIES.has(cat.url_key || ""),
  );
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileCategoriesOpen, setMobileCategoriesOpen] = useState(false);

  return (
    <nav className="relative">
      {/* Desktop nav */}
      <ul className="hidden items-center gap-0 lg:flex">
        {/* Categories mega-menu trigger */}
        <li className="group relative">
          <button className="flex items-center gap-1.5 px-4 py-3 text-sm font-medium text-gray-200 transition hover:bg-gray-800 hover:text-white">
            <svg
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
            Categories
            <svg
              className="h-3 w-3 transition group-hover:rotate-180"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              strokeWidth="2.5"
            >
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>

          {/* Mega menu dropdown */}
          <div className="invisible absolute left-0 top-full z-50 w-[900px] rounded-b-lg border border-gray-200 bg-white shadow-xl transition-all group-hover:visible">
            <div className="grid grid-cols-4 gap-0 p-5">
              {filteredCategories.map((cat) => (
                <div key={cat.uid} className="py-2">
                  <Link
                    href={`/category/${cat.url_path}`}
                    className="mb-1 block text-sm font-semibold text-gray-900 hover:text-red-600"
                  >
                    {cat.name}
                  </Link>
                  {cat.children && cat.children.length > 0 && (
                    <ul className="space-y-0.5">
                      {cat.children.slice(0, 5).map((child) => (
                        <li key={child.uid}>
                          <Link
                            href={`/category/${child.url_path}`}
                            className="block text-xs text-gray-500 hover:text-red-600"
                          >
                            {child.name}
                          </Link>
                        </li>
                      ))}
                      {cat.children.length > 5 && (
                        <li>
                          <Link
                            href={`/category/${cat.url_path}`}
                            className="block text-xs font-medium text-blue-600 hover:text-blue-800"
                          >
                            View all &rarr;
                          </Link>
                        </li>
                      )}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          </div>
        </li>

        {/* Static nav items */}
        {STATIC_NAV_ITEMS.map((item) => (
          <li key={item.href}>
            <Link
              href={item.href}
              className="block px-4 py-3 text-sm font-medium text-gray-200 transition hover:bg-gray-800 hover:text-white"
            >
              {item.label}
            </Link>
          </li>
        ))}
      </ul>

      {/* Mobile hamburger */}
      <div className="flex items-center lg:hidden">
        <button
          className="flex items-center gap-2 py-3 text-sm font-medium text-gray-200"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          <svg
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            {mobileOpen ? (
              <path d="M6 18L18 6M6 6l12 12" />
            ) : (
              <>
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </>
            )}
          </svg>
          Menu
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="absolute left-0 top-full z-50 w-full border-b border-gray-700 bg-gray-900 shadow-xl lg:hidden">
          <ul className="divide-y divide-gray-800">
            {/* Categories accordion */}
            <li>
              <button
                className="flex w-full items-center justify-between px-4 py-3 text-sm font-medium text-gray-200"
                onClick={() => setMobileCategoriesOpen(!mobileCategoriesOpen)}
              >
                Categories
                <svg
                  className={`h-4 w-4 transition ${mobileCategoriesOpen ? "rotate-180" : ""}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  strokeWidth="2.5"
                >
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>
              {mobileCategoriesOpen && (
                <ul className="bg-gray-800 pb-2">
                  {filteredCategories.map((cat) => (
                    <li key={cat.uid}>
                      <Link
                        href={`/category/${cat.url_path}`}
                        className="block px-6 py-2 text-sm text-gray-300 hover:text-white"
                        onClick={() => setMobileOpen(false)}
                      >
                        {cat.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </li>

            {/* Static nav items */}
            {STATIC_NAV_ITEMS.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="block px-4 py-3 text-sm font-medium text-gray-200 hover:text-white"
                  onClick={() => setMobileOpen(false)}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </nav>
  );
}
