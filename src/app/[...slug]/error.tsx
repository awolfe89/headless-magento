"use client";

import { ErrorFallback } from "@/components/ui/ErrorFallback";

export default function CmsPageError({ reset }: { reset: () => void }) {
  return (
    <ErrorFallback
      title="Page Error"
      message="We couldn't load this page. Please try again."
      reset={reset}
    />
  );
}
