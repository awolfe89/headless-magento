"use client";

import { ErrorFallback } from "@/components/ui/ErrorFallback";

export default function ProductError({ reset }: { reset: () => void }) {
  return (
    <ErrorFallback
      title="Product Error"
      message="We couldn't load this product. It may be temporarily unavailable."
      reset={reset}
    />
  );
}
