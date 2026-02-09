const MEDIA_URL =
  process.env.NEXT_PUBLIC_MAGENTO_MEDIA_URL || "https://magento.test/media";

export function parseDirectives(html: string): string {
  let output = html;

  // {{media url="wysiwyg/image.jpg"}} → full media URL
  output = output.replace(
    /\{\{media\s+url="([^"]+)"\}\}/g,
    (_, path) => `${MEDIA_URL}/${path}`,
  );

  // {{store url="some/path"}} → relative link
  output = output.replace(
    /\{\{store\s+url="([^"]+)"\}\}/g,
    (_, path) => `/${path}`,
  );

  // Strip directives that can't be rendered headlessly
  output = output.replace(/\{\{config\s+[^}]+\}\}/g, "");
  output = output.replace(/\{\{widget\s+[^}]*\}\}/g, "");
  output = output.replace(/\{\{block\s+[^}]*\}\}/g, "");

  // Basic XSS sanitization
  output = sanitizeHtml(output);

  return output;
}

/**
 * Lightweight HTML sanitizer — strips script tags, event handlers, and
 * javascript: URLs. Use on any HTML rendered via dangerouslySetInnerHTML.
 */
export function sanitizeHtml(html: string): string {
  let output = html;
  output = output.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "");
  output = output.replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, "");
  output = output.replace(/\bon\w+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi, "");
  output = output.replace(/href\s*=\s*["']javascript:[^"']*["']/gi, 'href="#"');
  output = output.replace(/src\s*=\s*["']javascript:[^"']*["']/gi, 'src=""');
  return output;
}
