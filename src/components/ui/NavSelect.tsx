"use client";

/**
 * A <select> that navigates to a new URL on change.
 * Used for sort/page-size controls on Server Component pages.
 */
export function NavSelect({
  value,
  options,
  className,
  ariaLabel,
}: {
  value: string;
  options: { value: string; label: string }[];
  className?: string;
  ariaLabel?: string;
}) {
  return (
    <select
      value={value}
      onChange={(e) => {
        window.location.href = e.target.value;
      }}
      className={className}
      aria-label={ariaLabel}
    >
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  );
}
