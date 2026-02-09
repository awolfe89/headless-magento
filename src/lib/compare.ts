const STORAGE_KEY = "tm_compare_products";
const MAX_ITEMS = 4;

export interface CompareProduct {
  uid: string;
  url_key: string;
  name: string;
  sku: string;
  image_url: string;
  price: number;
  currency: string;
  stock_status: string;
  manufacturer?: string | null;
}

export function getCompareProducts(): CompareProduct[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function addToCompare(product: CompareProduct): boolean {
  if (typeof window === "undefined") return false;
  const items = getCompareProducts();
  if (items.some((p) => p.uid === product.uid)) return false;
  if (items.length >= MAX_ITEMS) return false;
  items.push(product);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  window.dispatchEvent(new Event("compare-updated"));
  return true;
}

export function removeFromCompare(uid: string): void {
  if (typeof window === "undefined") return;
  const items = getCompareProducts().filter((p) => p.uid !== uid);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  window.dispatchEvent(new Event("compare-updated"));
}

export function clearCompare(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEY);
  window.dispatchEvent(new Event("compare-updated"));
}

export function isInCompare(uid: string): boolean {
  return getCompareProducts().some((p) => p.uid === uid);
}
