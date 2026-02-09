import { query } from "@/lib/apollo/rsc-client";
import {
  BLOG_POSTS_QUERY,
  BLOG_CATEGORIES_QUERY,
} from "@/lib/graphql/queries/blog";
import { BlogPostCard } from "@/components/blog/BlogPostCard";
import { BlogSearch } from "@/components/blog/BlogSearch";
import { Pagination } from "@/components/ui/Pagination";
import Link from "next/link";
import type { Metadata } from "next";
import { EXCLUDED_SLUGS } from "@/lib/blog/constants";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://technimark.com";

// Revalidate blog listing every hour
export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Blog",
  description:
    "Industry insights, product guides, and technical tips from Technimark.",
  alternates: {
    canonical: `${SITE_URL}/blog`,
  },
};

// These are the curated "featured" category slugs shown as hero cards
const FEATURED_SLUGS = [
  "product-guides-and-info",
  "tips-and-how-to",
  "case-studies",
];

const FEATURED_DESCRIPTIONS: Record<string, string> = {
  "product-guides-and-info":
    "Detailed guides and specs for the products we carry.",
  "tips-and-how-to":
    "Practical tips and step-by-step how-to articles.",
  "case-studies":
    "Real-world examples of how our products solve problems.",
};

const FEATURED_ICONS: Record<string, React.ReactNode> = {
  "product-guides-and-info": (
    <svg
      className="h-6 w-6"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      strokeWidth="1.5"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25"
      />
    </svg>
  ),
  "tips-and-how-to": (
    <svg
      className="h-6 w-6"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      strokeWidth="1.5"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.383a14.406 14.406 0 01-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 10-7.517 0c.85.493 1.509 1.333 1.509 2.316V18"
      />
    </svg>
  ),
  "case-studies": (
    <svg
      className="h-6 w-6"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      strokeWidth="1.5"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z"
      />
    </svg>
  ),
};

interface BlogPageProps {
  searchParams: Promise<Record<string, string>>;
}

