"use client";

import { useState } from "react";
 
import { useQuery, useMutation } from "@apollo/client/react";
import { CUSTOMER_QUERY } from "@/lib/graphql/queries/customer";
import {
  CREATE_CUSTOMER_ADDRESS,
  UPDATE_CUSTOMER_ADDRESS,
  DELETE_CUSTOMER_ADDRESS,
} from "@/lib/graphql/mutations/customer";
import {
  AddressForm,
  type AddressFormData,
} from "@/components/account/AddressForm";

type Mode = { type: "list" } | { type: "add" } | { type: "edit"; id: number };

export default function AddressesPage() {
  const [mode, setMode] = useState<Mode>({ type: "list" });
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, loading, error, refetch } = useQuery<any>(CUSTOMER_QUERY);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [createAddress, { loading: creating }] = useMutation<any>(
    CREATE_CUSTOMER_ADDRESS,
  );
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [updateAddress, { loading: updating }] = useMutation<any>(
    UPDATE_CUSTOMER_ADDRESS,
  );
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [deleteAddress, { loading: deleting }] = useMutation<any>(
    DELETE_CUSTOMER_ADDRESS,
  );

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="flex items-center gap-2 bg-gray-900 px-5 py-3">
            <span className="h-3.5 w-[3px] rounded-sm bg-red-600" />
            <h2 className="text-xs font-semibold uppercase tracking-[1px] text-gray-400">
              Address Book
            </h2>
          </div>
        </div>
        <div className="grid gap-6 sm:grid-cols-2">
          {[1, 2].map((i) => (
            <div
              key={i}
              className="animate-pulse overflow-hidden rounded-xl border border-gray-200 bg-white p-5 shadow-sm"
            >
              <div className="space-y-3">
                <div className="h-4 w-3/4 rounded bg-gray-200" />
                <div className="h-4 w-full rounded bg-gray-200" />
                <div className="h-4 w-2/3 rounded bg-gray-200" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
        Error loading addresses. Please try again.
      </div>
    );
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const addresses: any[] = data?.customer?.addresses || [];

  function buildInput(formData: AddressFormData) {
    return {
      firstname: formData.firstname,
      lastname: formData.lastname,
      street: formData.street.filter(Boolean),
      city: formData.city,
      region: {
        region_code: formData.region_code,
        region_id: formData.region_id,
      },
      postcode: formData.postcode,
      country_code: formData.country_code,
      telephone: formData.telephone,
      default_shipping: formData.default_shipping,
      default_billing: formData.default_billing,
    };
  }

  async function handleCreate(formData: AddressFormData) {
    await createAddress({ variables: { input: buildInput(formData) } });
    await refetch();
    setMode({ type: "list" });
  }

  async function handleUpdate(id: number, formData: AddressFormData) {
    await updateAddress({
      variables: { id, input: buildInput(formData) },
    });
    await refetch();
    setMode({ type: "list" });
  }

  async function handleDelete(id: number) {
    await deleteAddress({ variables: { id } });
    await refetch();
    setDeleteConfirm(null);
  }

  // Show form
  if (mode.type === "add") {
    return (
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <AddressForm
          title="Add New Address"
          onSubmit={handleCreate}
          onCancel={() => setMode({ type: "list" })}
          loading={creating}
        />
      </div>
    );
  }

  if (mode.type === "edit") {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const addr = addresses.find((a: any) => a.id === mode.id);
    if (!addr) {
      setMode({ type: "list" });
      return null;
    }
    return (
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <AddressForm
          title="Edit Address"
          initial={{
            firstname: addr.firstname,
            lastname: addr.lastname,
            street: addr.street,
            city: addr.city,
            region_code: addr.region?.region_code || "",
            region_id: addr.region?.region_id || 0,
            postcode: addr.postcode,
            country_code: addr.country_code,
            telephone: addr.telephone,
            default_shipping: addr.default_shipping,
            default_billing: addr.default_billing,
          }}
          onSubmit={(formData) => handleUpdate(mode.id, formData)}
          onCancel={() => setMode({ type: "list" })}
          loading={updating}
        />
      </div>
    );
  }

  // List view
  return (
    <div className="space-y-6">
      {/* Header card */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="flex items-center gap-2 bg-gray-900 px-5 py-3">
          <span className="h-3.5 w-[3px] rounded-sm bg-red-600" />
          <h2 className="text-xs font-semibold uppercase tracking-[1px] text-gray-400">
            Address Book
          </h2>
          {addresses.length > 0 && (
            <span className="ml-auto text-xs text-gray-500">
              {addresses.length} address{addresses.length !== 1 ? "es" : ""}
            </span>
          )}
        </div>
        <div className="px-5 py-3">
          <button
            onClick={() => setMode({ type: "add" })}
            className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700"
          >
            <svg
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              strokeWidth="2"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 4v16m8-8H4"
              />
            </svg>
            Add New Address
          </button>
        </div>
      </div>

      {addresses.length === 0 ? (
        <div className="rounded-xl border border-gray-200 bg-white px-5 py-12 text-center shadow-sm">
          <svg
            className="mx-auto mb-4 h-12 w-12 text-gray-300"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            strokeWidth="1"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
          <p className="text-sm font-medium text-gray-900">
            No addresses saved
          </p>
          <p className="mt-1 text-sm text-gray-500">
            Add a shipping or billing address to get started.
          </p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2">
          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
          {addresses.map((addr: any) => (
            <div
              key={addr.id}
              className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm"
            >
              <div className="p-5">
                {(addr.default_shipping || addr.default_billing) && (
                  <div className="mb-3 flex flex-wrap gap-2">
                    {addr.default_shipping && (
                      <span className="inline-block rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-semibold text-green-700">
                        Default Shipping
                      </span>
                    )}
                    {addr.default_billing && (
                      <span className="inline-block rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-semibold text-blue-700">
                        Default Billing
                      </span>
                    )}
                  </div>
                )}
                <p className="text-sm font-medium text-gray-900">
                  {addr.firstname} {addr.lastname}
                </p>
                {addr.street?.map((line: string, idx: number) => (
                  <p key={idx} className="text-sm text-gray-500">
                    {line}
                  </p>
                ))}
                <p className="text-sm text-gray-500">
                  {addr.city}
                  {addr.region?.region_code
                    ? `, ${addr.region.region_code}`
                    : ""}{" "}
                  {addr.postcode}
                </p>
                <p className="text-sm text-gray-400">{addr.country_code}</p>
                {addr.telephone && (
                  <p className="mt-2 text-sm text-gray-400">
                    {addr.telephone}
                  </p>
                )}
              </div>

              {/* Actions */}
              <div className="flex border-t border-gray-100">
                <button
                  onClick={() => setMode({ type: "edit", id: addr.id })}
                  className="flex flex-1 items-center justify-center gap-1.5 py-2.5 text-xs font-medium text-gray-600 transition hover:bg-gray-50 hover:text-gray-900"
                >
                  <svg
                    className="h-3.5 w-3.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    strokeWidth="2"
                  >
                    <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                    <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                  </svg>
                  Edit
                </button>
                <div className="w-px bg-gray-100" />
                {deleteConfirm === addr.id ? (
                  <div className="flex flex-1 items-center justify-center gap-2 py-2.5">
                    <button
                      onClick={() => handleDelete(addr.id)}
                      disabled={deleting}
                      className="text-xs font-semibold text-red-600 hover:text-red-700"
                    >
                      {deleting ? "..." : "Confirm"}
                    </button>
                    <button
                      onClick={() => setDeleteConfirm(null)}
                      className="text-xs text-gray-400 hover:text-gray-600"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setDeleteConfirm(addr.id)}
                    className="flex flex-1 items-center justify-center gap-1.5 py-2.5 text-xs font-medium text-gray-400 transition hover:bg-red-50 hover:text-red-600"
                  >
                    <svg
                      className="h-3.5 w-3.5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      strokeWidth="2"
                    >
                      <path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2m3 0v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6h14" />
                    </svg>
                    Delete
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
