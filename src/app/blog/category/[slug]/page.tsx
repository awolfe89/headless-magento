import { query } from "@/lib/apollo/rsc-client";
import {
  BLOG_POSTS_QUERY,
  BLOG_CATEGORY_QUERY,
  BLOG_CATEGORIES_QUERY,
} from "@/lib/graphql/queries/blog";
import { BlogPostCard } from "@/components/blog/BlogPostCard";
import { Pagination } from "@/components/ui/Pagination";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { EXCLUDED_SLUGS } from "@/lib/blog/constants";

// Revalidate blog category pages every hour
export const revalidate = 3600;

interface BlogCategoryPageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string>>;
}

export async function generateMetadata({
  params,
}: BlogCategoryPageProps): Promise<Metadata> {
  const { slug } = await params;
  try {
     
    const { data } = (await query({
      query: BLOG_CATEGORY_QUERY,
      variables: { id: slug },
    })) as { data: any };
    const cat = data.blogCategory;
    if (!cat) return { title: "Category Not Found" };
    const siteUrl =
      process.env.NEXT_PUBLIC_SITE_URL || "https://technimark.com";
    return {
      title: cat.meta_title || `${cat.title} | Blog`,
      description: cat.meta_description || "",
      alternates: {
        canonical: `${siteUrl}/blog/category/${slug}`,
      },
    };
  } catch {
    return { title: "Blog Category" };
  }
}

export default async function BlogCategoryPage({
  params,
  searchParams,
}: BlogCategoryPageProps) {
  const { slug } = await params;
  const sp = await searchParams;
  const currentPage = parseInt(sp.page || "1", 10);
  const pageSize = 12;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let category: any = null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let posts: any[] = [];
  let totalPages = 1;
  let totalCount = 0;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let allCategories: any[] = [];

  try {
    const [categoryResult, postsResult, allCategoriesResult] =
      await Promise.allSettled([
         
        query({
          query: BLOG_CATEGORY_QUERY,
          variables: { id: slug },
        }) as Promise<{ data: any }>,
         
        query({
          query: BLOG_POSTS_QUERY,
          variables: {
            filter: { category_id: { eq: slug } },
            pageSize,
            currentPage,
            sort: ["DESC"],
          },
        }) as Promise<{ data: any }>,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        query({ query: BLOG_CATEGORIES_QUERY }) as Promise<{ data: any }>,
      ]);

    if (categoryResult.status === "fulfilled") {
      category = categoryResult.value.data?.blogCategory;
    }

    if (postsResult.status === "fulfilled") {
      const data = postsResult.value.data;
      posts = data?.blogPosts?.items || [];
      totalPages = data?.blogPosts?.total_pages || 1;
      totalCount = data?.blogPosts?.total_count || 0;
    }

    if (allCategoriesResult.status === "fulfilled") {
      allCategories =
        allCategoriesResult.value.data?.blogCategories?.items || [];
    }
  } catch (err) {
    console.error("Failed to fetch blog category data:", err);
  }

  if (!category) {
    notFound();
  }

  const visibleCategories = allCategories.filter(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (c: any) => c.posts_count > 0 && !EXCLUDED_SLUGS.has(c.identifier),
  );

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
              <Link href="/blog" className="transition hover:text-white">
                Blog
              </Link>
              <span className="mx-2 text-gray-600">/</span>
              <span className="text-gray-200">{category.title}</span>
            </nav>
            <h1 className="text-3xl font-bold text-white md:text-4xl">
              {category.title}
            </h1>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8">
        <div className="flex gap-8">
          {/* Main content */}
          <div className="min-w-0 flex-1">
            <p className="mb-6 text-sm text-gray-500">
              <span className="font-semibold text-gray-900">{totalCount}</span>{" "}
              {totalCount === 1 ? "article" : "articles"} in{" "}
              <span className="font-medium text-gray-700">
                {category.title}
              </span>
            </p>

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
                  basePath={`/blog/category/${slug}`}
                  searchParams={{}}
                />
              </>
            ) : (
              <div className="rounded-lg border border-gray-200 bg-gray-50 py-16 text-center">
                <p className="text-gray-500">
                  No posts in this category yet.
                </p>
                <Link
                  href="/blog"
                  className="mt-4 inline-block text-sm font-medium text-red-600 hover:text-red-700"
                >
                  View all articles
                </Link>
              </div>
            )}
          </div>

          {/* Sidebar: categories */}
          {visibleCategories.length > 0 && (
            <aside className="hidden w-56 shrink-0 lg:block">
              <div className="sticky top-24">
                <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
                  <div className="flex items-center gap-2 bg-gray-900 px-5 py-3">
                    <span className="h-3.5 w-[3px] rounded-sm bg-red-600" />
                    <h2 className="text-xs font-semibold uppercase tracking-[1px] text-gray-400">
                      Categories
                    </h2>
                  </div>
                  <ul className="p-2">
                    {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                    {visibleCategories.map((cat: any) => {
                      const isActive = cat.identifier === slug;
                      return (
                        <li key={cat.identifier}>
                          <Link
                            href={`/blog/category/${cat.identifier}`}
                            className={`flex items-center justify-between rounded-lg px-3 py-2 text-sm transition ${
                              isActive
                                ? "bg-red-50 font-semibold text-red-600"
                                : "text-gray-600 hover:bg-gray-50 hover:text-red-600"
                            }`}
                          >
                            <span>{cat.title}</span>
                            <span
                              className={`text-xs ${isActive ? "text-red-400" : "text-gray-400"}`}
                            >
                              {cat.posts_count}
                            </span>
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              </div>
            </aside>
          )}
        </div>
      </div>
    </div>
  );
}
