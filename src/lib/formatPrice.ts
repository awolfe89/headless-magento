/**
 * Format a number as a price string with commas and 2 decimal places.
 * e.g. 1193 → "1,193.00", 9.5 → "9.50"
 */
export function formatPrice(value: number): string {
  return value.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}
