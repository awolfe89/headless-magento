import { query } from "@/lib/apollo/rsc-client";
import { SEARCH_PRODUCTS_QUERY } from "@/lib/graphql/queries/search";
import { ProductCard } from "@/components/product/ProductCard";
import { Pagination } from "@/components/ui/Pagination";
import Link from "next/link";
import type { Metadata } from "next";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const PAGE_SIZES = [25, 50, 75, 100];
const DEFAULT_PAGE_SIZE = 25;

function buildParamHref(
  basePath: string,
  currentParams: Record<string, string>,
  key: string,
  value: string,
): string {
  const params = new URLSearchParams(currentParams);
  if (key !== "page") params.delete("page");
  if (value) params.set(key, value);
  else params.delete(key);
  const qs = params.toString();
  return qs ? `${basePath}?${qs}` : basePath;
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

// Search results are dynamic but cache for 5 minutes
export const revalidate = 300;

interface SearchPageProps {
  searchParams: Promise<Record<string, string>>;
}

// ---------------------------------------------------------------------------
// Metadata
// ---------------------------------------------------------------------------

export async function generateMetadata({
  searchParams,
}: SearchPageProps): Promise<Metadata> {
  const sp = await searchParams;
  const q = sp.q || "";
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://technimark.com";
  return {
    title: q ? `Search results for "${q}"` : "Search",
    robots: { index: false, follow: true },
    alternates: {
      canonical: q ? `${siteUrl}/search?q=${encodeURIComponent(q)}` : `${siteUrl}/search`,
    },
  };
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const sp = await searchParams;
  const q = (sp.q || "").trim();
  const basePath = "/search";
  const rawPage = parseInt(sp.page || "1", 10);
  const currentPage = Number.isFinite(rawPage) && rawPage >= 1 ? rawPage : 1;
  const pageSize =
    PAGE_SIZES.includes(Number(sp.limit))
      ? Number(sp.limit)
      : DEFAULT_PAGE_SIZE;

  // No query — show search prompt
  if (!q) {
    return (
      <div>
        <div className="bg-gradient-to-r from-gray-900 to-gray-800">
          <div className="mx-auto max-w-7xl px-4 py-8">
            <h1 className="text-2xl font-bold text-white md:text-3xl">
              Search
            </h1>
            <p className="mt-1 text-sm text-gray-400">
              Enter a search term to find products
            </p>
          </div>
        </div>
        <div className="mx-auto max-w-7xl px-4 py-16 text-center">
          <svg
            className="mx-auto mb-4 h-16 w-16 text-gray-300"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            strokeWidth="1.5"
          >
            <circle cx="11" cy="11" r="8" />
            <path strokeLinecap="round" d="M21 21l-4.35-4.35" />
          </svg>
          <p className="text-lg font-medium text-gray-600">
            Use the search bar above to find products
          </p>
          <p className="mt-2 text-sm text-gray-400">
            Search by product name, SKU, brand, or keyword
          </p>
        </div>
      </div>
    );
  }

  // Build sort
  let sortInput = {};
  const sort = sp.sort || "";
  if (sort === "name_asc") sortInput = { name: "ASC" };
  else if (sort === "name_desc") sortInput = { name: "DESC" };
  else if (sort === "price_asc") sortInput = { price: "ASC" };
  else if (sort === "price_desc") sortInput = { price: "DESC" };

  // Fetch products
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let productData: any = null;
  try {
    const result = (await query({
      query: SEARCH_PRODUCTS_QUERY,
      variables: {
        search: q,
        pageSize,
        currentPage,
        sort: sortInput,
      },
      fetchPolicy: "no-cache",
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    })) as { data: any };
    productData = result.data;
  } catch {
    // Search failed
  }

  const items = productData?.products?.items || [];
  const pageInfo = productData?.products?.page_info;
  const totalCount = productData?.products?.total_count || 0;
  const aggregations = productData?.products?.aggregations || [];

  // Deduplicate
  const seen = new Set<string>();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const uniqueItems = items.filter((p: any) => {
    if (!p?.uid) return false;
    if (seen.has(p.uid)) return false;
    seen.add(p.uid);
    return true;
  });

  // Build manufacturer label map
  const manufacturerMap = new Map<string, string>();
  for (const agg of aggregations) {
    if (agg.attribute_code === "manufacturer") {
      for (const opt of agg.options) {
        manufacturerMap.set(opt.value, opt.label);
      }
    }
  }

  // Current params for link building
  const currentParams: Record<string, string> = {};
  for (const [key, val] of Object.entries(sp)) {
    if (val) currentParams[key] = val;
  }

  return (
    <div>
      {/* Hero */}
      <div className="bg-gradient-to-r from-gray-900 to-gray-800">
        <div className="mx-auto max-w-7xl px-4 py-6">
          <nav className="mb-3 text-sm text-gray-400">
            <Link href="/" className="transition hover:text-white">
              Home
            </Link>
            <span className="mx-2 text-gray-600">/</span>
            <span className="text-gray-200">Search</span>
          </nav>
          <h1 className="text-2xl font-bold text-white md:text-3xl">
            Results for &ldquo;{q}&rdquo;
          </h1>
          <p className="mt-1 text-sm text-gray-400">
            {totalCount} {totalCount === 1 ? "product" : "products"} found
          </p>
        </div>
      </div>

      {/* Main content */}
      <div className="mx-auto max-w-7xl px-4 py-6">
        {uniqueItems.length > 0 ? (
          <>
            {/* Toolbar */}
            <div className="mb-4 flex flex-col gap-3 rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-gray-600">
                <span className="font-semibold text-gray-900">
                  {totalCount}
                </span>{" "}
                {totalCount === 1 ? "product" : "products"}
              </p>

              <div className="flex flex-wrap items-center gap-3">
                {/* Sort */}
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-medium text-gray-500">
                    Sort:
                  </span>
                  <SortSelect
                    currentSort={sort}
                    basePath={basePath}
                    currentParams={currentParams}
                  />
                </div>

                <div className="hidden h-5 w-px bg-gray-300 sm:block" />

                {/* Page size */}
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-medium text-gray-500">
                    Show:
                  </span>
                  <div className="flex gap-1">
                    {PAGE_SIZES.map((size) => (
                      <Link
                        key={size}
                        href={buildParamHref(
                          basePath,
                          currentParams,
                          "limit",
                          size === DEFAULT_PAGE_SIZE ? "" : String(size),
                        )}
                        className={`rounded px-2 py-1 text-xs font-medium transition ${
                          pageSize === size
                            ? "bg-gray-900 text-white"
                            : "bg-white text-gray-600 hover:bg-gray-200"
                        }`}
                      >
                        {size}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Product Grid */}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              {uniqueItems.map((product: any) => (
                <ProductCard
                  key={product.uid}
                  product={product}
                  brandLabel={
                    product.manufacturer
                      ? manufacturerMap.get(String(product.manufacturer)) ||
                        null
                      : null
                  }
                />
              ))}
            </div>

            {pageInfo && (
              <Pagination
                currentPage={pageInfo.current_page}
                totalPages={pageInfo.total_pages}
                basePath={basePath}
                searchParams={currentParams}
              />
            )}
          </>
        ) : (
          /* No results */
          <div className="rounded-lg border border-gray-200 bg-gray-50 py-16 text-center">
            <svg
              className="mx-auto mb-4 h-16 w-16 text-gray-300"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
            >
              <circle cx="11" cy="11" r="8" />
              <path strokeLinecap="round" d="M21 21l-4.35-4.35" />
            </svg>
            <p className="text-lg font-medium text-gray-600">
              No products found for &ldquo;{q}&rdquo;
            </p>
            <p className="mt-2 text-sm text-gray-400">
              Try different keywords or check your spelling
            </p>
            <Link
              href="/"
              className="mt-6 inline-block rounded-lg bg-gray-900 px-6 py-2.5 text-sm font-medium text-white transition hover:bg-gray-800"
            >
              Back to Home
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Sort Select
// ---------------------------------------------------------------------------

function SortSelect({
  currentSort,
  basePath,
  currentParams,
}: {
  currentSort: string;
  basePath: string;
  currentParams: Record<string, string>;
}) {
  const options = [
    { value: "", label: "Relevance" },
    { value: "name_asc", label: "Name A-Z" },
    { value: "name_desc", label: "Name Z-A" },
    { value: "price_asc", label: "Price Low-High" },
    { value: "price_desc", label: "Price High-Low" },
  ];

  return (
    <div className="flex gap-1">
      {options.map((opt) => (
        <Link
          key={opt.value}
          href={buildParamHref(basePath, currentParams, "sort", opt.value)}
          className={`rounded px-2 py-1 text-xs font-medium transition ${
            currentSort === opt.value
              ? "bg-gray-900 text-white"
              : "bg-white text-gray-600 hover:bg-gray-200"
          }`}
        >
          {opt.label}
        </Link>
      ))}
    </div>
  );
}
