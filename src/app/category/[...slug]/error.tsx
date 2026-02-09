"use client";

import { ErrorFallback } from "@/components/ui/ErrorFallback";

export default function CategoryError({ reset }: { reset: () => void }) {
  return (
    <ErrorFallback
      title="Category Error"
      message="We couldn't load this category. Please try again."
      reset={reset}
    />
  );
}
