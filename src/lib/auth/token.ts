const TOKEN_KEY = "magento_customer_token";

// Magento default customer token lifetime is 1 hour
const DEFAULT_EXPIRY_SEC = 3600;

interface StoredToken {
  token: string;
  expiresAt: number;
}

export function getCustomerToken(): string | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(TOKEN_KEY);
  if (!raw) return null;

  try {
    const stored: StoredToken = JSON.parse(raw);
    if (stored.expiresAt && Date.now() > stored.expiresAt) {
      // Token has expired — clear it proactively
      localStorage.removeItem(TOKEN_KEY);
      return null;
    }
    return stored.token;
  } catch {
    // Backward compat: old format was a plain token string
    // Migrate it with a fresh expiry window
    setCustomerToken(raw);
    return raw;
  }
}

export function setCustomerToken(
  token: string,
  expiresInSec: number = DEFAULT_EXPIRY_SEC,
): void {
  const stored: StoredToken = {
    token,
    expiresAt: Date.now() + expiresInSec * 1000,
  };
  localStorage.setItem(TOKEN_KEY, JSON.stringify(stored));
  window.dispatchEvent(new Event("auth-change"));
}

export function clearCustomerToken(): void {
  localStorage.removeItem(TOKEN_KEY);
  window.dispatchEvent(new Event("auth-change"));
}

export function isLoggedIn(): boolean {
  return !!getCustomerToken();
}
