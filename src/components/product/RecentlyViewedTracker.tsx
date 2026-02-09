"use client";

import { useEffect } from "react";
import { trackProductView, type RecentProduct } from "@/lib/recentlyViewed";

interface Props {
  product: RecentProduct;
}

export function RecentlyViewedTracker({ product }: Props) {
  useEffect(() => {
    trackProductView(product);
  }, [product]);

  return null;
}
