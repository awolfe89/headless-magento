"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { isLoggedIn } from "@/lib/auth/token";

export function ContractPricingBanner() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    setShow(!isLoggedIn());
  }, []);

  if (!show) return null;

  return (
    <div className="mb-4 flex items-center gap-2 rounded-lg border border-blue-200/60 bg-blue-50/50 px-4 py-2.5 text-[13px] font-medium text-blue-700">
      <svg
        className="h-4 w-4 shrink-0"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        strokeWidth="1.5"
      >
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
        <path d="M7 11V7a5 5 0 0110 0v4" />
      </svg>
      <Link href="/customer/login" className="font-semibold text-blue-700 hover:underline">
        Sign in
      </Link>{" "}
      for contract pricing &amp; net terms
    </div>
  );
}
