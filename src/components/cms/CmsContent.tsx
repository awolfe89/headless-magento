import { parseDirectives } from "@/lib/cms/parseDirectives";

interface CmsContentProps {
  html: string;
  className?: string;
}

export function CmsContent({ html, className }: CmsContentProps) {
  const processedHtml = parseDirectives(html);

  return (
    <div
      className={`prose prose-gray max-w-none prose-headings:font-bold prose-headings:text-gray-900 prose-h1:text-3xl prose-h2:text-2xl prose-h3:text-xl prose-a:text-red-600 prose-a:no-underline hover:prose-a:underline prose-img:rounded-lg prose-table:text-sm prose-th:bg-gray-50 prose-th:text-left prose-td:border-gray-200 ${className || ""}`}
      dangerouslySetInnerHTML={{ __html: processedHtml }}
    />
  );
}
