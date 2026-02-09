import { query } from "@/lib/apollo/rsc-client";
import { CMS_PAGE_QUERY } from "@/lib/graphql/queries/cmsPage";
import { CmsContent } from "@/components/cms/CmsContent";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

// Revalidate CMS pages every hour
export const revalidate = 3600;

interface CmsPageProps {
  params: Promise<{ slug: string[] }>;
}

export async function generateMetadata({
  params,
}: CmsPageProps): Promise<Metadata> {
  const { slug } = await params;
  const identifier = slug.join("/");
  try {
     
    const { data } = (await query({
      query: CMS_PAGE_QUERY,
      variables: { identifier },
    })) as { data: any };
    const page = data.cmsPage;
    if (!page) return { title: "Page Not Found" };
    return {
      title: page.meta_title || page.title,
      description: page.meta_description || "",
    };
  } catch {
    return { title: "Page" };
  }
}

export default async function CmsPage({ params }: CmsPageProps) {
  const { slug } = await params;
  const identifier = slug.join("/");

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let page: any = null;
  try {
     
    const { data } = (await query({
      query: CMS_PAGE_QUERY,
      variables: { identifier },
    })) as { data: any };
    page = data.cmsPage;
  } catch {
    // Query failed — fall through to notFound
  }

  if (!page) {
    notFound();
  }

  return (
    <div>
      {/* Hero */}
      <div className="bg-gradient-to-r from-gray-900 to-gray-800">
        <div className="mx-auto max-w-7xl px-4 py-8">
          <nav className="mb-3 text-sm text-gray-400">
            <Link href="/" className="transition hover:text-white">
              Home
            </Link>
            <span className="mx-2 text-gray-600">/</span>
            <span className="text-gray-200">{page.title}</span>
          </nav>
          <h1 className="text-2xl font-bold text-white md:text-3xl">
            {page.content_heading || page.title}
          </h1>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-4xl px-4 py-10">
        <CmsContent html={page.content} />
      </div>
    </div>
  );
}
