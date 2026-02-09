import { formatPrice } from "@/lib/formatPrice";

interface ProductPriceProps {
  priceRange: {
    minimum_price: {
      final_price: { value: number; currency: string };
      regular_price: { value: number; currency: string };
      discount: { amount_off: number; percent_off: number } | null;
    };
  };
}

export function ProductPrice({ priceRange }: ProductPriceProps) {
  if (!priceRange?.minimum_price) return null;
  const { final_price, regular_price, discount } =
    priceRange.minimum_price;
  const hasDiscount = discount && discount.percent_off > 0;

  return (
    <div className="flex items-baseline gap-3">
      <span className="text-2xl font-bold text-gray-900">
        ${formatPrice(final_price.value)}
      </span>
      {hasDiscount && (
        <>
          <span className="text-lg text-gray-500 line-through">
            ${formatPrice(regular_price.value)}
          </span>
          <span className="rounded bg-red-100 px-2 py-0.5 text-sm font-semibold text-red-700">
            Save {Math.round(discount.percent_off)}%
          </span>
        </>
      )}
    </div>
  );
}
