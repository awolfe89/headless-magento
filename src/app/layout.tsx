import type { Metadata } from "next";
import "./globals.css";
import { ApolloWrapper } from "@/lib/apollo/ApolloWrapper";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { AnnouncementBar } from "@/components/layout/AnnouncementBar";
import { CompareDrawer } from "@/components/product/CompareDrawer";
import { ToastProvider } from "@/components/ui/Toast";
import { query } from "@/lib/apollo/rsc-client";
import { STORE_CONFIG_QUERY } from "@/lib/graphql/queries/storeConfig";
import { ROOT_CATEGORIES_QUERY } from "@/lib/graphql/queries/categories";
import { CMS_BLOCKS_QUERY } from "@/lib/graphql/queries/cmsPage";
import { JsonLd } from "@/components/seo/JsonLd";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://technimark.com";

// Revalidate layout data (categories, announcement bar) every 30 minutes
export const revalidate = 1800;

export async function generateMetadata(): Promise<Metadata> {
  let storeName = "Technimark";
  let defaultTitle = "Technimark - Industrial & Electronics Assembly Supplies";
  let defaultDescription =
    "Industrial supplies, electronics assembly materials, and labeling products. Veteran-owned since 1994.";

  try {
     
    const { data } = (await query({
      query: STORE_CONFIG_QUERY,
    })) as { data: any };
    storeName = data.storeConfig?.store_name || storeName;
    defaultTitle = data.storeConfig?.default_title || defaultTitle;
    defaultDescription =
      data.storeConfig?.default_description || defaultDescription;
  } catch {
    // Use defaults
  }

  return {
    metadataBase: new URL(SITE_URL),
    title: {
      default: defaultTitle,
      template: `%s | ${storeName}`,
    },
    description: defaultDescription,
    openGraph: {
      type: "website",
      siteName: storeName,
      title: defaultTitle,
      description: defaultDescription,
      locale: "en_US",
    },
    twitter: {
      card: "summary_large_image",
    },
  };
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let categories: any[] = [];
  let announcementContent: string | null = null;

  try {
     
    const [catResult, cmsResult] = await Promise.allSettled([
      query({ query: ROOT_CATEGORIES_QUERY }) as Promise<{ data: any }>,
      query({
        query: CMS_BLOCKS_QUERY,
        variables: { identifiers: ["announcement-bar"] },
      }) as Promise<{ data: any }>,
    ]);

    if (catResult.status === "fulfilled") {
      categories = catResult.value.data.categories?.items || [];
    }
    if (cmsResult.status === "fulfilled") {
      const block = cmsResult.value.data.cmsBlocks?.items?.[0];
      if (block?.content) {
        announcementContent = block.content;
      }
    }
  } catch (err) {
    console.error("Failed to fetch layout data:", err);
  }

  return (
    <html lang="en">
      <body className="antialiased">
        <JsonLd
          data={{
            "@context": "https://schema.org",
            "@type": "Organization",
            name: "Technimark",
            url: SITE_URL,
            logo: `${SITE_URL}/logo.png`,
            telephone: `+1-${process.env.NEXT_PUBLIC_COMPANY_PHONE || "847-639-4700"}`,
            address: {
              "@type": "PostalAddress",
              streetAddress: "720 Industrial Dr",
              addressLocality: "Cary",
              addressRegion: "IL",
              postalCode: "60013",
              addressCountry: "US",
            },
            sameAs: [],
          }}
        />
        <JsonLd
          data={{
            "@context": "https://schema.org",
            "@type": "WebSite",
            name: "Technimark",
            url: SITE_URL,
            potentialAction: {
              "@type": "SearchAction",
              target: `${SITE_URL}/search?q={search_term_string}`,
              "query-input": "required name=search_term_string",
            },
          }}
        />
        <ApolloWrapper>
          <ToastProvider>
            <AnnouncementBar content={announcementContent} />
            <Header categories={categories} />
            <main className="min-h-screen">{children}</main>
            <Footer />
            <CompareDrawer />
          </ToastProvider>
        </ApolloWrapper>
      </body>
    </html>
  );
}
