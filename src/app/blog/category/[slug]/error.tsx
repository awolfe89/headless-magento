"use client";

import { ErrorFallback } from "@/components/ui/ErrorFallback";

export default function BlogCategoryError({ reset }: { reset: () => void }) {
  return (
    <ErrorFallback
      title="Blog Category Error"
      message="We couldn't load this blog category. Please try again."
      reset={reset}
    />
  );
}
