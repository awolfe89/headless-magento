import Link from "next/link";

export default async function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ order?: string }>;
}) {
  const { order } = await searchParams;

  return (
    <div className="bg-gray-50 pb-16">
      {/* Hero Header */}
      <div className="bg-gradient-to-br from-gray-900 via-gray-900 to-gray-800">
        <div className="relative mx-auto max-w-7xl px-4 py-10">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_80%_50%,rgba(200,16,46,0.06)_0%,transparent_60%)]" />
          <div className="relative">
            <h1 className="text-3xl font-bold text-white">
              Order Confirmation
            </h1>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-2xl px-4 pt-12">
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          {/* Green header bar */}
          <div className="flex items-center gap-2 bg-gray-900 px-5 py-3">
            <span className="h-3.5 w-[3px] rounded-sm bg-green-500" />
            <h2 className="text-xs font-semibold uppercase tracking-[1px] text-gray-400">
              Order Placed Successfully
            </h2>
          </div>

          <div className="px-6 py-10 text-center sm:px-10">
            {/* Checkmark icon */}
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
              <svg
                className="h-10 w-10 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                strokeWidth="2.5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>

            <h2 className="mb-2 text-2xl font-bold text-gray-900">
              Order Confirmed!
            </h2>

            <p className="mb-6 text-gray-600">
              Thank you for your order. We&apos;ve received it and will begin
              processing it shortly.
            </p>

            {order && (
              <div className="mx-auto mb-8 inline-flex items-center gap-3 rounded-lg border border-gray-200 bg-gray-50 px-6 py-4">
                <span className="text-sm text-gray-500">Order Number:</span>
                <span className="font-mono text-lg font-bold text-gray-900">
                  {order}
                </span>
              </div>
            )}

            <p className="mb-8 text-sm text-gray-500">
              A confirmation email will be sent to your email address with your
              order details and tracking information.
            </p>

            {/* Action buttons */}
            <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
              <Link
                href="/account/orders"
                className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-red-700 hover:shadow-md"
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
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                  />
                </svg>
                View Your Orders
              </Link>
              <Link
                href="/"
                className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-6 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
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
                    d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                  />
                </svg>
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>

        {/* Trust / support note */}
        <div className="mt-6 text-center text-sm text-gray-500">
          <p>
            Questions about your order?{" "}
            <Link
              href="/contact"
              className="font-medium text-red-600 transition hover:text-red-700"
            >
              Contact our support team
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
