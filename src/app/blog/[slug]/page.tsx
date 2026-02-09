import { query } from "@/lib/apollo/rsc-client";
import { BLOG_POST_QUERY } from "@/lib/graphql/queries/blog";
import { PRODUCTS_BY_SKU_QUERY } from "@/lib/graphql/queries/customer";
import { CmsContent } from "@/components/cms/CmsContent";
import { BlogPostCard } from "@/components/blog/BlogPostCard";
import { ProductCard } from "@/components/product/ProductCard";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { JsonLd } from "@/components/seo/JsonLd";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://technimark.com";

// Revalidate blog posts every hour
export const revalidate = 3600;

interface BlogPostPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params;
  try {
     
    const { data } = (await query({
      query: BLOG_POST_QUERY,
      variables: { id: slug },
    })) as { data: any };
    const post = data.blogPost;
    if (!post) return { title: "Post Not Found" };
    const title = post.meta_title || post.title;
    const description =
      post.meta_description ||
      post.short_filtered_content?.replace(/<[^>]*>/g, "").slice(0, 160);
    return {
      title,
      description,
      openGraph: {
        title,
        description,
        type: "article",
        ...(post.publish_time && {
          publishedTime: post.publish_time,
        }),
        ...(post.featured_image && {
          images: [{ url: post.featured_image }],
        }),
      },
    };
  } catch {
    return { title: "Blog Post" };
  }
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let post: any = null;
  try {
     
    const { data } = (await query({
      query: BLOG_POST_QUERY,
      variables: { id: slug },
    })) as { data: any };
    post = data.blogPost;
  } catch {
    // Query failed
  }

  if (!post) {
    notFound();
  }

  const publishDate = post.publish_time
    ? new Date(post.publish_time).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : null;

  const imageUrl = post.featured_image;
  const relatedPosts = post.related_posts || [];
  const relatedSkus: string[] = post.related_products || [];

  // Fetch related products by SKU if any exist
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let relatedProducts: any[] = [];
  if (relatedSkus.length > 0) {
    try {
       
      const { data: prodData } = (await query({
        query: PRODUCTS_BY_SKU_QUERY,
        variables: { skus: relatedSkus.slice(0, 5), pageSize: 5 },
      })) as { data: any };
      relatedProducts = prodData?.products?.items || [];
    } catch {
      // Product fetch failed — skip section
    }
  }

  return (
    <article>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Article",
          headline: post.content_heading || post.title,
          ...(imageUrl && { image: imageUrl }),
          datePublished: post.publish_time || undefined,
          author: post.author?.title
            ? { "@type": "Person", name: post.author.title }
            : { "@type": "Organization", name: "Technimark" },
          publisher: {
            "@type": "Organization",
            name: "Technimark",
            url: SITE_URL,
          },
          mainEntityOfPage: `${SITE_URL}/blog/${post.identifier}`,
        }}
      />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
            {
              "@type": "ListItem",
              position: 2,
              name: "Blog",
              item: `${SITE_URL}/blog`,
            },
            ...(post.categories?.length > 0
              ? [
                  {
                    "@type": "ListItem",
                    position: 3,
                    name: post.categories[0].title,
                    item: `${SITE_URL}/blog/category/${post.categories[0].identifier}`,
                  },
                  {
                    "@type": "ListItem",
                    position: 4,
                    name: post.content_heading || post.title,
                    item: `${SITE_URL}/blog/${post.identifier}`,
                  },
                ]
              : [
                  {
                    "@type": "ListItem",
                    position: 3,
                    name: post.content_heading || post.title,
                    item: `${SITE_URL}/blog/${post.identifier}`,
                  },
                ]),
          ],
        }}
      />
      {/* Hero with featured image */}
      <div className="relative bg-gradient-to-br from-gray-900 via-gray-900 to-gray-800">
        {imageUrl && (
          <div className="absolute inset-0 opacity-20">
            <Image
              src={imageUrl}
              alt=""
              fill
              className="object-cover"
              priority
            />
          </div>
        )}
        <div className="relative mx-auto max-w-4xl px-4 py-12">
          {/* Breadcrumbs */}
          <nav className="mb-4 text-sm text-gray-400">
            <Link href="/" className="transition hover:text-white">
              Home
            </Link>
            <span className="mx-2 text-gray-600">/</span>
            <Link href="/blog" className="transition hover:text-white">
              Blog
            </Link>
            {post.categories?.length > 0 && (
              <>
                <span className="mx-2 text-gray-600">/</span>
                <Link
                  href={`/blog/category/${post.categories[0].identifier}`}
                  className="transition hover:text-white"
                >
                  {post.categories[0].title}
                </Link>
              </>
            )}
          </nav>

          {/* Category badges */}
          {post.categories?.length > 0 && (
            <div className="mb-3 flex flex-wrap gap-2">
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              {post.categories.map((cat: any) => (
                <Link
                  key={cat.identifier}
                  href={`/blog/category/${cat.identifier}`}
                  className="rounded-full bg-red-600/20 px-3 py-1 text-xs font-medium text-red-300 transition hover:bg-red-600/30"
                >
                  {cat.title}
                </Link>
              ))}
            </div>
          )}

          <h1 className="text-3xl font-bold text-white md:text-4xl">
            {post.content_heading || post.title}
          </h1>

          {/* Author + date */}
          <div className="mt-4 flex items-center gap-3 text-sm text-gray-400">
            {post.author?.title && <span>By {post.author.title}</span>}
            {publishDate && (
              <>
                <span className="text-gray-600">|</span>
                <time>{publishDate}</time>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Article content */}
      <div className="mx-auto max-w-4xl px-4 py-10">
        <CmsContent html={post.filtered_content} />

        {/* Tags */}
        {post.tags?.length > 0 && (
          <div className="mt-10 border-t border-gray-200 pt-6">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-medium text-gray-500">Tags:</span>
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              {post.tags.map((tag: any) => (
                <span
                  key={tag.identifier}
                  className="rounded-full border border-gray-200 px-3 py-1 text-xs text-gray-600"
                >
                  {tag.title}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Related products */}
      {relatedProducts.length > 0 && (
        <div className="border-t border-gray-200 bg-white py-12">
          <div className="mx-auto max-w-7xl px-4">
            <div className="mb-6 flex items-center gap-3">
              <svg
                className="h-5 w-5 text-red-600"
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
              <h2 className="text-xl font-bold text-gray-900">
                Featured Products
              </h2>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              {relatedProducts.map((product: any) => (
                <ProductCard key={product.sku} product={product} />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Related posts */}
      {relatedPosts.length > 0 && (
        <div className="border-t border-gray-200 bg-gray-50 py-12">
          <div className="mx-auto max-w-7xl px-4">
            <h2 className="mb-6 text-xl font-bold text-gray-900">
              Related Articles
            </h2>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {relatedPosts
                .slice(0, 3)
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                .map((rp: any) => (
                  <BlogPostCard key={rp.identifier} post={rp} />
                ))}
            </div>
          </div>
        </div>
      )}
    </article>
  );
}
