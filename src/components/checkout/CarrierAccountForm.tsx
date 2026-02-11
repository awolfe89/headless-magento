"use client";

import {
  CARRIER_OPTIONS,
  type SavedCarrierAccount,
  type CarrierValue,
} from "@/lib/shipping/types";

export interface CarrierFormData {
  carrier: CarrierValue;
  accountNumber: string;
  savedAccountId: string; // "" means entering new
}

interface Props {
  data: CarrierFormData;
  onChange: (data: CarrierFormData) => void;
  savedAccounts: SavedCarrierAccount[];
  isLoggedIn: boolean;
  saveForFuture: boolean;
  onSaveForFutureChange: (v: boolean) => void;
}

function maskAccount(num: string): string {
  if (num.length <= 4) return num;
  return "****" + num.slice(-4);
}

function carrierLabel(carrier: string): string {
  return CARRIER_OPTIONS.find((c) => c.value === carrier)?.label ?? carrier;
}

export default function CarrierAccountForm({
  data,
  onChange,
  savedAccounts,
  isLoggedIn,
  saveForFuture,
  onSaveForFutureChange,
}: Props) {
  const hasSaved = isLoggedIn && savedAccounts.length > 0;
  const isNewEntry = !data.savedAccountId;

  return (
    <div className="mt-3 space-y-3 rounded-lg border border-gray-100 bg-gray-50/50 p-4">
      {/* Saved accounts radio list */}
      {hasSaved && (
        <div className="space-y-2">
          {savedAccounts.map((acct) => (
            <label
              key={acct.id}
              className={`flex cursor-pointer items-center gap-3 rounded-lg border px-4 py-3 transition ${
                data.savedAccountId === acct.id
                  ? "border-red-200 bg-white ring-1 ring-red-100"
                  : "border-gray-200 bg-white hover:border-gray-300"
              }`}
            >
              <input
                type="radio"
                name="carrierAccount"
                checked={data.savedAccountId === acct.id}
                onChange={() =>
                  onChange({
                    carrier: acct.carrier,
                    accountNumber: acct.accountNumber,
                    savedAccountId: acct.id,
                  })
                }
                className="h-4 w-4 accent-red-600"
              />
              <div className="flex-1">
                <span className="text-sm font-medium text-gray-900">
                  {acct.nickname}
                </span>
                <span className="ml-2 inline-block rounded-full bg-gray-100 px-2 py-0.5 text-xs font-semibold text-gray-600">
                  {carrierLabel(acct.carrier)}
                </span>
              </div>
              <span className="font-mono text-xs text-gray-400">
                {maskAccount(acct.accountNumber)}
              </span>
            </label>
          ))}

          {/* Enter new option */}
          <label
            className={`flex cursor-pointer items-center gap-3 rounded-lg border px-4 py-3 transition ${
              isNewEntry
                ? "border-red-200 bg-white ring-1 ring-red-100"
                : "border-gray-200 bg-white hover:border-gray-300"
            }`}
          >
            <input
              type="radio"
              name="carrierAccount"
              checked={isNewEntry}
              onChange={() =>
                onChange({ carrier: "ups", accountNumber: "", savedAccountId: "" })
              }
              className="h-4 w-4 accent-red-600"
            />
            <span className="text-sm font-medium text-gray-900">
              Enter a new account
            </span>
          </label>
        </div>
      )}

      {/* New account entry form */}
      {isNewEntry && (
        <div className="space-y-3">
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-500">
              Carrier <span className="text-red-500">*</span>
            </label>
            <select
              value={data.carrier}
              onChange={(e) =>
                onChange({ ...data, carrier: e.target.value as CarrierValue })
              }
              className="w-full rounded-lg border border-gray-200 bg-white px-3.5 py-2.5 text-sm text-gray-900 outline-none transition focus:border-red-300 focus:ring-2 focus:ring-red-100"
            >
              {CARRIER_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-gray-500">
              Account Number <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={data.accountNumber}
              onChange={(e) =>
                onChange({ ...data, accountNumber: e.target.value })
              }
              placeholder="e.g. X12345"
              className="w-full rounded-lg border border-gray-200 bg-white px-3.5 py-2.5 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-red-300 focus:ring-2 focus:ring-red-100"
            />
          </div>

          {/* Save for future checkbox (logged-in only) */}
          {isLoggedIn && (
            <label className="flex cursor-pointer items-center gap-2">
              <input
                type="checkbox"
                checked={saveForFuture}
                onChange={(e) => onSaveForFutureChange(e.target.checked)}
                className="h-4 w-4 rounded accent-red-600"
              />
              <span className="text-sm text-gray-600">
                Save this account for future orders
              </span>
            </label>
          )}
        </div>
      )}
    </div>
  );
}
