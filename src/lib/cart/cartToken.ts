const CART_TOKEN_KEY = "magento_cart_id";

// Magento guest carts expire after 24 hours of inactivity by default
const DEFAULT_EXPIRY_SEC = 24 * 60 * 60;

interface StoredCart {
  id: string;
  expiresAt: number;
}

export function getCartToken(): string | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(CART_TOKEN_KEY);
  if (!raw) return null;

  try {
    const stored: StoredCart = JSON.parse(raw);
    if (stored.expiresAt && Date.now() > stored.expiresAt) {
      localStorage.removeItem(CART_TOKEN_KEY);
      return null;
    }
    return stored.id;
  } catch {
    // Backward compat: old format was a plain cart ID string
    setCartToken(raw);
    return raw;
  }
}

export function setCartToken(
  id: string,
  expiresInSec: number = DEFAULT_EXPIRY_SEC,
): void {
  const stored: StoredCart = {
    id,
    expiresAt: Date.now() + expiresInSec * 1000,
  };
  localStorage.setItem(CART_TOKEN_KEY, JSON.stringify(stored));
}

export function clearCartToken(): void {
  localStorage.removeItem(CART_TOKEN_KEY);
}
