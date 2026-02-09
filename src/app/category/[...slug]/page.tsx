import { query } from "@/lib/apollo/rsc-client";
import { CATEGORY_BY_URL_QUERY } from "@/lib/graphql/queries/categories";
import { FILTERED_PRODUCTS_QUERY } from "@/lib/graphql/queries/products";
import { ProductCard } from "@/components/product/ProductCard";
import { Pagination } from "@/components/ui/Pagination";
import { FilterGroup } from "@/components/ui/FilterGroup";
import { PriceRangeFilter } from "@/components/ui/PriceRangeFilter";
import { MobileFilterDrawer } from "@/components/ui/MobileFilterDrawer";
import { NavSelect } from "@/components/ui/NavSelect";
import { CategoryIcon } from "@/components/ui/CategoryIcon";
import Link from "next/link";
import type { Metadata } from "next";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Decode common HTML entities to plain characters. */
function decodeEntities(text: string): string {
  const map: Record<string, string> = {
    "&amp;": "&", "&lt;": "<", "&gt;": ">", "&quot;": '"',
    "&#39;": "'", "&apos;": "'", "&nbsp;": " ",
  };
  return text
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
    .replace(/&#x([0-9a-fA-F]+);/g, (_, h) => String.fromCharCode(parseInt(h, 16)))
    .replace(/&(?:amp|lt|gt|quot|#39|apos|nbsp);/g, (m) => map[m] || m);
}

/** Strip HTML tags, style/script blocks, and extract plain text. */
function extractPlainDescription(html: string | null): string | null {
  if (!html) return null;
  let cleaned = html
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "");
  cleaned = cleaned.replace(/<[^>]*>/g, " ");
  cleaned = cleaned.replace(/[#.]\S*\{[^}]*\}/g, "");
  cleaned = decodeEntities(cleaned);
  cleaned = cleaned.replace(/\s+/g, " ").trim();
  if (!cleaned || cleaned.length < 10) return null;
  const truncated = cleaned.slice(0, 250);
  const sentenceEnd = truncated.lastIndexOf(".");
  if (sentenceEnd > 50) return truncated.slice(0, sentenceEnd + 1);
  return truncated + (cleaned.length > 250 ? "..." : "");
}

const PAGE_SIZES = [25, 50, 75, 100];
const DEFAULT_PAGE_SIZE = 25;

/** Attributes worth showing as filters (skip noisy/internal ones). */
const FILTER_ALLOWLIST = new Set([
  "manufacturer",
  "color",
  "material",
  "cleaner_type",
  "wipe_properties",
  "wipe_size",
  "gauge",
  "volume2",
  "package_qty",
  "item_label",
  "tip_type",
  "container_capacity",
]);

/** Build a URL preserving current params but toggling a filter value. */
function buildFilterHref(
  basePath: string,
  currentParams: Record<string, string>,
  attrCode: string,
  value: string,
): string {
  const params = new URLSearchParams(currentParams);
  params.delete("page"); // reset to page 1 on filter change

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

// Revalidate category pages every 30 minutes
export const revalidate = 1800;

interface CategoryPageProps {
  params: Promise<{ slug: string[] }>;
  searchParams: Promise<Record<string, string>>;
}

// ---------------------------------------------------------------------------
// Metadata
// ---------------------------------------------------------------------------

export async function generateMetadata({
  params,
}: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params;
  const urlPath = slug.join("/");
  try {
     
    const { data } = (await query({
      query: CATEGORY_BY_URL_QUERY,
      variables: { urlPath },
    })) as { data: any };
    const category = data.categories?.items?.[0];
    const siteUrl =
      process.env.NEXT_PUBLIC_SITE_URL || "https://technimark.com";
    return {
      title: category?.meta_title || category?.name || "Category",
      description: category?.meta_description || "",
      alternates: {
        canonical: `${siteUrl}/category/${urlPath}`,
      },
    };
  } catch {
    return { title: "Category" };
  }
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default async function CategoryPage({
  params,
  searchParams,
}: CategoryPageProps) {
  const { slug } = await params;
  const sp = await searchParams;
  const urlPath = slug.join("/");
  const basePath = `/category/${urlPath}`;
  const rawPage = parseInt(sp.page || "1", 10);
  const currentPage = Number.isFinite(rawPage) && rawPage >= 1 ? rawPage : 1;
  const pageSize =
    PAGE_SIZES.includes(Number(sp.limit)) ? Number(sp.limit) : DEFAULT_PAGE_SIZE;

  // -- Category data -------------------------------------------------------
   
  const { data: catData } = (await query({
    query: CATEGORY_BY_URL_QUERY,
    variables: { urlPath },
  })) as { data: any };

  const category = catData.categories?.items?.[0];

  if (!category) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 text-center">
        <h1 className="mb-4 text-2xl font-bold text-gray-900">
          Category Not Found
        </h1>
        <p className="mb-8 text-gray-600">
          The category you&apos;re looking for doesn&apos;t exist.
        </p>
        <Link
          href="/"
          className="inline-block rounded-lg bg-blue-600 px-6 py-3 font-medium text-white hover:bg-blue-700"
        >
          Back to Home
        </Link>
      </div>
    );
  }

  const hasChildren = category.children && category.children.length > 0;

  // -- Collect category UIDs (parent + children) ---------------------------
  const categoryUids = [category.uid];
  if (category.children) {
    for (const child of category.children) {
      categoryUids.push(child.uid);
    }
  }

  // -- Build sort -----------------------------------------------------------
  let sortInput = {};
  const sort = sp.sort || "";
  if (sort === "name_asc") sortInput = { name: "ASC" };
  else if (sort === "name_desc") sortInput = { name: "DESC" };
  else if (sort === "price_asc") sortInput = { price: "ASC" };
  else if (sort === "price_desc") sortInput = { price: "DESC" };

  // -- Build filter from URL params (f_manufacturer=48,58 → { manufacturer: { in: ["48","58"] } })
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const filter: Record<string, any> = {
    category_uid: { in: categoryUids },
  };
  const activeFilters: Record<string, string[]> = {};
  for (const [key, val] of Object.entries(sp)) {
    if (key.startsWith("f_") && val) {
      const attrCode = key.slice(2);
      const values = val.split(",");
      activeFilters[attrCode] = values;
      if (attrCode === "price") {
        // price is a range filter
        const [from, to] = values[0].split("-");
        filter.price = { from, to };
      } else {
        filter[attrCode] = { in: values };
      }
    }
  }

  // -- Fetch products -------------------------------------------------------
   
  const { data: productData } = (await query({
    query: FILTERED_PRODUCTS_QUERY,
    variables: {
      filter,
      pageSize,
      currentPage,
      sort: sortInput,
    },
    fetchPolicy: "no-cache",
  })) as { data: any };

  const {
    items: rawItems,
    page_info,
    total_count,
    aggregations,
  } = productData.products;

  // Deduplicate
  const seen = new Set<string>();
  const items = (rawItems || []).filter((p: any) => {
    if (!p?.uid) return false;
    if (seen.has(p.uid)) return false;
    seen.add(p.uid);
    return true;
  });

  // -- Build manufacturer label map from aggregations -----------------------
  const manufacturerMap = new Map<string, string>();
  const filterableAggs: {
    attribute_code: string;
    label: string;
    options: { label: string; value: string; count: number }[];
  }[] = [];

  if (aggregations) {
    for (const agg of aggregations) {
      if (agg.attribute_code === "manufacturer") {
        for (const opt of agg.options) {
          manufacturerMap.set(opt.value, opt.label);
        }
      }
      if (
        FILTER_ALLOWLIST.has(agg.attribute_code) &&
        agg.options &&
        agg.options.length > 0
      ) {
        filterableAggs.push(agg);
      }
    }
  }

  // Sort aggregations: manufacturer first, then alphabetically
  filterableAggs.sort((a, b) => {
    if (a.attribute_code === "manufacturer") return -1;
    if (b.attribute_code === "manufacturer") return 1;
    return a.label.localeCompare(b.label);
  });

  // -- Preserve current search params for link building ---------------------
  const currentParams: Record<string, string> = {};
  for (const [key, val] of Object.entries(sp)) {
    if (val) currentParams[key] = val;
  }

  // Price range for filter UI
  const priceRange = activeFilters.price
    ? (() => {
        const [from, to] = (activeFilters.price[0] || "").split("-");
        return { from: from || "", to: to || "" };
      })()
    : null;

  // Count active filter selections
  const activeFilterCount = Object.values(activeFilters).reduce(
    (sum, vals) => sum + vals.length,
    0,
  );

  return (
    <div>
      {/* Category Hero */}
      <div className="bg-gradient-to-r from-gray-900 to-gray-800">
        <div className="mx-auto max-w-7xl px-4 py-6">
          {/* Breadcrumbs */}
          <nav className="mb-3 text-sm text-gray-400">
            <Link href="/" className="transition hover:text-white">
              Home
            </Link>
            {category.breadcrumbs?.map(
              (crumb: {
                category_uid: string;
                category_name: string;
                category_url_path: string;
              }) => (
                <span key={crumb.category_uid}>
                  <span className="mx-2 text-gray-600">/</span>
                  <Link
                    href={`/category/${crumb.category_url_path}`}
                    className="transition hover:text-white"
                  >
                    {crumb.category_name}
                  </Link>
                </span>
              ),
            )}
            <span className="mx-2 text-gray-600">/</span>
            <span className="text-gray-200">{category.name}</span>
          </nav>

          <h1 className="text-2xl font-bold text-white md:text-3xl">
            {category.name}
          </h1>
          {(() => {
            const desc = extractPlainDescription(category.description);
            return desc ? (
              <p className="mt-1.5 max-w-3xl text-sm text-gray-300">{desc}</p>
            ) : null;
          })()}
        </div>
      </div>

      {/* Subcategory Cards */}
      {hasChildren && (
        <div className="border-b border-gray-200 bg-gray-50">
          <div className="mx-auto max-w-7xl px-4 py-6">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {category.children.map(
                (child: {
                  uid: string;
                  name: string;
                  url_path: string;
                  product_count: number;
                  children_count: number;
                  image: string | null;
                  children?: {
                    uid: string;
                    name: string;
                    url_path: string;
                    product_count: number;
                  }[];
                }) => {
                  const grandchildren = child.children?.filter(
                    (gc) => gc.product_count > 0,
                  ) || [];

                  return (
                    <div
                      key={child.uid}
                      className="group overflow-hidden rounded-lg border border-gray-200 bg-white transition hover:border-blue-300 hover:shadow-md"
                    >
                      {/* Card header — links to the subcategory */}
                      <Link
                        href={`/category/${child.url_path}`}
                        className="flex items-center gap-2.5 px-3.5 py-3"
                      >
                        {child.image ? (
                          <img
                            src={child.image}
                            alt={child.name}
                            className="h-10 w-10 rounded object-cover"
                          />
                        ) : (
                          <CategoryIcon name={child.name} />
                        )}
                        <div className="min-w-0">
                          <h3 className="truncate text-sm font-semibold text-gray-900 group-hover:text-blue-600">
                            {child.name}
                          </h3>
                          {child.product_count > 0 && (
                            <p className="text-[11px] text-gray-500">
                              {child.product_count} {child.product_count === 1 ? "product" : "products"}
                            </p>
                          )}
                        </div>
                      </Link>

                      {/* Grandchildren links */}
                      {grandchildren.length > 0 && (
                        <div className="border-t border-gray-100 px-3.5 py-2">
                          <div className="flex flex-wrap gap-x-1.5 gap-y-0.5">
                            {grandchildren.map((gc, idx) => (
                              <span key={gc.uid} className="inline-flex items-center">
                                <Link
                                  href={`/category/${gc.url_path}`}
                                  className="text-[11px] text-gray-400 transition hover:text-blue-600"
                                >
                                  {gc.name}
                                </Link>
                                {idx < grandchildren.length - 1 && (
                                  <span className="ml-1.5 text-[11px] text-gray-300">·</span>
                                )}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                },
              )}
            </div>
          </div>
        </div>
      )}

      {/* Main content: Sidebar + Products */}
      <div className="mx-auto max-w-7xl px-4 py-6">
        <div className="flex gap-6">
          {/* Sidebar Filters */}
          {filterableAggs.length > 0 && (
            <aside className="hidden w-56 shrink-0 lg:block">
              <div className="sticky top-4">
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-sm font-bold uppercase tracking-wider text-gray-900">
                    Filters
                  </h2>
                  {activeFilterCount > 0 && (
                    <Link
                      href={basePath}
                      className="text-xs font-medium text-red-600 hover:text-red-700"
                    >
                      Clear all ({activeFilterCount})
                    </Link>
                  )}
                </div>

                <div className="space-y-5">
                  <PriceRangeFilter
                    basePath={basePath}
                    currentParams={currentParams}
                    activeRange={priceRange}
                  />
                  {filterableAggs.map((agg) => (
                    <FilterGroup
                      key={agg.attribute_code}
                      label={
                        agg.attribute_code === "manufacturer"
                          ? "Brand"
                          : agg.label
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
            </aside>
          )}

          {/* Products area */}
          <div className="min-w-0 flex-1">
            {/* Toolbar */}
            <div className="mb-4 flex flex-col gap-3 rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <MobileFilterDrawer
                  aggregations={filterableAggs}
                  activeFilters={activeFilters}
                  basePath={basePath}
                  currentParams={currentParams}
                  activeFilterCount={activeFilterCount}
                  priceRange={priceRange}
                />
                <p className="text-sm text-gray-600">
                  <span className="font-semibold text-gray-900">
                    {total_count}
                  </span>{" "}
                  {total_count === 1 ? "product" : "products"}
                </p>
              </div>

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

                {/* Divider */}
                <div className="hidden h-5 w-px bg-gray-300 sm:block" />

                {/* Page size */}
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-medium text-gray-500">
                    Show:
                  </span>
                  {/* Native select on mobile, buttons on sm+ */}
                  <NavSelect
                    value={buildParamHref(basePath, currentParams, "limit", pageSize === DEFAULT_PAGE_SIZE ? "" : String(pageSize))}
                    options={PAGE_SIZES.map((size) => ({
                      value: buildParamHref(basePath, currentParams, "limit", size === DEFAULT_PAGE_SIZE ? "" : String(size)),
                      label: String(size),
                    }))}
                    className="rounded border border-gray-200 bg-white px-2 py-1 text-xs font-medium text-gray-600 sm:hidden"
                    ariaLabel="Products per page"
                  />
                  <div className="hidden gap-1 sm:flex">
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

            {/* Active filters pills (mobile-friendly) */}
            {activeFilterCount > 0 && (
              <div className="mb-4 flex flex-wrap gap-2">
                {Object.entries(activeFilters).map(([attrCode, values]) => {
                  const agg = filterableAggs.find(
                    (a) => a.attribute_code === attrCode,
                  );
                  return values.map((val) => {
                    const opt = agg?.options.find((o) => o.value === val);
                    let displayLabel = opt?.label || val;
                    if (attrCode === "price" && val.includes("-")) {
                      const [from, to] = val.split("-");
                      displayLabel = `$${from} – $${to}`;
                    }
                    return (
                      <Link
                        key={`${attrCode}-${val}`}
                        href={buildFilterHref(
                          basePath,
                          currentParams,
                          attrCode,
                          val,
                        )}
                        className="inline-flex items-center gap-1 rounded-full border border-blue-200 bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700 transition hover:bg-blue-100"
                      >
                        {displayLabel}
                        <svg
                          className="h-3 w-3"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          strokeWidth="2.5"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </Link>
                    );
                  });
                })}
              </div>
            )}

            {/* Product Grid */}
            {items.length > 0 ? (
              <>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4">
                  {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                  {items.map((product: any) => (
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

                <Pagination
                  currentPage={page_info.current_page}
                  totalPages={page_info.total_pages}
                  basePath={basePath}
                  searchParams={currentParams}
                />
              </>
            ) : (
              <div className="rounded-lg border border-gray-200 bg-gray-50 py-16 text-center">
                <svg
                  className="mx-auto mb-4 h-12 w-12 text-gray-400"
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
                <p className="text-gray-500">
                  No products found matching your criteria.
                </p>
                {activeFilterCount > 0 && (
                  <Link
                    href={basePath}
                    className="mt-3 inline-block text-sm font-medium text-blue-600 hover:text-blue-700"
                  >
                    Clear all filters
                  </Link>
                )}
              </div>
            )}
          </div>
        </div>
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
    <>
      {/* Native select on mobile */}
      <NavSelect
        value={buildParamHref(basePath, currentParams, "sort", currentSort)}
        options={options.map((opt) => ({
          value: buildParamHref(basePath, currentParams, "sort", opt.value),
          label: opt.label,
        }))}
        className="rounded border border-gray-200 bg-white px-2 py-1 text-xs font-medium text-gray-600 sm:hidden"
        ariaLabel="Sort products"
      />
      {/* Buttons on sm+ */}
      <div className="hidden gap-1 sm:flex">
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
    </>
  );
}
