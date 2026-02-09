"use client";

import { useParams } from "next/navigation";
 
import { useQuery } from "@apollo/client/react";
import { CUSTOMER_ORDER_DETAIL_QUERY } from "@/lib/graphql/queries/customer";
import { formatPrice } from "@/lib/formatPrice";
import Link from "next/link";

function statusBadge(status: string) {
  const n = status.toLowerCase();
  let colors = "bg-gray-100 text-gray-600";
  if (n === "complete") colors = "bg-green-100 text-green-700";
  else if (n === "processing") colors = "bg-blue-100 text-blue-700";
  else if (n === "pending") colors = "bg-yellow-100 text-yellow-700";
  else if (n === "canceled" || n === "cancelled")
    colors = "bg-red-100 text-red-700";
  return (
    <span
      className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${colors}`}
    >
      {status}
    </span>
  );
}

function AddressBlock({
  label,
  addr,
}: {
  label: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  addr: any;
}) {
  if (!addr) return null;
  return (
    <div>
      <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400">
        {label}
      </h3>
      <p className="text-sm font-medium text-gray-900">
        {addr.firstname} {addr.lastname}
      </p>
      {addr.street?.map((line: string, i: number) => (
        <p key={i} className="text-sm text-gray-600">
          {line}
        </p>
      ))}
      <p className="text-sm text-gray-600">
        {addr.city}
        {addr.region ? `, ${addr.region}` : ""} {addr.postcode}
      </p>
      {addr.telephone && (
        <p className="mt-1 text-sm text-gray-400">{addr.telephone}</p>
      )}
    </div>
  );
}

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, loading, error } = useQuery<any>(CUSTOMER_ORDER_DETAIL_QUERY, {
    variables: { orderNumber: id },
  });

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="flex items-center gap-2 bg-gray-900 px-5 py-3">
            <span className="h-3.5 w-[3px] rounded-sm bg-red-600" />
            <div className="h-3 w-32 animate-pulse rounded bg-gray-600" />
          </div>
          <div className="animate-pulse space-y-4 p-5">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-12 rounded bg-gray-100" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
        Error loading order details. Please try again.
      </div>
    );
  }

  const order = data?.customer?.orders?.items?.[0];
  if (!order) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-10 text-center shadow-sm">
        <p className="text-sm font-medium text-gray-900">Order not found</p>
        <Link
          href="/account/orders"
          className="mt-3 inline-block text-sm font-medium text-red-600 hover:text-red-700"
        >
          Back to Orders
        </Link>
      </div>
    );
  }

  const totals = order.total;

  return (
    <div className="space-y-6">
      {/* Back link + header */}
      <div className="flex items-center justify-between">
        <Link
          href="/account/orders"
          className="flex items-center gap-1 text-sm text-gray-500 transition hover:text-gray-900"
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
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
          All Orders
        </Link>
        {statusBadge(order.status)}
      </div>

      {/* Order info card */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="flex items-center gap-2 bg-gray-900 px-5 py-3">
          <span className="h-3.5 w-[3px] rounded-sm bg-red-600" />
          <h2 className="text-xs font-semibold uppercase tracking-[1px] text-gray-400">
            Order #{order.number}
          </h2>
          <span className="ml-auto text-xs text-gray-500">
            {new Date(order.order_date).toLocaleDateString("en-US", {
              month: "long",
              day: "numeric",
              year: "numeric",
            })}
          </span>
        </div>

        {/* Items table */}
        <div className="border-b border-gray-100">
          <div className="hidden border-b border-gray-100 bg-gray-50/50 px-5 py-2.5 sm:block">
            <div className="grid grid-cols-12 text-xs font-semibold uppercase tracking-wide text-gray-400">
              <span className="col-span-5">Product</span>
              <span className="col-span-2">SKU</span>
              <span className="col-span-2 text-center">Qty</span>
              <span className="col-span-1 text-right">Price</span>
              <span className="col-span-2 text-right">Total</span>
            </div>
          </div>
          <div className="divide-y divide-gray-100">
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            {order.items.map((item: any, idx: number) => {
              const lineTotal =
                item.product_sale_price.value * item.quantity_ordered;
              return (
                <div key={idx} className="px-5 py-3">
                  {/* Desktop */}
                  <div className="hidden grid-cols-12 items-center sm:grid">
                    <span className="col-span-5 text-sm font-medium text-gray-900">
                      {item.product_url_key ? (
                        <Link
                          href={`/product/${item.product_url_key}`}
                          className="transition hover:text-red-600"
                        >
                          {item.product_name}
                        </Link>
                      ) : (
                        item.product_name
                      )}
                    </span>
                    <span className="col-span-2 font-mono text-xs text-gray-400">
                      {item.product_sku}
                    </span>
                    <span className="col-span-2 text-center text-sm text-gray-600">
                      {item.quantity_ordered}
                    </span>
                    <span className="col-span-1 text-right text-sm text-gray-600">
                      ${formatPrice(item.product_sale_price.value)}
                    </span>
                    <span className="col-span-2 text-right text-sm font-semibold text-gray-900">
                      ${formatPrice(lineTotal)}
                    </span>
                  </div>
                  {/* Mobile */}
                  <div className="sm:hidden">
                    <p className="text-sm font-medium text-gray-900">
                      {item.product_name}
                    </p>
                    <div className="mt-1 flex items-center justify-between text-xs text-gray-500">
                      <span>
                        SKU: {item.product_sku} &middot; Qty:{" "}
                        {item.quantity_ordered}
                      </span>
                      <span className="font-semibold text-gray-900">
                        ${formatPrice(lineTotal)}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Totals */}
        <div className="bg-gray-50/50 px-5 py-4">
          <div className="ml-auto max-w-xs space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Subtotal</span>
              <span className="font-medium text-gray-900">
                ${formatPrice(totals.subtotal.value)}
              </span>
            </div>
            {totals.total_shipping?.value > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Shipping</span>
                <span className="font-medium text-gray-900">
                  ${formatPrice(totals.total_shipping.value)}
                </span>
              </div>
            )}
            {totals.total_tax?.value > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Tax</span>
                <span className="font-medium text-gray-900">
                  ${formatPrice(totals.total_tax.value)}
                </span>
              </div>
            )}
            {totals.discounts?.map(
              (d: { label: string; amount: { value: number } }) => (
                <div key={d.label} className="flex justify-between text-sm">
                  <span className="text-green-600">{d.label}</span>
                  <span className="font-medium text-green-600">
                    -${formatPrice(d.amount.value)}
                  </span>
                </div>
              ),
            )}
            <div className="flex justify-between border-t border-gray-200 pt-2">
              <span className="font-bold text-gray-900">Grand Total</span>
              <span className="text-lg font-bold text-gray-900">
                ${formatPrice(totals.grand_total.value)}{" "}
                <span className="text-xs font-normal text-gray-400">
                  {totals.grand_total.currency}
                </span>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Addresses + Payment */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <AddressBlock label="Shipping Address" addr={order.shipping_address} />
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <AddressBlock label="Billing Address" addr={order.billing_address} />
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400">
            Payment & Shipping
          </h3>
          {order.payment_methods?.map(
            (pm: { name: string; type: string }, i: number) => (
              <p key={i} className="text-sm text-gray-600">
                {pm.name}
              </p>
            ),
          )}
          {order.shipping_method && (
            <p className="mt-2 text-sm text-gray-600">
              {order.shipping_method}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
