import { ContactForm } from "@/components/contact/ContactForm";
import { Suspense } from "react";
import Link from "next/link";
import type { Metadata } from "next";

// Contact page is mostly static — revalidate daily
export const revalidate = 86400;

const PHONE = process.env.NEXT_PUBLIC_COMPANY_PHONE || "847-639-4700";
const EMAIL = process.env.NEXT_PUBLIC_COMPANY_EMAIL || "sales@technimark-inc.com";
const ADDRESS_LINES = (process.env.NEXT_PUBLIC_COMPANY_ADDRESS || "720 Industrial Dr, Cary, IL 60013").split(", ");

export const metadata: Metadata = {
  title: "Contact Us",
  description: `Get in touch with Technimark. Call us at ${PHONE} or send us a message.`,
};

const infoCards = [
  {
    icon: (
      <svg
        className="h-5 w-5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        strokeWidth="1.5"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z"
        />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z"
        />
      </svg>
    ),
    label: "Address",
    lines: ADDRESS_LINES,
  },
  {
    icon: (
      <svg
        className="h-5 w-5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
      </svg>
    ),
    label: "Phone",
    lines: [PHONE],
    href: `tel:${PHONE}`,
  },
  {
    icon: (
      <svg
        className="h-5 w-5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect width="20" height="16" x="2" y="4" rx="2" />
        <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
      </svg>
    ),
    label: "Email",
    lines: [EMAIL],
    href: `mailto:${EMAIL}`,
  },
  {
    icon: (
      <svg
        className="h-5 w-5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </svg>
    ),
    label: "Hours",
    lines: ["Mon – Fri: 8:00 AM – 5:00 PM CST", "Sat – Sun: Closed"],
  },
];

export default function ContactPage() {
  return (
    <div>
      {/* Hero */}
      <div className="bg-gradient-to-br from-gray-900 via-gray-900 to-gray-800">
        <div className="relative mx-auto max-w-7xl px-4 py-10">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_80%_50%,rgba(200,16,46,0.06)_0%,transparent_60%)]" />
          <div className="relative">
            <nav className="mb-3 text-sm text-gray-400">
              <Link href="/" className="transition hover:text-white">
                Home
              </Link>
              <span className="mx-2 text-gray-600">/</span>
              <span className="text-gray-200">Contact Us</span>
            </nav>
            <p className="mb-2 text-[13px] font-semibold uppercase tracking-[1.2px] text-red-500">
              Get in Touch
            </p>
            <h1 className="text-3xl font-bold text-white">Contact Us</h1>
            <p className="mt-3 max-w-xl text-gray-400">
              Questions about products, orders, or pricing? Our team is here to
              help.
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-7xl px-4 py-10">
        <div className="grid gap-10 lg:grid-cols-3">
          {/* Form */}
          <div className="lg:col-span-2">
            <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
              <div className="flex items-center gap-2 bg-gray-900 px-5 py-3">
                <span className="h-3.5 w-[3px] rounded-sm bg-red-600" />
                <h2 className="text-xs font-semibold uppercase tracking-[1px] text-gray-400">
                  Send a Message
                </h2>
              </div>
              <div className="p-6">
                <Suspense fallback={<div className="animate-pulse space-y-4"><div className="h-10 rounded bg-gray-200" /><div className="h-10 rounded bg-gray-200" /><div className="h-24 rounded bg-gray-200" /></div>}>
                  <ContactForm />
                </Suspense>
              </div>
            </div>
          </div>

          {/* Sidebar: company info */}
          <div className="space-y-4">
            {infoCards.map((card) => (
              <div
                key={card.label}
                className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm"
              >
                <div className="flex items-center gap-2 bg-gray-900 px-5 py-3">
                  <span className="h-3.5 w-[3px] rounded-sm bg-red-600" />
                  <h3 className="text-xs font-semibold uppercase tracking-[1px] text-gray-400">
                    {card.label}
                  </h3>
                </div>
                <div className="flex items-start gap-3 px-5 py-4">
                  <span className="mt-0.5 text-red-600">{card.icon}</span>
                  <div className="text-sm text-gray-700">
                    {card.lines.map((line) =>
                      card.href ? (
                        <a
                          key={line}
                          href={card.href}
                          className="block font-medium text-red-600 transition hover:text-red-700"
                        >
                          {line}
                        </a>
                      ) : (
                        <p key={line}>{line}</p>
                      ),
                    )}
                  </div>
                </div>
              </div>
            ))}

            {/* Quick help callout */}
            <div className="rounded-xl border border-blue-100 bg-blue-50 px-5 py-4">
              <p className="text-sm font-semibold text-blue-900">
                Need immediate help?
              </p>
              <p className="mt-1 text-xs text-blue-700">
                Call us directly at{" "}
                <a
                  href={`tel:${PHONE}`}
                  className="font-semibold underline underline-offset-2"
                >
                  {PHONE}
                </a>{" "}
                during business hours for the fastest response.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
