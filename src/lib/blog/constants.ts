/**
 * Blog category slugs to exclude from display.
 * These are PDF/SDS document categories, not article categories.
 * Shared between the main blog page and category pages.
 */
export const EXCLUDED_SLUGS = new Set([
  "manufacturer-pdfs",
  "sds",
  "spanish-manufacturer-pdfs",
  "techspray-sdss",
  "techspray-pdfs",
  "chemtronics-pdfs",
  "desco-pdfs",
  "hakko-pdfs",
  "jbc-tools-pdfs",
]);
