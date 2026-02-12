"use client";

import { useState } from "react";
 
import { useMutation, useLazyQuery } from "@apollo/client/react";
import {
  GENERATE_CUSTOMER_TOKEN,
  CREATE_CUSTOMER,
} from "@/lib/graphql/mutations/customer";
import { MERGE_CARTS } from "@/lib/graphql/mutations/cart";
import { CUSTOMER_CART_QUERY } from "@/lib/graphql/queries/cart";
import { setCustomerToken } from "@/lib/auth/token";
import { getCartToken, clearCartToken, setCartToken } from "@/lib/cart/cartToken";

export default function LoginRegisterPage() {
  const [activeTab, setActiveTab] = useState<"signin" | "register">("signin");

  /* ─── Login state ─── */
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState<string | null>(null);

  /* ─── Register state ─── */
  const [regFirstname, setRegFirstname] = useState("");
  const [regLastname, setRegLastname] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regConfirmPassword, setRegConfirmPassword] = useState("");
  const [regNewsletter, setRegNewsletter] = useState(false);
  const [accountType, setAccountType] = useState<"new" | "existing">("new");
  const [sageCustomerNum, setSageCustomerNum] = useState("");
  const [sageZip, setSageZip] = useState("");
  const [regError, setRegError] = useState<string | null>(null);

  /* ─── Mutations ─── */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [generateToken, { loading: loginLoading }] = useMutation<any>(
    GENERATE_CUSTOMER_TOKEN,
  );
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [createCustomer, { loading: registerLoading }] = useMutation<any>(
    CREATE_CUSTOMER,
  );
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [autoLoginToken, { loading: autoLoginLoading }] = useMutation<any>(
    GENERATE_CUSTOMER_TOKEN,
  );
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [mergeCarts] = useMutation<any>(MERGE_CARTS);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [fetchCustomerCart] = useLazyQuery<any>(CUSTOMER_CART_QUERY, {
    fetchPolicy: "network-only",
  });

  const isRegistering = registerLoading || autoLoginLoading;

  /** After login, restore the customer's cart (merging any guest cart) */
  async function restoreCustomerCart() {
    const guestCartId = getCartToken();

    if (guestCartId) {
      // Merge guest cart into customer cart
      try {
        const { data } = await mergeCarts({
          variables: { sourceCartId: guestCartId },
        });
        if (data?.mergeCarts?.id) {
          setCartToken(data.mergeCarts.id);
        }
      } catch {
        clearCartToken();
      }
    } else {
      // No guest cart — fetch the customer's existing cart
      try {
        const { data } = await fetchCustomerCart();
        if (data?.customerCart?.id) {
          setCartToken(data.customerCart.id);
        }
      } catch {
        // Non-critical
      }
    }

    window.dispatchEvent(new Event("cart-updated"));
  }

  /* ─── Login handler ─── */
  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoginError(null);

    try {
      const { data } = await generateToken({
        variables: { email: loginEmail, password: loginPassword },
      });

      setCustomerToken(data.generateCustomerToken.token);
      await restoreCustomerCart();
      window.location.href = "/account";
    } catch (err) {
      setLoginError(
        err instanceof Error ? err.message : "Invalid email or password.",
      );
    }
  }

  /* ─── Register handler ─── */
  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setRegError(null);

    if (regPassword !== regConfirmPassword) {
      setRegError("Passwords do not match.");
      return;
    }

    try {
      await createCustomer({
        variables: {
          firstname: regFirstname,
          lastname: regLastname,
          email: regEmail,
          password: regPassword,
        },
      });

      // Auto-login after successful registration
      const { data } = await autoLoginToken({
        variables: { email: regEmail, password: regPassword },
      });

      setCustomerToken(data.generateCustomerToken.token);
      await restoreCustomerCart();
      window.location.href = "/account";
    } catch (err) {
      setRegError(
        err instanceof Error
          ? err.message
          : "Failed to create account. Please try again.",
      );
    }
  }

  const inputClass =
    "w-full h-[42px] px-3.5 bg-[#f8f8fb] border border-[#e2e2ea] rounded-md text-sm text-[#1e1e2e] outline-none transition-all placeholder:text-[#8e8e9e] placeholder:font-normal hover:border-[#d0d0da] focus:bg-white focus:border-[#c8102e] focus:shadow-[0_0_0_3px_rgba(200,16,46,0.15)]";

  return (
    <div className="min-h-screen bg-[#f5f5f8]">
      {/* ── Dark Header Strip ── */}
      <div className="relative overflow-hidden bg-gradient-to-br from-[#0f0f1a] to-[#1a1a2e] px-5 pb-20 pt-12 text-center">
        {/* Ambient glow left */}
        <div className="pointer-events-none absolute -left-[10%] -top-[40%] h-[180%] w-1/2 bg-[radial-gradient(ellipse,rgba(200,16,46,0.1)_0%,transparent_70%)]" />
        {/* Ambient glow right */}
        <div className="pointer-events-none absolute -bottom-[50%] -right-[10%] h-[160%] w-[45%] bg-[radial-gradient(ellipse,rgba(200,16,46,0.07)_0%,transparent_70%)]" />

        <div className="relative z-10">
          <h1 className="text-[26px] font-bold tracking-tight text-white">
            Your Account
          </h1>
          <p className="mt-2 text-sm text-white/55">
            Sign in or create an account to manage orders and access pricing
          </p>
        </div>
      </div>

      {/* ── Single Card ── */}
      <div className="relative z-[2] mx-auto -mt-11 max-w-[520px] px-5 pb-12">
        <div className="overflow-hidden rounded-[10px] bg-white shadow-[0_8px_32px_rgba(0,0,0,0.08),0_2px_8px_rgba(0,0,0,0.04)]">
          {/* Tab Navigation */}
          <div className="flex border-b border-[#e2e2ea]">
            <button
              onClick={() => setActiveTab("signin")}
              className={`relative flex-1 py-4 px-5 text-sm font-semibold transition-colors ${
                activeTab === "signin"
                  ? "text-[#c8102e]"
                  : "text-[#8e8e9e] hover:text-[#5a5a6e]"
              }`}
            >
              Sign In
              <span
                className={`absolute bottom-[-1px] left-5 right-5 h-0.5 rounded-t bg-[#c8102e] transition-transform duration-[250ms] ${
                  activeTab === "signin" ? "scale-x-100" : "scale-x-0"
                }`}
              />
            </button>
            <button
              onClick={() => setActiveTab("register")}
              className={`relative flex-1 py-4 px-5 text-sm font-semibold transition-colors ${
                activeTab === "register"
                  ? "text-[#c8102e]"
                  : "text-[#8e8e9e] hover:text-[#5a5a6e]"
              }`}
            >
              Create Account
              <span
                className={`absolute bottom-[-1px] left-5 right-5 h-0.5 rounded-t bg-[#c8102e] transition-transform duration-[250ms] ${
                  activeTab === "register" ? "scale-x-100" : "scale-x-0"
                }`}
              />
            </button>
          </div>

          {/* ═══ SIGN IN PANEL ═══ */}
          {activeTab === "signin" && (
            <div className="animate-fadeIn p-7">
              <p className="mb-5 text-[13px] leading-relaxed text-[#5a5a6e]">
                Sign in with your email address to access your account, order
                history, and custom pricing.
              </p>

              {loginError && (
                <div className="mb-5 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {loginError}
                </div>
              )}

              <form onSubmit={handleLogin}>
                <div className="mb-4">
                  <label className="mb-1.5 block text-[13px] font-medium text-[#5a5a6e]">
                    Email <span className="ml-px text-[#c8102e]">*</span>
                  </label>
                  <input
                    type="email"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    required
                    autoComplete="email"
                    placeholder="you@company.com"
                    className={inputClass}
                  />
                </div>

                <div className="mb-4">
                  <label className="mb-1.5 block text-[13px] font-medium text-[#5a5a6e]">
                    Password <span className="ml-px text-[#c8102e]">*</span>
                  </label>
                  <input
                    type="password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    required
                    autoComplete="current-password"
                    placeholder="Enter your password"
                    className={inputClass}
                  />
                </div>

                <div className="mt-5 flex flex-col-reverse items-center justify-between gap-3.5 sm:flex-row">
                  <a
                    href="/customer/forgot-password"
                    className="text-[13px] font-medium text-[#5a5a6e] transition-colors hover:text-[#c8102e]"
                  >
                    Forgot your password?
                  </a>
                  <button
                    type="submit"
                    disabled={loginLoading}
                    className="w-full rounded-md bg-[#c8102e] px-7 py-2.5 text-sm font-semibold text-white transition-all hover:bg-[#a80d24] hover:shadow-[0_2px_12px_rgba(200,16,46,0.15)] disabled:opacity-50 sm:w-auto"
                  >
                    {loginLoading ? "Signing in..." : "Sign In"}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* ═══ REGISTER PANEL ═══ */}
          {activeTab === "register" && (
            <div className="animate-fadeIn p-7">
              {regError && (
                <div className="mb-5 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {regError}
                </div>
              )}

              <form onSubmit={handleRegister}>
                {/* Personal Info */}
                <div className="mb-4 grid grid-cols-1 gap-3.5 sm:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-[13px] font-medium text-[#5a5a6e]">
                      First Name{" "}
                      <span className="ml-px text-[#c8102e]">*</span>
                    </label>
                    <input
                      type="text"
                      value={regFirstname}
                      onChange={(e) => setRegFirstname(e.target.value)}
                      required
                      autoComplete="given-name"
                      placeholder="First name"
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-[13px] font-medium text-[#5a5a6e]">
                      Last Name{" "}
                      <span className="ml-px text-[#c8102e]">*</span>
                    </label>
                    <input
                      type="text"
                      value={regLastname}
                      onChange={(e) => setRegLastname(e.target.value)}
                      required
                      autoComplete="family-name"
                      placeholder="Last name"
                      className={inputClass}
                    />
                  </div>
                </div>

                <div className="mb-4">
                  <label className="mb-1.5 block text-[13px] font-medium text-[#5a5a6e]">
                    Email <span className="ml-px text-[#c8102e]">*</span>
                  </label>
                  <input
                    type="email"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    required
                    autoComplete="email"
                    placeholder="you@company.com"
                    className={inputClass}
                  />
                </div>

                <div className="mb-4 grid grid-cols-1 gap-3.5 sm:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-[13px] font-medium text-[#5a5a6e]">
                      Password{" "}
                      <span className="ml-px text-[#c8102e]">*</span>
                    </label>
                    <input
                      type="password"
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      required
                      autoComplete="new-password"
                      placeholder="Min. 8 characters"
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-[13px] font-medium text-[#5a5a6e]">
                      Confirm Password{" "}
                      <span className="ml-px text-[#c8102e]">*</span>
                    </label>
                    <input
                      type="password"
                      value={regConfirmPassword}
                      onChange={(e) => setRegConfirmPassword(e.target.value)}
                      required
                      autoComplete="new-password"
                      placeholder="Confirm password"
                      className={inputClass}
                    />
                  </div>
                </div>

                {/* Newsletter checkbox */}
                <div className="mb-4 flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="newsletter"
                    checked={regNewsletter}
                    onChange={(e) => setRegNewsletter(e.target.checked)}
                    className="h-[15px] w-[15px] shrink-0 cursor-pointer accent-[#c8102e]"
                  />
                  <label
                    htmlFor="newsletter"
                    className="cursor-pointer text-[13px] text-[#5a5a6e]"
                  >
                    Sign up for our newsletter
                  </label>
                </div>

                {/* Account Linking divider */}
                <div className="my-5 flex items-center gap-3">
                  <div className="h-px flex-1 bg-[#e2e2ea]" />
                  <span className="whitespace-nowrap text-[11px] font-semibold uppercase tracking-[0.8px] text-[#8e8e9e]">
                    Account Linking
                  </span>
                  <div className="h-px flex-1 bg-[#e2e2ea]" />
                </div>

                {/* Account type toggle */}
                <div className="mb-4 flex rounded-md border border-[#e2e2ea] bg-[#f5f5f8] p-[3px]">
                  <input
                    type="radio"
                    name="account_type"
                    id="new-customer"
                    checked={accountType === "new"}
                    onChange={() => setAccountType("new")}
                    className="hidden"
                  />
                  <label
                    htmlFor="new-customer"
                    className={`flex-1 cursor-pointer rounded py-2.5 text-center text-[12.5px] font-medium transition-all ${
                      accountType === "new"
                        ? "bg-white text-[#1e1e2e] shadow-[0_1px_3px_rgba(0,0,0,0.04),0_1px_2px_rgba(0,0,0,0.06)]"
                        : "text-[#8e8e9e]"
                    }`}
                  >
                    I&apos;m a new customer
                  </label>
                  <input
                    type="radio"
                    name="account_type"
                    id="existing-customer"
                    checked={accountType === "existing"}
                    onChange={() => setAccountType("existing")}
                    className="hidden"
                  />
                  <label
                    htmlFor="existing-customer"
                    className={`flex-1 cursor-pointer rounded py-2.5 text-center text-[12.5px] font-medium transition-all ${
                      accountType === "existing"
                        ? "bg-white text-[#1e1e2e] shadow-[0_1px_3px_rgba(0,0,0,0.04),0_1px_2px_rgba(0,0,0,0.06)]"
                        : "text-[#8e8e9e]"
                    }`}
                  >
                    I have a Technimark account
                  </label>
                </div>

                {/* Sage fields (slide in/out) */}
                <div
                  className={`grid grid-cols-1 gap-3.5 overflow-hidden transition-all duration-300 sm:grid-cols-2 ${
                    accountType === "existing"
                      ? "mb-4 max-h-[180px] opacity-100 sm:max-h-[120px]"
                      : "max-h-0 opacity-0"
                  }`}
                >
                  <div>
                    <label className="mb-1.5 block text-[13px] font-medium text-[#5a5a6e]">
                      Customer Number{" "}
                      <span className="ml-px text-[#c8102e]">*</span>
                    </label>
                    <input
                      type="text"
                      value={sageCustomerNum}
                      onChange={(e) => setSageCustomerNum(e.target.value)}
                      disabled={accountType === "new"}
                      placeholder="Account number"
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-[13px] font-medium text-[#5a5a6e]">
                      Zip / Postal Code{" "}
                      <span className="ml-px text-[#c8102e]">*</span>
                    </label>
                    <input
                      type="text"
                      value={sageZip}
                      onChange={(e) => setSageZip(e.target.value)}
                      disabled={accountType === "new"}
                      placeholder="Billing zip"
                      className={inputClass}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isRegistering}
                  className="h-11 w-full rounded-md bg-[#c8102e] text-sm font-semibold text-white transition-all hover:bg-[#a80d24] hover:shadow-[0_2px_12px_rgba(200,16,46,0.15)] disabled:opacity-50"
                >
                  {isRegistering ? "Creating Account..." : "Create Account"}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>

      {/* ── Trust / Help ── */}
      <div className="mx-auto max-w-[520px] px-5">
        <div className="flex flex-col items-center justify-center gap-2 sm:flex-row sm:gap-6">
          <span className="flex items-center gap-1.5 text-xs font-medium text-[#8e8e9e]">
            <svg
              className="h-3.5 w-3.5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
            Veteran Owned
          </span>
          <span className="flex items-center gap-1.5 text-xs font-medium text-[#8e8e9e]">
            <svg
              className="h-3.5 w-3.5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
              <polyline points="9,22 9,12 15,12 15,22" />
            </svg>
            Family Operated Since 1994
          </span>
          <span className="flex items-center gap-1.5 text-xs font-medium text-[#8e8e9e]">
            <svg
              className="h-3.5 w-3.5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" />
            </svg>
            {process.env.NEXT_PUBLIC_COMPANY_PHONE || "847-639-4700"}
          </span>
        </div>
        <p className="mt-5 text-center text-[13px] text-[#8e8e9e]">
          Need help?{" "}
          <a
            href="/contact"
            className="font-medium text-[#c8102e] hover:underline"
          >
            Contact us
          </a>{" "}
          · Mon–Fri, 8am–5pm CST
        </p>
      </div>
    </div>
  );
}
