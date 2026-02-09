import { formatPrice } from "@/lib/formatPrice";

interface TierPrice {
  quantity: number;
  final_price: { value: number; currency: string };
  discount: { percent_off: number; amount_off: number };
}

interface Props {
  tiers: TierPrice[];
  basePrice: number;
}

export function TierPricing({ tiers, basePrice }: Props) {
  if (!tiers || tiers.length === 0) return null;

  return (
    <div className="mb-4 overflow-hidden rounded-xl border border-gray-200 shadow-sm">
      <div className="flex items-center gap-2 bg-gray-900 px-5 py-3">
        <span className="h-3.5 w-[3px] rounded-sm bg-green-500" />
        <h3 className="text-xs font-semibold uppercase tracking-[1px] text-gray-400">
          Volume Pricing
        </h3>
      </div>
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-100 bg-gray-50/60 text-xs uppercase tracking-wider text-gray-500">
            <th className="px-5 py-2.5 text-left font-semibold">Quantity</th>
            <th className="px-5 py-2.5 text-right font-semibold">
              Price Each
            </th>
            <th className="px-5 py-2.5 text-right font-semibold">Savings</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          <tr>
            <td className="px-5 py-3 text-gray-600">
              1 – {tiers[0].quantity - 1}
            </td>
            <td className="px-5 py-3 text-right font-medium text-gray-900">
              ${formatPrice(basePrice)}
            </td>
            <td className="px-5 py-3 text-right text-gray-400">—</td>
          </tr>
          {tiers.map((tier, i) => {
            const nextQty = tiers[i + 1]?.quantity;
            const qtyLabel = nextQty
              ? `${tier.quantity} – ${nextQty - 1}`
              : `${tier.quantity}+`;

            return (
              <tr key={tier.quantity}>
                <td className="px-5 py-3 font-medium text-gray-900">
                  {qtyLabel}
                </td>
                <td className="px-5 py-3 text-right font-bold text-green-600">
                  ${formatPrice(tier.final_price.value)}
                </td>
                <td className="px-5 py-3 text-right">
                  <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-semibold text-green-700">
                    {Math.round(tier.discount.percent_off)}% off
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
