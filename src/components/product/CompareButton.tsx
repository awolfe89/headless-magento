"use client";

import { useState, useEffect } from "react";
import {
  addToCompare,
  removeFromCompare,
  isInCompare,
  type CompareProduct,
} from "@/lib/compare";

interface Props {
  product: CompareProduct;
}

export function CompareButton({ product }: Props) {
  const [inCompare, setInCompare] = useState(false);

  useEffect(() => {
    function onUpdate() {
      setInCompare(isInCompare(product.uid));
    }
    // Initial load via rAF to avoid synchronous setState in effect body
    const id = requestAnimationFrame(onUpdate);
    window.addEventListener("compare-updated", onUpdate);
    return () => {
      cancelAnimationFrame(id);
      window.removeEventListener("compare-updated", onUpdate);
    };
  }, [product.uid]);

  function handleClick() {
    if (inCompare) {
      removeFromCompare(product.uid);
    } else {
      const added = addToCompare(product);
      if (!added) {
        alert("Compare list is full (max 4 products).");
      }
    }
  }

  return (
    <button
      onClick={handleClick}
      className={`flex items-center gap-1 transition ${
        inCompare
          ? "text-blue-600 hover:text-blue-700"
          : "text-gray-400 hover:text-gray-600"
      }`}
    >
      <svg
        className="h-4 w-4"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        strokeWidth="1.5"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
        />
      </svg>
      {inCompare ? "In Compare" : "Compare"}
    </button>
  );
}
