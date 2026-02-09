"use client";

import { useState, useCallback, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { formatPhone } from "@/lib/validation";

interface FormState {
  name: string;
  email: string;
  phone: string;
  company: string;
  subject: string;
  message: string;
}

const inputClass =
  "w-full rounded-lg border border-gray-200 bg-white px-3.5 py-2.5 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-red-300 focus:ring-2 focus:ring-red-100";

export function ContactForm() {
  const searchParams = useSearchParams();
  const [form, setForm] = useState<FormState>({
    name: "",
    email: "",
    phone: "",
    company: "",
    subject: "",
    message: "",
  });

  // Prefill from URL params (e.g., from "Request Bulk Quote" on PDP)
  useEffect(() => {
    const subject = searchParams.get("subject");
    const message = searchParams.get("message");
    if (subject || message) {
      setForm((f) => ({
        ...f,
        ...(subject && { subject }),
        ...(message && { message }),
      }));
    }
  }, [searchParams]);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const update = useCallback(
    (
      e: React.ChangeEvent<
        HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
      >,
    ) => {
      const { name, value } = e.target;
      if (name === "phone") {
        setForm((f) => ({ ...f, phone: formatPhone(value) }));
      } else {
        setForm((f) => ({ ...f, [name]: value }));
      }
    },
    [],
  );

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || "Failed to send");
      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <div className="rounded-xl border border-green-200 bg-green-50 px-6 py-12 text-center">
        <svg
          className="mx-auto mb-4 h-12 w-12 text-green-500"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          strokeWidth="2"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <h3 className="text-lg font-bold text-gray-900">Message Sent!</h3>
        <p className="mt-2 text-sm text-gray-600">
          Thank you for reaching out. We&apos;ll get back to you within one
          business day.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Name + Email */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700">
            Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="name"
            value={form.name}
            onChange={update}
            required
            placeholder="Your full name"
            className={inputClass}
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700">
            Email <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={update}
            required
            placeholder="you@company.com"
            className={inputClass}
          />
        </div>
      </div>

      {/* Phone + Company */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700">
            Phone
          </label>
          <input
            type="tel"
            name="phone"
            value={form.phone}
            onChange={update}
            placeholder="(555) 555-5555"
            maxLength={14}
            className={inputClass}
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700">
            Company
          </label>
          <input
            type="text"
            name="company"
            value={form.company}
            onChange={update}
            placeholder="Company name"
            className={inputClass}
          />
        </div>
      </div>

      {/* Subject */}
      <div>
        <label className="mb-1.5 block text-sm font-medium text-gray-700">
          Subject
        </label>
        <select
          name="subject"
          value={form.subject}
          onChange={update}
          className={inputClass}
        >
          <option value="">Select a topic...</option>
          <option value="Product Inquiry">Product Inquiry</option>
          <option value="Bulk Quote">Bulk Quote</option>
          <option value="Order Status">Order Status</option>
          <option value="Pricing / Quote">Pricing / Quote</option>
          <option value="Technical Support">Technical Support</option>
          <option value="Returns / Warranty">Returns / Warranty</option>
          <option value="Partner Managed Inventory">
            Partner Managed Inventory
          </option>
          <option value="Other">Other</option>
        </select>
      </div>

      {/* Message */}
      <div>
        <label className="mb-1.5 block text-sm font-medium text-gray-700">
          Message <span className="text-red-500">*</span>
        </label>
        <textarea
          name="message"
          value={form.message}
          onChange={update}
          required
          rows={5}
          placeholder="How can we help you?"
          className={inputClass}
        />
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={submitting}
        className="flex w-full items-center justify-center gap-2 rounded-lg bg-red-600 px-8 py-3 text-sm font-semibold text-white transition hover:bg-red-700 disabled:opacity-50 sm:w-auto"
      >
        {submitting ? (
          <>
            <svg
              className="h-4 w-4 animate-spin"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
              />
            </svg>
            Sending...
          </>
        ) : (
          "Send Message"
        )}
      </button>
    </form>
  );
}
