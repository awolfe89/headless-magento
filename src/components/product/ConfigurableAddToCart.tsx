"use client";

import { useCallback, useState } from "react";
import { ConfigurableOptions } from "./ConfigurableOptions";
import { AddToCart } from "@/components/cart/AddToCart";
import { formatPrice } from "@/lib/formatPrice";

interface ConfigurableAddToCartProps {
  product: {
    sku: string;
    stock_status: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    configurable_options?: any[];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    variants?: any[];
  };
  basePrice: number;
  baseCurrency: string;
}

export function ConfigurableAddToCart({
  product,
  basePrice,
  baseCurrency,
}: ConfigurableAddToCartProps) {
  const [selectedUids, setSelectedUids] = useState<string[]>([]);
  const [isComplete, setIsComplete] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [matchedVariant, setMatchedVariant] = useState<any>(null);

  const handleSelectionChange = useCallback(
    (selection: {
      selectedUids: string[];
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      matchedVariant: any;
      isComplete: boolean;
    }) => {
      setSelectedUids(selection.selectedUids);
      setIsComplete(selection.isComplete);
      setMatchedVariant(selection.matchedVariant);
    },
    [],
  );

  const options = product.configurable_options || [];
  const variants = product.variants || [];
  const isConfigurable = options.length > 0;

  // Dynamic price/stock from matched variant
  const variantPrice =
    matchedVariant?.product?.price_range?.minimum_price?.final_price?.value;
  const variantCurrency =
    matchedVariant?.product?.price_range?.minimum_price?.final_price?.currency;
  const variantStock = matchedVariant?.product?.stock_status;
  const variantSku = matchedVariant?.product?.sku;

  const displayPrice = variantPrice ?? basePrice;
  const displayCurrency = variantCurrency ?? baseCurrency;
  const effectiveStock = isComplete && variantStock ? variantStock : product.stock_status;

  return (
    <div>
      {/* Option selectors */}
      {isConfigurable && (
        <div className="mb-5">
          <ConfigurableOptions
            options={options}
            variants={variants}
            onSelectionChange={handleSelectionChange}
          />
        </div>
      )}

      {/* Price update indicator */}
      {isConfigurable && isComplete && variantPrice && variantPrice !== basePrice && (
        <div className="mb-3 flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-4 py-2 text-sm">
          <span className="text-gray-500">Selected variant:</span>
          <span className="font-bold text-gray-900">
            ${formatPrice(displayPrice)} {displayCurrency}
          </span>
          {variantSku && (
            <span className="ml-auto font-mono text-xs text-gray-400">
              {variantSku}
            </span>
          )}
        </div>
      )}

      {/* Out of stock for selected variant */}
      {isConfigurable && isComplete && variantStock === "OUT_OF_STOCK" && (
        <div className="mb-3 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm font-medium text-red-700">
          This combination is currently out of stock.
        </div>
      )}

      {/* Add to cart */}
      <AddToCart
        product={{
          sku: product.sku,
          stock_status: effectiveStock,
        }}
        selectedOptions={isConfigurable ? selectedUids : undefined}
        optionsComplete={isConfigurable ? isComplete : true}
      />
    </div>
  );
}
