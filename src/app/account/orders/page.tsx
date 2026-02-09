"use client";

 
import { useQuery } from "@apollo/client/react";
import { CUSTOMER_ORDERS_QUERY } from "@/lib/graphql/queries/customer";
import { formatPrice } from "@/lib/formatPrice";
import Link from "next/link";

function statusBadge(status: string) {
  const normalized = status.toLowerCase();
  let colors = "bg-gray-100 text-gray-600";

  if (normalized === "complete") {
    colors = "bg-green-100 text-green-700";
  } else if (normalized === "processing") {
    colors = "bg-blue-100 text-blue-700";
  } else if (normalized === "pending") {
    colors = "bg-yellow-100 text-yellow-700";
  } else if (normalized === "canceled" || normalized === "cancelled") {
    colors = "bg-red-100 text-red-700";
  }

  return (
    <span
      className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${colors}`}
    >
      {status}
    </span>
  );
}

export default function OrdersPage() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, loading, error } = useQuery<any>(CUSTOMER_ORDERS_QUERY, {
    variables: { pageSize: 10, currentPage: 1 },
  });

  if (loading) {
    return (
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="flex items-center gap-2 bg-gray-900 px-5 py-3">
          <span className="h-3.5 w-[3px] rounded-sm bg-red-600" />
          <h2 className="text-xs font-semibold uppercase tracking-[1px] text-gray-400">
            Order History
          </h2>
        </div>
        <div className="animate-pulse space-y-4 p-5">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-center gap-4">
              <div className="h-4 w-24 rounded bg-gray-200" />
              <div className="h-4 w-28 rounded bg-gray-200" />
              <div className="h-4 w-20 rounded bg-gray-200" />
              <div className="ml-auto h-4 w-16 rounded bg-gray-200" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
        Error loading orders. Please try again.
      </div>
    );
  }

  const orders = data?.customer?.orders?.items || [];

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
      {/* Header */}
      <div className="flex items-center gap-2 bg-gray-900 px-5 py-3">
        <span className="h-3.5 w-[3px] rounded-sm bg-red-600" />
        <h2 className="text-xs font-semibold uppercase tracking-[1px] text-gray-400">
          Order History
        </h2>
        {orders.length > 0 && (
          <span className="ml-auto text-xs text-gray-500">
            {data.customer.orders.total_count} order
            {data.customer.orders.total_count !== 1 ? "s" : ""}
          </span>
        )}
      </div>

      {orders.length === 0 ? (
        /* Empty state */
        <div className="px-5 py-12 text-center">
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
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <p className="text-sm font-medium text-gray-900">No orders yet</p>
          <p className="mt-1 text-sm text-gray-500">
            Your order history will appear here once you place an order.
          </p>
        </div>
      ) : (
        <>
          {/* Table header */}
          <div className="hidden border-b border-gray-100 bg-gray-50/50 px-5 py-2.5 sm:block">
            <div className="grid grid-cols-12 text-xs font-semibold uppercase tracking-wide text-gray-400">
              <span className="col-span-3">Order #</span>
              <span className="col-span-3">Date</span>
              <span className="col-span-2">Status</span>
              <span className="col-span-2 text-right">Total</span>
              <span className="col-span-2 text-right">Action</span>
            </div>
          </div>

          {/* Order rows */}
          <div className="divide-y divide-gray-100">
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            {orders.map((order: any) => (
              <Link
                key={order.number}
                href={`/account/orders/${order.number}`}
                className="block px-5 py-4 transition hover:bg-gray-50/50"
              >
                {/* Desktop row */}
                <div className="hidden grid-cols-12 items-center sm:grid">
                  <span className="col-span-3 text-sm font-medium text-gray-900">
                    #{order.number}
                  </span>
                  <span className="col-span-3 text-sm text-gray-500">
                    {new Date(order.order_date).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </span>
                  <span className="col-span-2">{statusBadge(order.status)}</span>
                  <span className="col-span-2 text-right text-sm font-semibold text-gray-900">
                    ${formatPrice(order.total.grand_total.value)}{" "}
                    <span className="text-xs font-normal text-gray-400">
                      {order.total.grand_total.currency}
                    </span>
                  </span>
                  <span className="col-span-2 text-right">
                    <span
                      className="text-xs font-medium text-red-600 transition hover:text-red-700"
                    >
                      View
                    </span>
                  </span>
                </div>

                {/* Mobile layout */}
                <div className="sm:hidden">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-900">
                      #{order.number}
                    </span>
                    {statusBadge(order.status)}
                  </div>
                  <div className="mt-1 flex items-center justify-between">
                    <span className="text-xs text-gray-500">
                      {new Date(order.order_date).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </span>
                    <span className="text-sm font-semibold text-gray-900">
                      ${formatPrice(order.total.grand_total.value)}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
