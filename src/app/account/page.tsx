"use client";

 
import { useQuery } from "@apollo/client/react";
import { CUSTOMER_QUERY } from "@/lib/graphql/queries/customer";
import Link from "next/link";

export default function AccountDashboard() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, loading, error } = useQuery<any>(CUSTOMER_QUERY);

  if (loading) {
    return (
      <div className="space-y-6">
        {/* Welcome skeleton */}
        <div className="animate-pulse rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="h-6 w-64 rounded bg-gray-200" />
          <div className="mt-2 h-4 w-40 rounded bg-gray-200" />
        </div>
        {/* Cards skeleton */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="animate-pulse overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm"
            >
              <div className="h-10 bg-gray-200" />
              <div className="space-y-3 p-5">
                <div className="h-4 w-3/4 rounded bg-gray-200" />
                <div className="h-4 w-1/2 rounded bg-gray-200" />
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
        Error loading account information. Please try again.
      </div>
    );
  }

  const customer = data?.customer;
  if (!customer) return null;

  // Find default shipping address
   
  const defaultShipping = customer.addresses?.find(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (addr: any) => addr.default_shipping
  );

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-bold text-gray-900">
          Welcome back, {customer.firstname}!
        </h2>
        <p className="mt-1 text-sm text-gray-500">
          Here&apos;s a quick overview of your account.
        </p>
      </div>

      {/* Quick-info cards */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {/* Account Info */}
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="flex items-center gap-2 bg-gray-900 px-5 py-3">
            <span className="h-3.5 w-[3px] rounded-sm bg-red-600" />
            <h3 className="text-xs font-semibold uppercase tracking-[1px] text-gray-400">
              Account Info
            </h3>
          </div>
          <div className="p-5">
            <p className="text-sm font-medium text-gray-900">
              {customer.firstname} {customer.lastname}
            </p>
            <p className="mt-1 text-sm text-gray-500">{customer.email}</p>
            <p className="mt-3 text-xs text-gray-400">
              Member since{" "}
              {new Date(customer.created_at).toLocaleDateString("en-US", {
                month: "long",
                year: "numeric",
              })}
            </p>
          </div>
        </div>

        {/* Default Shipping Address */}
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="flex items-center gap-2 bg-gray-900 px-5 py-3">
            <span className="h-3.5 w-[3px] rounded-sm bg-red-600" />
            <h3 className="text-xs font-semibold uppercase tracking-[1px] text-gray-400">
              Default Shipping
            </h3>
          </div>
          <div className="p-5">
            {defaultShipping ? (
              <>
                <p className="text-sm font-medium text-gray-900">
                  {defaultShipping.firstname} {defaultShipping.lastname}
                </p>
                <p className="mt-1 text-sm text-gray-500">
                  {defaultShipping.street?.join(", ")}
                </p>
                <p className="text-sm text-gray-500">
                  {defaultShipping.city}, {defaultShipping.region?.region_code}{" "}
                  {defaultShipping.postcode}
                </p>
                {defaultShipping.telephone && (
                  <p className="mt-1 text-sm text-gray-400">
                    {defaultShipping.telephone}
                  </p>
                )}
              </>
            ) : (
              <p className="text-sm text-gray-400">
                No default shipping address set.
              </p>
            )}
            <Link
              href="/account/addresses"
              className="mt-3 inline-block text-xs font-medium text-red-600 transition hover:text-red-700"
            >
              Manage Addresses
            </Link>
          </div>
        </div>

        {/* Recent Orders */}
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="flex items-center gap-2 bg-gray-900 px-5 py-3">
            <span className="h-3.5 w-[3px] rounded-sm bg-red-600" />
            <h3 className="text-xs font-semibold uppercase tracking-[1px] text-gray-400">
              Recent Orders
            </h3>
          </div>
          <div className="p-5">
            <p className="text-sm text-gray-500">
              View and track your recent orders.
            </p>
            <Link
              href="/account/orders"
              className="mt-3 inline-block text-xs font-medium text-red-600 transition hover:text-red-700"
            >
              View All Orders
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
