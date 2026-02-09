"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

interface BlogSearchProps {
  defaultValue?: string;
}

export function BlogSearch({ defaultValue = "" }: BlogSearchProps) {
  const router = useRouter();
  const [value, setValue] = useState(defaultValue);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const q = value.trim();
    if (q) {
      router.push(`/blog?q=${encodeURIComponent(q)}`);
    } else {
      router.push("/blog");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="relative">
      <svg
        className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        strokeWidth="2"
      >
        <circle cx="11" cy="11" r="8" />
        <line x1="21" y1="21" x2="16.65" y2="16.65" />
      </svg>
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Search articles..."
        className="w-full rounded-lg border border-gray-700 bg-gray-800/60 py-3 pl-11 pr-4 text-sm text-white placeholder:text-gray-500 outline-none transition focus:border-red-500 focus:ring-2 focus:ring-red-500/20"
      />
    </form>
  );
}
