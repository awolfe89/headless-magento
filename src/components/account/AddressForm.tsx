"use client";

import { useState } from "react";
import { useQuery } from "@apollo/client/react";
import {
  COUNTRY_REGIONS_QUERY,
  type Region,
} from "@/lib/graphql/queries/regions";
import {
  formatPhone,
  formatZip,
  validatePhoneRequired,
  validateZip,
} from "@/lib/validation";

export interface AddressFormData {
  firstname: string;
  lastname: string;
  street: string[];
  city: string;
  region_code: string;
  region_id: number;
  postcode: string;
  country_code: string;
  telephone: string;
  default_shipping: boolean;
  default_billing: boolean;
}

interface AddressFormProps {
  initial?: Partial<AddressFormData>;
  onSubmit: (data: AddressFormData) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
  title: string;
}

export function AddressForm({
  initial,
  onSubmit,
  onCancel,
  loading,
  title,
}: AddressFormProps) {
  const [form, setForm] = useState<AddressFormData>({
    firstname: initial?.firstname || "",
    lastname: initial?.lastname || "",
    street: initial?.street || [""],
    city: initial?.city || "",
    region_code: initial?.region_code || "",
    region_id: initial?.region_id || 0,
    postcode: initial?.postcode || "",
    country_code: initial?.country_code || "US",
    telephone: initial?.telephone || "",
    default_shipping: initial?.default_shipping || false,
    default_billing: initial?.default_billing || false,
  });
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // Fetch US regions from Magento
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: countryData } = useQuery<any>(COUNTRY_REGIONS_QUERY, {
    variables: { countryId: "US" },
    fetchPolicy: "cache-first",
  });

  const regions: Region[] = countryData?.country?.available_regions || [];

  function update(field: string, value: string | boolean) {
    setForm((prev) => ({ ...prev, [field]: value }));
    // Clear field error on change
    if (fieldErrors[field]) {
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  }

  function handleRegionChange(code: string) {
    const region = regions.find((r) => r.code === code);
    setForm((prev) => ({
      ...prev,
      region_code: code,
      region_id: region?.id || 0,
    }));
    if (fieldErrors.region_code) {
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next.region_code;
        return next;
      });
    }
  }

  function handlePhoneChange(value: string) {
    const formatted = formatPhone(value);
    setForm((prev) => ({ ...prev, telephone: formatted }));
    if (fieldErrors.telephone) {
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next.telephone;
        return next;
      });
    }
  }

  function handleZipChange(value: string) {
    const formatted = formatZip(value);
    setForm((prev) => ({ ...prev, postcode: formatted }));
    if (fieldErrors.postcode) {
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next.postcode;
        return next;
      });
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    // Validate
    const errors: Record<string, string> = {};
    if (!form.firstname.trim()) errors.firstname = "First name is required";
    if (!form.lastname.trim()) errors.lastname = "Last name is required";
    if (!form.street[0]?.trim()) errors.street = "Street address is required";
    if (!form.city.trim()) errors.city = "City is required";
    if (!form.region_code) errors.region_code = "State is required";
    if (!form.region_id) errors.region_code = "Please select a valid state";

    const zipErr = validateZip(form.postcode);
    if (zipErr) errors.postcode = zipErr;

    const phoneErr = validatePhoneRequired(form.telephone);
    if (phoneErr) errors.telephone = phoneErr;

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    try {
      await onSubmit(form);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save address");
    }
  }

  const inputCls =
    "w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm text-gray-900 outline-none transition focus:border-red-300 focus:ring-2 focus:ring-red-100";
  const errorInputCls =
    "w-full rounded-lg border border-red-300 px-4 py-2.5 text-sm text-gray-900 outline-none transition focus:border-red-300 focus:ring-2 focus:ring-red-100";

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h3 className="text-lg font-bold text-gray-900">{title}</h3>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-500">
            First Name *
          </label>
          <input
            type="text"
            value={form.firstname}
            onChange={(e) => update("firstname", e.target.value)}
            className={fieldErrors.firstname ? errorInputCls : inputCls}
            maxLength={100}
            required
          />
          {fieldErrors.firstname && (
            <p className="mt-1 text-xs text-red-600">{fieldErrors.firstname}</p>
          )}
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-500">
            Last Name *
          </label>
          <input
            type="text"
            value={form.lastname}
            onChange={(e) => update("lastname", e.target.value)}
            className={fieldErrors.lastname ? errorInputCls : inputCls}
            maxLength={100}
            required
          />
          {fieldErrors.lastname && (
            <p className="mt-1 text-xs text-red-600">{fieldErrors.lastname}</p>
          )}
        </div>
      </div>

      <div>
        <label className="mb-1 block text-xs font-medium text-gray-500">
          Street Address *
        </label>
        <input
          type="text"
          value={form.street[0]}
          onChange={(e) =>
            setForm((p) => ({
              ...p,
              street: [e.target.value, p.street[1] || ""],
            }))
          }
          className={fieldErrors.street ? errorInputCls : inputCls}
          placeholder="Street address"
          maxLength={200}
          required
        />
        {fieldErrors.street && (
          <p className="mt-1 text-xs text-red-600">{fieldErrors.street}</p>
        )}
        <input
          type="text"
          value={form.street[1] || ""}
          onChange={(e) =>
            setForm((p) => ({ ...p, street: [p.street[0], e.target.value] }))
          }
          className={`${inputCls} mt-2`}
          placeholder="Apt, suite, unit (optional)"
          maxLength={200}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-500">
            City *
          </label>
          <input
            type="text"
            value={form.city}
            onChange={(e) => update("city", e.target.value)}
            className={fieldErrors.city ? errorInputCls : inputCls}
            maxLength={100}
            required
          />
          {fieldErrors.city && (
            <p className="mt-1 text-xs text-red-600">{fieldErrors.city}</p>
          )}
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-500">
            State *
          </label>
          <select
            value={form.region_code}
            onChange={(e) => handleRegionChange(e.target.value)}
            className={fieldErrors.region_code ? errorInputCls : inputCls}
            required
          >
            <option value="">Select...</option>
            {regions.map((r) => (
              <option key={r.id} value={r.code}>
                {r.name}
              </option>
            ))}
          </select>
          {fieldErrors.region_code && (
            <p className="mt-1 text-xs text-red-600">
              {fieldErrors.region_code}
            </p>
          )}
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-500">
            ZIP Code *
          </label>
          <input
            type="text"
            value={form.postcode}
            onChange={(e) => handleZipChange(e.target.value)}
            className={fieldErrors.postcode ? errorInputCls : inputCls}
            placeholder="12345"
            maxLength={10}
            required
          />
          {fieldErrors.postcode && (
            <p className="mt-1 text-xs text-red-600">{fieldErrors.postcode}</p>
          )}
        </div>
      </div>

      <div>
        <label className="mb-1 block text-xs font-medium text-gray-500">
          Phone *
        </label>
        <input
          type="tel"
          value={form.telephone}
          onChange={(e) => handlePhoneChange(e.target.value)}
          className={fieldErrors.telephone ? errorInputCls : inputCls}
          placeholder="(555) 555-5555"
          maxLength={14}
          required
        />
        {fieldErrors.telephone && (
          <p className="mt-1 text-xs text-red-600">{fieldErrors.telephone}</p>
        )}
      </div>

      <div className="flex gap-6">
        <label className="flex items-center gap-2 text-sm text-gray-700">
          <input
            type="checkbox"
            checked={form.default_shipping}
            onChange={(e) => update("default_shipping", e.target.checked)}
            className="h-4 w-4 rounded border-gray-300 text-red-600 focus:ring-red-500"
          />
          Default shipping
        </label>
        <label className="flex items-center gap-2 text-sm text-gray-700">
          <input
            type="checkbox"
            checked={form.default_billing}
            onChange={(e) => update("default_billing", e.target.checked)}
            className="h-4 w-4 rounded border-gray-300 text-red-600 focus:ring-red-500"
          />
          Default billing
        </label>
      </div>

      {error && <p className="text-sm font-medium text-red-600">{error}</p>}

      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-red-600 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700 disabled:opacity-50"
        >
          {loading ? "Saving..." : "Save Address"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg border border-gray-200 bg-white px-6 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
