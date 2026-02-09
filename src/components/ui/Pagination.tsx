import Link from "next/link";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  basePath: string;
  searchParams?: Record<string, string>;
}

function buildHref(
  basePath: string,
  page: number,
  searchParams: Record<string, string>,
) {
  const params = new URLSearchParams(searchParams);
  if (page > 1) {
    params.set("page", String(page));
  } else {
    params.delete("page");
  }
  const qs = params.toString();
  return qs ? `${basePath}?${qs}` : basePath;
}

export function Pagination({
  currentPage,
  totalPages,
  basePath,
  searchParams = {},
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const maxVisible = 5;
  let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
  const end = Math.min(totalPages, start + maxVisible - 1);
  if (end - start + 1 < maxVisible) {
    start = Math.max(1, end - maxVisible + 1);
  }
  const pages = Array.from({ length: end - start + 1 }, (_, i) => start + i);

  const btnBase =
    "rounded border px-3 py-2 text-sm font-medium transition-colors";
  const btnNormal = "border-gray-300 text-gray-700 hover:bg-gray-50";
  const btnActive = "border-red-600 bg-red-600 text-white";

  return (
    <nav className="mt-8 flex items-center justify-center gap-1.5">
      {currentPage > 1 && (
        <Link
          href={buildHref(basePath, currentPage - 1, searchParams)}
          className={`${btnBase} ${btnNormal}`}
        >
          Previous
        </Link>
      )}
      {start > 1 && (
        <>
          <Link
            href={buildHref(basePath, 1, searchParams)}
            className={`${btnBase} ${btnNormal}`}
          >
            1
          </Link>
          {start > 2 && (
            <span className="px-1.5 text-gray-400">...</span>
          )}
        </>
      )}
      {pages.map((page) => (
        <Link
          key={page}
          href={buildHref(basePath, page, searchParams)}
          className={`${btnBase} ${page === currentPage ? btnActive : btnNormal}`}
        >
          {page}
        </Link>
      ))}
      {end < totalPages && (
        <>
          {end < totalPages - 1 && (
            <span className="px-1.5 text-gray-400">...</span>
          )}
          <Link
            href={buildHref(basePath, totalPages, searchParams)}
            className={`${btnBase} ${btnNormal}`}
          >
            {totalPages}
          </Link>
        </>
      )}
      {currentPage < totalPages && (
        <Link
          href={buildHref(basePath, currentPage + 1, searchParams)}
          className={`${btnBase} ${btnNormal}`}
        >
          Next
        </Link>
      )}
    </nav>
  );
}
