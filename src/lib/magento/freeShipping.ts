/**
 * Fetches the free shipping threshold from Magento cart price rules.
 * Looks for active rules that grant free shipping with a subtotal condition.
 * Falls back to null if no free shipping rule is found or the API call fails.
 */

import { magentoRestGet } from "./rest";

interface CartRuleCondition {
  condition_type: string;
  attribute_name?: string;
  operator?: string;
  value?: string;
  conditions?: CartRuleCondition[];
}

interface CartRule {
  rule_id: number;
  name: string;
  is_active: boolean;
  simple_free_shipping?: string; // "0" = no, "1" = for matching items, "2" = for shipment
  condition?: CartRuleCondition;
}

interface CartRuleSearchResult {
  items: CartRule[];
  total_count: number;
}

let cachedThreshold: number | null | undefined;
let cacheExpiresAt = 0;

/**
 * Returns the minimum order amount for free shipping, or null if
 * free shipping is not currently offered.
 */
export async function getFreeShippingThreshold(): Promise<number | null> {
  // Cache for 10 minutes
  if (cachedThreshold !== undefined && Date.now() < cacheExpiresAt) {
    return cachedThreshold;
  }

  try {
    // Fetch active cart rules that provide free shipping
    const result = await magentoRestGet<CartRuleSearchResult>(
      `/salesRules/search?` +
        `searchCriteria[filter_groups][0][filters][0][field]=is_active` +
        `&searchCriteria[filter_groups][0][filters][0][value]=1` +
        `&searchCriteria[filter_groups][1][filters][0][field]=simple_free_shipping` +
        `&searchCriteria[filter_groups][1][filters][0][value]=0` +
        `&searchCriteria[filter_groups][1][filters][0][condition_type]=neq` +
        `&searchCriteria[pageSize]=20`,
    );

    const rules = result.items || [];

    // Find the lowest subtotal threshold among active free shipping rules
    let threshold: number | null = null;

    for (const rule of rules) {
      if (!rule.condition?.conditions) continue;

      // Look through conditions for a subtotal >= or > condition
      for (const cond of rule.condition.conditions) {
        if (
          cond.attribute_name === "base_subtotal" &&
          (cond.operator === ">=" || cond.operator === ">") &&
          cond.value
        ) {
          const val = parseFloat(cond.value);
          if (!isNaN(val) && (threshold === null || val < threshold)) {
            threshold = val;
          }
        }

        // Also check nested conditions
        if (cond.conditions) {
          for (const nested of cond.conditions) {
            if (
              nested.attribute_name === "base_subtotal" &&
              (nested.operator === ">=" || nested.operator === ">") &&
              nested.value
            ) {
              const val = parseFloat(nested.value);
              if (!isNaN(val) && (threshold === null || val < threshold)) {
                threshold = val;
              }
            }
          }
        }
      }
    }

    cachedThreshold = threshold;
    cacheExpiresAt = Date.now() + 10 * 60 * 1000;
    return threshold;
  } catch (err) {
    console.error("Failed to fetch free shipping threshold:", err);
    cachedThreshold = null;
    cacheExpiresAt = Date.now() + 5 * 60 * 1000; // retry sooner on error
    return null;
  }
}
