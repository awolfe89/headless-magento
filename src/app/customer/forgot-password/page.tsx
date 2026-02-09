"use client";

import { useState } from "react";
 
import { useMutation } from "@apollo/client/react";
import { REQUEST_PASSWORD_RESET } from "@/lib/graphql/mutations/customer";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [requestReset, { loading }] = useMutation<any>(REQUEST_PASSWORD_RESET);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg(null);

    try {
      await requestReset({ variables: { email } });
      setSubmitted(true);
    } catch (err) {
      // Magento always returns success for security (doesn't reveal if email exists)
      // but still show errors for network/server issues
      const msg = err instanceof Error ? err.message : "";
      if (msg.toLowerCase().includes("network")) {
        setErrorMsg("Network error. Please try again.");
      } else {
        // Treat as success — Magento doesn't confirm email existence
        setSubmitted(true);
      }
    }
  }

  const inputClass =
    "w-full h-[42px] px-3.5 bg-[#f8f8fb] border border-[#e2e2ea] rounded-md text-sm text-[#1e1e2e] outline-none transition-all placeholder:text-[#8e8e9e] placeholder:font-normal hover:border-[#d0d0da] focus:bg-white focus:border-[#c8102e] focus:shadow-[0_0_0_3px_rgba(200,16,46,0.15)]";

  return (
    <div className="min-h-screen bg-[#f5f5f8]">
      {/* Dark Header Strip */}
      <div className="relative overflow-hidden bg-gradient-to-br from-[#0f0f1a] to-[#1a1a2e] px-5 pb-20 pt-12 text-center">
        <div className="pointer-events-none absolute -left-[10%] -top-[40%] h-[180%] w-1/2 bg-[radial-gradient(ellipse,rgba(200,16,46,0.1)_0%,transparent_70%)]" />
        <div className="pointer-events-none absolute -bottom-[50%] -right-[10%] h-[160%] w-[45%] bg-[radial-gradient(ellipse,rgba(200,16,46,0.07)_0%,transparent_70%)]" />

        <div className="relative z-10">
          <h1 className="text-[26px] font-bold tracking-tight text-white">
            Reset Password
          </h1>
          <p className="mt-2 text-sm text-white/55">
            We&apos;ll send you instructions to reset your password
          </p>
        </div>
      </div>

      {/* Card */}
      <div className="relative z-[2] mx-auto -mt-11 max-w-[520px] px-5 pb-12">
        <div className="overflow-hidden rounded-[10px] bg-white shadow-[0_8px_32px_rgba(0,0,0,0.08),0_2px_8px_rgba(0,0,0,0.04)]">
          <div className="p-7">
            {submitted ? (
              /* Success state */
              <div className="text-center">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-green-100">
                  <svg
                    className="h-7 w-7 text-green-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    strokeWidth="2"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <h2 className="text-lg font-bold text-[#1e1e2e]">
                  Check Your Email
                </h2>
                <p className="mt-2 text-[13px] leading-relaxed text-[#5a5a6e]">
                  If an account exists for <strong>{email}</strong>, you&apos;ll
                  receive an email with instructions to reset your password.
                </p>
                <p className="mt-4 text-[13px] text-[#8e8e9e]">
                  Didn&apos;t receive it? Check your spam folder or{" "}
                  <button
                    onClick={() => {
                      setSubmitted(false);
                      setEmail("");
                    }}
                    className="font-medium text-[#c8102e] hover:underline"
                  >
                    try again
                  </button>
                </p>
                <Link
                  href="/customer/login"
                  className="mt-6 inline-block rounded-md bg-[#c8102e] px-7 py-2.5 text-sm font-semibold text-white transition-all hover:bg-[#a80d24]"
                >
                  Back to Sign In
                </Link>
              </div>
            ) : (
              /* Form */
              <>
                <p className="mb-5 text-[13px] leading-relaxed text-[#5a5a6e]">
                  Enter the email address associated with your account and
                  we&apos;ll send you a link to reset your password.
                </p>

                {errorMsg && (
                  <div className="mb-5 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {errorMsg}
                  </div>
                )}

                <form onSubmit={handleSubmit}>
                  <div className="mb-4">
                    <label className="mb-1.5 block text-[13px] font-medium text-[#5a5a6e]">
                      Email Address{" "}
                      <span className="ml-px text-[#c8102e]">*</span>
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      autoComplete="email"
                      placeholder="you@company.com"
                      className={inputClass}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="h-11 w-full rounded-md bg-[#c8102e] text-sm font-semibold text-white transition-all hover:bg-[#a80d24] hover:shadow-[0_2px_12px_rgba(200,16,46,0.15)] disabled:opacity-50"
                  >
                    {loading ? "Sending..." : "Reset My Password"}
                  </button>
                </form>

                <div className="mt-5 text-center">
                  <Link
                    href="/customer/login"
                    className="text-[13px] font-medium text-[#5a5a6e] transition-colors hover:text-[#c8102e]"
                  >
                    Back to Sign In
                  </Link>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Trust badges */}
      <div className="mx-auto max-w-[520px] px-5">
        <div className="flex flex-col items-center justify-center gap-2 sm:flex-row sm:gap-6">
          <span className="flex items-center gap-1.5 text-xs font-medium text-[#8e8e9e]">
            <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
            Veteran Owned
          </span>
          <span className="flex items-center gap-1.5 text-xs font-medium text-[#8e8e9e]">
            <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
              <polyline points="9,22 9,12 15,12 15,22" />
            </svg>
            Family Operated Since 1994
          </span>
          <span className="flex items-center gap-1.5 text-xs font-medium text-[#8e8e9e]">
            <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" />
            </svg>
            {process.env.NEXT_PUBLIC_COMPANY_PHONE || "847-639-4700"}
          </span>
        </div>
      </div>
    </div>
  );
}
