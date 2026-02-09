"use client";

import { useEffect, useState } from "react";
import { sanitizeHtml } from "@/lib/cms/parseDirectives";

interface Props {
  /** HTML content from CMS block. If empty/null, bar won't render. */
  content?: string | null;
}

export function AnnouncementBar({ content }: Props) {
  const [dismissed, setDismissed] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Check sessionStorage — dismissed bars stay hidden for the session
    const wasDismissed = sessionStorage.getItem("tm_announcement_dismissed");
    if (!wasDismissed && content) {
      setVisible(true);
    }
  }, [content]);

  // Strip HTML and check if there's actual text content
  const strippedContent = content?.replace(/<[^>]*>/g, "").trim();
  if (!strippedContent || dismissed || !visible) return null;

  function handleDismiss() {
    setDismissed(true);
    sessionStorage.setItem("tm_announcement_dismissed", "1");
  }

  return (
    <div className="relative bg-red-600 text-white">
      <div className="mx-auto flex max-w-7xl items-center justify-center px-10 py-2">
        <div
          className="text-center text-[13px] font-medium [&_a]:underline [&_a]:decoration-white/40 [&_a]:underline-offset-2 hover:[&_a]:decoration-white"
          dangerouslySetInnerHTML={{ __html: sanitizeHtml(content!) }}
        />
      </div>
      <button
        onClick={handleDismiss}
        className="absolute right-3 top-1/2 -translate-y-1/2 rounded p-1 text-white/60 transition hover:text-white"
        aria-label="Dismiss announcement"
      >
        <svg
          className="h-3.5 w-3.5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          strokeWidth="2.5"
        >
          <path strokeLinecap="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}
