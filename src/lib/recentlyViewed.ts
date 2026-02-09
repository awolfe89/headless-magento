const STORAGE_KEY = "tm_recently_viewed";
const MAX_ITEMS = 20;

export interface RecentProduct {
  url_key: string;
  name: string;
  sku: string;
  image_url: string;
  price: number;
  currency: string;
  manufacturer?: string | null;
  category_uid?: string | null;
}

export function getRecentlyViewed(): RecentProduct[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function trackProductView(product: RecentProduct): void {
  if (typeof window === "undefined") return;
  try {
    const items = getRecentlyViewed().filter(
      (p) => p.url_key !== product.url_key,
    );
    items.unshift(product);
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(items.slice(0, MAX_ITEMS)),
    );
  } catch {
    // localStorage full or unavailable
  }
}
