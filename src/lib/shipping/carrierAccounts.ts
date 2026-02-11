import type { SavedCarrierAccount } from "./types";

const LOCAL_KEY = "saved_carrier_accounts";

/* ─── localStorage (guests) ─── */

export function getLocalAccounts(): SavedCarrierAccount[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(LOCAL_KEY);
    return raw ? (JSON.parse(raw) as SavedCarrierAccount[]) : [];
  } catch {
    return [];
  }
}

export function saveLocalAccounts(accounts: SavedCarrierAccount[]): void {
  localStorage.setItem(LOCAL_KEY, JSON.stringify(accounts));
}

/* ─── API (logged-in customers) ─── */

export async function fetchSavedAccounts(
  customerToken: string,
): Promise<SavedCarrierAccount[]> {
  const res = await fetch("/api/carrier-accounts", {
    headers: { Authorization: `Bearer ${customerToken}` },
  });
  if (!res.ok) return [];
  return res.json();
}

export async function updateSavedAccounts(
  customerToken: string,
  accounts: SavedCarrierAccount[],
): Promise<boolean> {
  const res = await fetch("/api/carrier-accounts", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${customerToken}`,
    },
    body: JSON.stringify({ accounts }),
  });
  return res.ok;
}
