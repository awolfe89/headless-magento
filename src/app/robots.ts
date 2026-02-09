import type { MetadataRoute } from "next";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://technimark.com";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/cart",
          "/checkout",
          "/checkout/",
          "/account",
          "/account/",
          "/customer",
          "/customer/",
          "/api/",
          "/quick-order",
          "/compare",
          "/search",
        ],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
