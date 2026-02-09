"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useToast } from "@/components/ui/Toast";
import { formatPhone } from "@/lib/validation";

interface BulkQuoteModalProps {
  productName: string;
  sku: string;
  mfgSku?: string;
}

const inputClass =
  "w-full rounded-lg border border-gray-200 bg-white px-3.5 py-2.5 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-red-300 focus:ring-2 focus:ring-red-100";

export function BulkQuoteModal({ productName, sku, mfgSku }: BulkQuoteModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const { addToast } = useToast();
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    quantity: "",
    message: "",
  });

  const update = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const { name, value } = e.target;
      if (name === "phone") {
        setForm((f) => ({ ...f, phone: formatPhone(value) }));
      } else {
        setForm((f) => ({ ...f, [name]: value }));
      }
    },
    [],
  );

  function handleOpen() {
    setOpen(true);
    dialogRef.current?.showModal();
  }

  function handleClose() {
    dialogRef.current?.close();
    setOpen(false);
  }

  // Close on backdrop click
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    function onClick(e: MouseEvent) {
      if (e.target === dialog) handleClose();
    }
    dialog.addEventListener("click", onClick);
    return () => dialog.removeEventListener("click", onClick);
  }, []);

  // Lock body scroll when open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const body = {
        name: form.name,
        email: form.email,
        phone: form.phone,
        company: form.company,
        subject: "Bulk Quote",
        message: [
          `Bulk quote request for:`,
          productName,
          `SKU: ${sku}`,
          mfgSku ? `MFG SKU: ${mfgSku}` : null,
          `Quantity: ${form.quantity}`,
          form.message ? `\nAdditional notes:\n${form.message}` : null,
        ]
          .filter(Boolean)
          .join("\n"),
      };

      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || "Failed to send");

      addToast("Quote request sent! We'll get back to you within one business day.", "success");
      setForm({ name: "", email: "", phone: "", company: "", quantity: "", message: "" });
      handleClose();
    } catch (err) {
      addToast(
        err instanceof Error ? err.message : "Something went wrong. Please try again.",
        "error",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={handleOpen}
        className="mb-3 flex w-full items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-[13px] font-semibold text-gray-900 transition hover:border-gray-400 hover:bg-gray-50"
      >
        <svg className="h-4 w-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
        </svg>
        Request Bulk Quote
      </button>

      <dialog
        ref={dialogRef}
        className="m-auto max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border-0 bg-white p-0 shadow-2xl backdrop:bg-black/50 backdrop:backdrop-blur-sm"
      >
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-100 bg-white px-6 py-4">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Request Bulk Quote</h2>
            <p className="mt-0.5 text-xs text-gray-500 line-clamp-1">{productName}</p>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="rounded-lg p-1.5 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600"
            aria-label="Close"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 p-6">
          {/* Product info (read-only context) */}
          <div className="rounded-lg bg-gray-50 px-4 py-3 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-gray-500">SKU</span>
              <span className="font-mono text-xs font-semibold text-gray-900">{sku}</span>
            </div>
            {mfgSku && (
              <div className="mt-1 flex items-center justify-between">
                <span className="text-gray-500">MFG SKU</span>
                <span className="font-mono text-xs font-semibold text-gray-900">{mfgSku}</span>
              </div>
            )}
          </div>

          {/* Quantity */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              Quantity Needed <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="quantity"
              value={form.quantity}
              onChange={update}
              required
              placeholder="e.g. 500, 1000-5000, 10 cases"
              className={inputClass}
            />
          </div>

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

          {/* Additional notes */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              Additional Notes
            </label>
            <textarea
              name="message"
              value={form.message}
              onChange={update}
              rows={3}
              placeholder="Delivery timeline, special requirements, etc."
              className={inputClass}
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={submitting}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-red-600 px-8 py-3 text-sm font-semibold text-white transition hover:bg-red-700 disabled:opacity-50"
          >
            {submitting ? (
              <>
                <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Sending...
              </>
            ) : (
              "Submit Quote Request"
            )}
          </button>
        </form>
      </dialog>
    </>
  );
}
