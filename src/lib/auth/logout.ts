import { getCustomerToken, clearCustomerToken } from "./token";

const GRAPHQL_URL = process.env.NEXT_PUBLIC_MAGENTO_GRAPHQL_URL || "/api/graphql";

/**
 * Revokes the customer token on Magento's backend, then clears it locally.
 * Fire-and-forget — if revocation fails, local cleanup still happens.
 */
export async function revokeAndClear(): Promise<void> {
  const token = getCustomerToken();
  if (token) {
    try {
      await fetch(GRAPHQL_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          query: `mutation { revokeCustomerToken { result } }`,
        }),
      });
    } catch {
      // Best-effort — local cleanup still happens below
    }
  }
  clearCustomerToken();
}