export default async function BlogPage({ searchParams }: BlogPageProps) {
  const sp = await searchParams;
  const currentPage = parseInt(sp.page || "1", 10);
  const searchQuery = sp.q || "";
  const pageSize = 12;

  // Build filter for search
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const filter: any = searchQuery
    ? { search: { eq: searchQuery } }
    : undefined;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let posts: any[] = [];
  let totalPages = 1;
  let totalCount = 0;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let categories: any[] = [];

  try {
    const [postsResult, categoriesResult] = await Promise.allSettled([
       
      query({
        query: BLOG_POSTS_QUERY,
        variables: { pageSize, currentPage, sort: ["DESC"], filter },
      }) as Promise<{ data: any }>,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      query({ query: BLOG_CATEGORIES_QUERY }) as Promise<{ data: any }>,
    ]);

    if (postsResult.status === "fulfilled") {
      const data = postsResult.value.data;
      posts = data?.blogPosts?.items || [];
      totalPages = data?.blogPosts?.total_pages || 1;
      totalCount = data?.blogPosts?.total_count || 0;
    }

    if (categoriesResult.status === "fulfilled") {
      categories =
        categoriesResult.value.data?.blogCategories?.items || [];
    }
  } catch (err) {
    console.error("Failed to fetch blog data:", err);
  }

  const visibleCategories = categories.filter(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (c: any) => c.posts_count > 0 && !EXCLUDED_SLUGS.has(c.identifier),
  );

  // Group sidebar categories
  const articleCategories = visibleCategories.filter(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (c: any) =>
      !c.identifier.includes("video") &&
      !c.identifier.includes("pdf") &&
      !c.identifier.includes("sds"),
  );
  const videoCategories = visibleCategories.filter(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (c: any) => c.identifier.includes("video"),
  );

  // Featured categories from the full list
  const featured = FEATURED_SLUGS.map((slug) =>
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    categories.find((c: any) => c.identifier === slug),
  ).filter(Boolean);

  // Preserve search params for pagination
  const paginationParams: Record<string, string> = {};
  if (searchQuery) paginationParams.q = searchQuery;

  return (
    <div>
      {/* Hero */}
      <div className="bg-gradient-to-br from-gray-900 via-gray-900 to-gray-800">
        <div className="relative mx-auto max-w-7xl px-4 py-10">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_80%_50%,rgba(200,16,46,0.06)_0%,transparent_60%)]" />
          <div className="relative">
            <nav className="mb-3 text-sm text-gray-400">
              <Link href="/" className="transition hover:text-white">
                Home
              </Link>
              <span className="mx-2 text-gray-600">/</span>
              <span className="text-gray-200">Blog</span>
            </nav>
            <p className="mb-2 text-[13px] font-semibold uppercase tracking-[1.2px] text-red-500">
              Industry Insights
            </p>
            <h1 className="text-3xl font-bold text-white md:text-4xl">Blog</h1>
            <p className="mt-3 max-w-xl text-gray-400">
              Technical guides, product highlights, and manufacturing best
              practices.
            </p>

            {/* Search bar in hero */}
            <div className="mt-6 max-w-lg">
              <BlogSearch defaultValue={searchQuery} />
            </div>
          </div>
        </div>
      </div>

      {/* Featured categories — only show when not searching */}
      {!searchQuery && featured.length > 0 && currentPage === 1 && (
        <div className="border-b border-gray-100 bg-gray-50">
          <div className="mx-auto max-w-7xl px-4 py-8">
            <div className="grid gap-4 sm:grid-cols-3">
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              {featured.map((cat: any) => (
                <Link
                  key={cat.identifier}
                  href={`/blog/category/${cat.identifier}`}
                  className="group flex items-start gap-4 rounded-xl border border-gray-200 bg-white p-5 transition hover:border-red-200 hover:shadow-md"
                >
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-red-50 text-red-600 transition group-hover:bg-red-100">
                    {FEATURED_ICONS[cat.identifier] || (
                      <svg
                        className="h-6 w-6"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        strokeWidth="1.5"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
                        />
                      </svg>
                    )}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-gray-900 transition group-hover:text-red-600">
                      {cat.title}
                    </h3>
                    <p className="mt-0.5 text-xs text-gray-500">
                      {FEATURED_DESCRIPTIONS[cat.identifier] ||
                        `${cat.posts_count} articles`}
                    </p>
                    <span className="mt-2 inline-block text-xs font-semibold text-red-600">
                      Browse &rarr;
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="mx-auto max-w-7xl px-4 py-8">
        <div className="flex gap-8">
          {/* Main content */}
          <div className="min-w-0 flex-1">
            {/* Results header */}
            <div className="mb-6 flex items-center justify-between">
              <p className="text-sm text-gray-500">
                {searchQuery ? (
                  <>
                    <span className="font-semibold text-gray-900">
                      {totalCount}
                    </span>{" "}
                    result{totalCount !== 1 ? "s" : ""} for &ldquo;
                    <span className="font-medium text-gray-700">
                      {searchQuery}
                    </span>
                    &rdquo;
                  </>
                ) : (
                  <>
                    <span className="font-semibold text-gray-900">
                      {totalCount}
                    </span>{" "}
                    {totalCount === 1 ? "article" : "articles"}
                  </>
                )}
              </p>
              {searchQuery && (
                <Link
                  href="/blog"
                  className="text-sm font-medium text-red-600 hover:text-red-700"
                >
                  Clear search
                </Link>
              )}
            </div>

            {posts.length > 0 ? (
              <>
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                  {posts.map((post: any) => (
                    <BlogPostCard key={post.identifier} post={post} />
                  ))}
                </div>
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  basePath="/blog"
                  searchParams={paginationParams}
                />
              </>
            ) : (
              <div className="rounded-lg border border-gray-200 bg-gray-50 py-16 text-center">
                {searchQuery ? (
                  <>
                    <svg
                      className="mx-auto mb-4 h-10 w-10 text-gray-300"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      strokeWidth="1.5"
                    >
                      <circle cx="11" cy="11" r="8" />
                      <line x1="21" y1="21" x2="16.65" y2="16.65" />
                    </svg>
                    <p className="text-gray-600">
                      No articles found for &ldquo;{searchQuery}&rdquo;
                    </p>
                    <Link
                      href="/blog"
                      className="mt-3 inline-block text-sm font-medium text-red-600 hover:text-red-700"
                    >
                      View all articles
                    </Link>
                  </>
                ) : (
                  <p className="text-gray-500">
                    No blog posts yet. Check back soon!
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <aside className="hidden w-64 shrink-0 lg:block">
            <div className="sticky top-24 space-y-4">
              {/* Article Categories */}
              {articleCategories.length > 0 && (
                <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
                  <div className="flex items-center gap-2 bg-gray-900 px-5 py-3">
                    <span className="h-3.5 w-[3px] rounded-sm bg-red-600" />
                    <h2 className="text-xs font-semibold uppercase tracking-[1px] text-gray-400">
                      Topics
                    </h2>
                  </div>
                  <ul className="max-h-[360px] overflow-y-auto p-2">
                    {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                    {articleCategories.map((cat: any) => (
                      <li key={cat.identifier}>
                        <Link
                          href={`/blog/category/${cat.identifier}`}
                          className="flex items-center justify-between rounded-lg px-3 py-2 text-sm text-gray-600 transition hover:bg-gray-50 hover:text-red-600"
                        >
                          <span className="truncate">{cat.title}</span>
                          <span className="ml-2 shrink-0 rounded-full bg-gray-100 px-2 py-0.5 text-[11px] font-medium text-gray-500">
                            {cat.posts_count}
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Video Categories */}
              {videoCategories.length > 0 && (
                <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
                  <div className="flex items-center gap-2 bg-gray-900 px-5 py-3">
                    <span className="h-3.5 w-[3px] rounded-sm bg-red-600" />
                    <h2 className="text-xs font-semibold uppercase tracking-[1px] text-gray-400">
                      Videos
                    </h2>
                  </div>
                  <ul className="max-h-[280px] overflow-y-auto p-2">
                    {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                    {videoCategories.map((cat: any) => (
                      <li key={cat.identifier}>
                        <Link
                          href={`/blog/category/${cat.identifier}`}
                          className="flex items-center justify-between rounded-lg px-3 py-2 text-sm text-gray-600 transition hover:bg-gray-50 hover:text-red-600"
                        >
                          <span className="truncate">{cat.title}</span>
                          <span className="ml-2 shrink-0 rounded-full bg-gray-100 px-2 py-0.5 text-[11px] font-medium text-gray-500">
                            {cat.posts_count}
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Need help callout */}
              <div className="rounded-xl border border-blue-100 bg-blue-50 px-5 py-4">
                <p className="text-sm font-semibold text-blue-900">
                  Can&apos;t find what you need?
                </p>
                <p className="mt-1 text-xs text-blue-700">
                  Our team can help with product selection and technical
                  questions.
                </p>
                <Link
                  href="/contact"
                  className="mt-3 inline-block text-xs font-semibold text-blue-700 underline underline-offset-2 hover:text-blue-900"
                >
                  Contact Us &rarr;
                </Link>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
