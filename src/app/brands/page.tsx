import { query } from "@/lib/apollo/rsc-client";
import { BRANDS_QUERY } from "@/lib/graphql/queries/brands";
import { BrandGrid } from "@/components/brands/BrandGrid";
import type { Metadata } from "next";

// Revalidate brands page every 24 hours
export const revalidate = 86400;

export const metadata: Metadata = {
  title: "Shop by Brand | Technimark",
  description:
    "Browse all brands available at Technimark. Find products from leading manufacturers in electronics, ESD protection, soldering, and more.",
};

export default async function BrandsPage() {
   
  const { data } = (await query({
    query: BRANDS_QUERY,
    fetchPolicy: "no-cache",
  })) as { data: any };

  const brandCategory = data.categories?.items?.[0];
  const brands = (brandCategory?.children || [])
    .filter((b: any) => b.product_count > 0) // only show brands with products
    .sort((a: any, b: any) => a.name.localeCompare(b.name));

  return (
    <div className="bg-gray-50 pb-16">
      {/* Hero */}
      <div className="relative bg-gradient-to-br from-gray-900 via-gray-900 to-gray-800">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_80%_50%,rgba(200,16,46,0.06)_0%,transparent_60%)]" />
        <div className="relative mx-auto max-w-7xl px-4 py-10">
          <p className="mb-2 text-[13px] font-semibold uppercase tracking-[1.2px] text-red-500">
            Our Partners
          </p>
          <h1 className="text-3xl font-bold text-white md:text-4xl">
            Shop by Brand
          </h1>
          <p className="mt-3 max-w-xl text-gray-400">
            Browse {brands.length} trusted manufacturers. From ESD protection to
            precision soldering tools, we carry the industry&apos;s leading
            brands.
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-7xl px-4 pt-8">
        <BrandGrid brands={brands} />
      </div>
    </div>
  );
}
