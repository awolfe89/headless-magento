"use client";

import { ErrorFallback } from "@/components/ui/ErrorFallback";

export default function BlogPostError({ reset }: { reset: () => void }) {
  return (
    <ErrorFallback
      title="Blog Post Error"
      message="We couldn't load this article. Please try again."
      reset={reset}
    />
  );
}
