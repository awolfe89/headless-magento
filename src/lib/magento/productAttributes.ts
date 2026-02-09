/**
 * Fetches all visible-on-front product attributes from the Magento REST API,
 * resolves option IDs to labels, and returns a clean specs array.
 */

import { magentoRestGet } from "./rest";

interface MagentoAttribute {
  attribute_code: string;
  default_frontend_label: string;
  frontend_input: string;
  options: Array<{ label: string; value: string }>;
}

interface MagentoAttributeSearchResult {
  items: MagentoAttribute[];
  total_count: number;
}

interface MagentoProduct {
  sku: string;
  name: string;
  custom_attributes: Array<{ attribute_code: string; value: string }>;
}

interface MagentoProductSearchResult {
  items: MagentoProduct[];
  total_count: number;
}

export interface SpecRow {
  label: string;
  value: string;
  code: string;
}

// Cache attribute metadata (rarely changes)
let attrCache: Map<string, MagentoAttribute> | null = null;
let attrCacheTime = 0;
const CACHE_TTL = 10 * 60 * 1000; // 10 min

// Attributes to exclude from specs display
const EXCLUDED_CODES = new Set([
  "image",
  "small_image",
  "thumbnail",
  "swatch_image",
  "image_label",
  "small_image_label",
  "thumbnail_label",
  "url_key",
  "meta_title",
  "meta_keyword",
  "meta_description",
  "description",
  "short_description",
  "options_container",
  "required_options",
  "has_options",
  "gift_message_available",
  "msrp_display_actual_price_type",
  "category_ids",
  "tax_class_id",
  "in_html_sitemap",
  "in_xml_sitemap",
  "use_in_crosslinking",
  "sw_featured",
  "product_page_type",
  "product_image_size",
  "msrp",
  "retail_price",
  "special_price",
  "special_from_date",
  "special_to_date",
  "news_from_date",
  "news_to_date",
]);

async function getAttributeMetadata(): Promise<Map<string, MagentoAttribute>> {
  if (attrCache && Date.now() - attrCacheTime < CACHE_TTL) {
    return attrCache;
  }

  const data = await magentoRestGet<MagentoAttributeSearchResult>(
    "/products/attributes?searchCriteria[filterGroups][0][filters][0][field]=is_visible_on_front&searchCriteria[filterGroups][0][filters][0][value]=1&searchCriteria[pageSize]=200",
  );

  const map = new Map<string, MagentoAttribute>();
  for (const attr of data.items) {
    map.set(attr.attribute_code, attr);
  }

  attrCache = map;
  attrCacheTime = Date.now();
  return map;
}

function resolveOptionLabel(
  attr: MagentoAttribute,
  rawValue: string,
): string | null {
  if (!rawValue || rawValue === "0" || rawValue === "no_selection") return null;

  const input = attr.frontend_input;

  if (input === "boolean") {
    return rawValue === "1" ? "Yes" : "No";
  }

  if (input === "select") {
    const opt = attr.options.find((o) => o.value === rawValue);
    return opt?.label || rawValue;
  }

  if (input === "multiselect") {
    const ids = rawValue.split(",");
    const labels = ids
      .map((id) => {
        const opt = attr.options.find((o) => o.value === id.trim());
        return opt?.label || null;
      })
      .filter(Boolean);
    return labels.length > 0 ? labels.join(", ") : null;
  }

  // text, price, weight, etc.
  return rawValue || null;
}

/**
 * Fetch full product specifications for a given SKU.
 * Returns an array of { label, value, code } for display in the specs tab.
 */
export async function getProductSpecs(sku: string): Promise<SpecRow[]> {
  try {
    const [attrMap, productResult] = await Promise.all([
      getAttributeMetadata(),
      magentoRestGet<MagentoProductSearchResult>(
        `/products?searchCriteria[filterGroups][0][filters][0][field]=sku&searchCriteria[filterGroups][0][filters][0][value]=${encodeURIComponent(sku)}&searchCriteria[pageSize]=1`,
      ),
    ]);

    const product = productResult.items?.[0];
    if (!product) return [];

    const specs: SpecRow[] = [];

    for (const attr of product.custom_attributes) {
      const code = attr.attribute_code;
      if (EXCLUDED_CODES.has(code)) continue;

      const meta = attrMap.get(code);
      if (!meta) continue; // attribute not visible on front

      const resolved = resolveOptionLabel(meta, attr.value);
      if (!resolved) continue;

      specs.push({
        label: meta.default_frontend_label,
        value: resolved,
        code,
      });
    }

    return specs;
  } catch (err) {
    console.error("Failed to fetch product specs:", err);
    return [];
  }
}
