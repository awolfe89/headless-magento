import Link from "next/link";
import { Navigation } from "./Navigation";
import { CartIcon } from "@/components/cart/CartIcon";
import { SearchBar } from "./SearchBar";
import { AuthLinks } from "./AuthLinks";

export interface CategoryItem {
  uid: string;
  name: string;
  url_path: string;
  url_key: string;
  position: number;
  children_count: number;
  children?: CategoryItem[];
}

interface HeaderProps {
  categories: CategoryItem[];
}

export function Header({ categories }: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 bg-white shadow-sm">
      {/* Top Bar — hidden on mobile, visible on sm+ */}
      <div className="hidden border-b border-gray-200 bg-gray-900 text-sm text-gray-300 sm:block">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-2">
          <a
            href={`tel:${process.env.NEXT_PUBLIC_COMPANY_PHONE || "847-639-4700"}`}
            className="flex items-center gap-1.5 transition hover:text-white"
          >
            <svg
              className="h-3.5 w-3.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
            </svg>
            {process.env.NEXT_PUBLIC_COMPANY_PHONE || "847-639-4700"}
          </a>
          <div className="flex items-center gap-4">
            <Link href="/contact" className="transition hover:text-white">
              Contact Us
            </Link>
            <span className="text-gray-600">|</span>
            <AuthLinks />
          </div>
        </div>
      </div>

      {/* Main Header */}
      <div className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-4 py-4">
          {/* Logo */}
          <Link href="/" className="shrink-0">
            <span className="text-2xl font-bold tracking-tight text-gray-900">
              Technimark
              <span className="text-red-600">.</span>
            </span>
          </Link>

          {/* Search */}
          <div className="hidden flex-1 md:block">
            <SearchBar />
          </div>

          {/* Utility Icons */}
          <div className="flex items-center gap-5">
            <Link
              href="/account"
              className="hidden text-gray-600 transition hover:text-gray-900 md:block"
              aria-label="My Account"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            </Link>
            <CartIcon />
          </div>
        </div>

        {/* Mobile Search */}
        <div className="border-t border-gray-100 px-4 pb-3 md:hidden">
          <SearchBar />
        </div>
      </div>

      {/* Navigation Bar */}
      <div className="bg-gray-900">
        <div className="mx-auto max-w-7xl px-4">
          <Navigation categories={categories} />
        </div>
      </div>
    </header>
  );
}
