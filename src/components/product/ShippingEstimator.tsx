"use client";

import { useState, useEffect } from "react";
import { formatPrice } from "@/lib/formatPrice";

interface ShippingEstimatorProps {
  price: number;
  /** Minimum order amount for free shipping, or null if not offered */
  freeShippingThreshold: number | null;
}

export function ShippingEstimator({ price, freeShippingThreshold }: ShippingEstimatorProps) {
  const [zip, setZip] = useState("");
  const [savedZip, setSavedZip] = useState<string | null>(null);

  useEffect(() => {
    const id = requestAnimationFrame(() => {
      const stored = localStorage.getItem("shipping_zip");
      if (stored) {
        setZip(stored);
        setSavedZip(stored);
      }
    });
    return () => cancelAnimationFrame(id);
  }, []);

  function handleSaveZip() {
    const trimmed = zip.trim();
    if (trimmed.length >= 5) {
      localStorage.setItem("shipping_zip", trimmed);
      setSavedZip(trimmed);
    }
  }

  const qualifiesForFree = freeShippingThreshold !== null && price >= freeShippingThreshold;

  return (
    <div className="mb-4 rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <h3 className="mb-3 flex items-center gap-2 text-[13px] font-semibold text-gray-900">
        <svg className="h-4 w-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10l2-1 2 1 2-1 2 1 2-1zm0 0h6a1 1 0 011 1v3a1 1 0 01-1 1h-1M6 20a2 2 0 100-4 2 2 0 000 4zm10 0a2 2 0 100-4 2 2 0 000 4z" />
        </svg>
        Shipping Estimate
        {savedZip && (
          <span className="ml-auto text-[11px] font-normal text-gray-400">
            to {savedZip}
          </span>
        )}
      </h3>

      {/* Zip code input */}
      <div className="mb-3 flex gap-2">
        <input
          type="text"
          inputMode="numeric"
          maxLength={5}
          placeholder="Enter ZIP code"
          value={zip}
          onChange={(e) => setZip(e.target.value.replace(/\D/g, ""))}
          onKeyDown={(e) => e.key === "Enter" && handleSaveZip()}
          className="flex-1 rounded-lg border border-gray-200 px-3 py-2 text-xs text-gray-900 outline-none placeholder:text-gray-400 focus:border-red-300 focus:ring-1 focus:ring-red-100"
        />
        <button
          onClick={handleSaveZip}
          disabled={zip.trim().length < 5}
          className="rounded-lg bg-gray-900 px-4 py-2 text-xs font-medium text-white transition hover:bg-gray-700 disabled:opacity-40"
        >
          Estimate
        </button>
      </div>

      {savedZip ? (
        <div className="space-y-0 divide-y divide-gray-100 text-[13px]">
          <div className="flex items-center justify-between py-2">
            <span className="font-medium text-gray-900">Ground</span>
            <span className="text-gray-400">Est. 3–5 business days</span>
            <span className="font-mono text-xs font-semibold text-gray-900">$8.95</span>
          </div>
          <div className="flex items-center justify-between py-2">
            <span className="font-medium text-gray-900">2-Day Express</span>
            <span className="text-gray-400">Est. 2 business days</span>
            <span className="font-mono text-xs font-semibold text-gray-900">$18.50</span>
          </div>
          {freeShippingThreshold !== null && qualifiesForFree && (
            <div className="flex items-center justify-between py-2">
              <div className="flex items-center gap-1.5">
                <svg className="h-4 w-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="font-medium text-green-700">Free Ground Shipping</span>
              </div>
              <span className="text-xs font-semibold text-green-600">Eligible!</span>
            </div>
          )}
          {freeShippingThreshold !== null && !qualifiesForFree && (
            <div className="flex items-center justify-between py-2">
              <span className="font-medium text-gray-500">Free Ground</span>
              <span className="text-xs text-gray-400">
                Orders ${freeShippingThreshold}+
              </span>
              <span className="text-xs text-gray-400">
                Add ${formatPrice(freeShippingThreshold - price)} more
              </span>
            </div>
          )}
        </div>
      ) : (
        <p className="text-xs text-gray-400">
          Enter your ZIP code to see estimated shipping rates.
        </p>
      )}
    </div>
  );
}
