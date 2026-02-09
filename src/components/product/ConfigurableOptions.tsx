"use client";

import { useState, useEffect } from "react";

interface SwatchData {
  value: string;
}

interface OptionValue {
  uid: string;
  label: string;
  swatch_data?: SwatchData | null;
}

interface ConfigurableOption {
  uid: string;
  label: string;
  attribute_code: string;
  values: OptionValue[];
}

interface VariantAttribute {
  uid: string;
  label: string;
  code: string;
}

interface Variant {
  product: {
    uid: string;
    sku: string;
    stock_status: string;
    price_range: {
      minimum_price: {
        regular_price: { value: number; currency: string };
        final_price: { value: number; currency: string };
      };
    };
  };
  attributes: VariantAttribute[];
}

interface ConfigurableOptionsProps {
  options: ConfigurableOption[];
  variants: Variant[];
  onSelectionChange: (selection: {
    selectedUids: string[];
    matchedVariant: Variant | null;
    isComplete: boolean;
  }) => void;
}

function isColorSwatch(value: string): boolean {
  return /^#[0-9a-fA-F]{6}$/i.test(value);
}

export function ConfigurableOptions({
  options,
  variants,
  onSelectionChange,
}: ConfigurableOptionsProps) {
  // Map: attribute_code → selected value uid
  const [selections, setSelections] = useState<Record<string, string>>({});

  useEffect(() => {
    const selectedUids = Object.values(selections).filter(Boolean);
    const isComplete = selectedUids.length === options.length;

    // Find matching variant
    let matchedVariant: Variant | null = null;
    if (isComplete) {
      matchedVariant =
        variants.find((v) =>
          v.attributes.every((attr) => selectedUids.includes(attr.uid)),
        ) || null;
    }

    onSelectionChange({ selectedUids, matchedVariant, isComplete });
  }, [selections, options.length, variants, onSelectionChange]);

  function handleSelect(attributeCode: string, valueUid: string) {
    setSelections((prev) => ({
      ...prev,
      [attributeCode]:
        prev[attributeCode] === valueUid ? "" : valueUid,
    }));
  }

  // Determine which values are available given current selections
  function isValueAvailable(
    attributeCode: string,
    valueUid: string,
  ): boolean {
    // Check if any variant with this value + current other selections exists and is in stock
    const otherSelections = Object.entries(selections).filter(
      ([code, uid]) => code !== attributeCode && uid,
    );

    if (otherSelections.length === 0) return true;

    return variants.some((v) => {
      const hasThisValue = v.attributes.some((a) => a.uid === valueUid);
      const matchesOthers = otherSelections.every(([, uid]) =>
        v.attributes.some((a) => a.uid === uid),
      );
      return hasThisValue && matchesOthers;
    });
  }

  return (
    <div className="space-y-5">
      {options.map((option) => {
        const isColorOption =
          option.attribute_code === "color" ||
          option.values.some(
            (v) => v.swatch_data?.value && isColorSwatch(v.swatch_data.value),
          );

        return (
          <div key={option.uid}>
            <div className="mb-2 flex items-baseline gap-2">
              <label className="text-sm font-semibold text-gray-900">
                {option.label}
              </label>
              {selections[option.attribute_code] && (
                <span className="text-sm text-gray-500">
                  {option.values.find(
                    (v) => v.uid === selections[option.attribute_code],
                  )?.label}
                </span>
              )}
            </div>

            {isColorOption ? (
              // Color swatches
              <div className="flex flex-wrap gap-2">
                {option.values.map((value) => {
                  const selected =
                    selections[option.attribute_code] === value.uid;
                  const available = isValueAvailable(
                    option.attribute_code,
                    value.uid,
                  );
                  const swatchColor = value.swatch_data?.value;

                  return (
                    <button
                      key={value.uid}
                      onClick={() =>
                        available &&
                        handleSelect(option.attribute_code, value.uid)
                      }
                      disabled={!available}
                      title={value.label}
                      className={`relative h-9 w-9 rounded-full border-2 transition ${
                        selected
                          ? "border-red-600 ring-2 ring-red-200"
                          : available
                            ? "border-gray-200 hover:border-gray-400"
                            : "cursor-not-allowed border-gray-100 opacity-30"
                      }`}
                    >
                      {swatchColor && isColorSwatch(swatchColor) ? (
                        <span
                          className="absolute inset-1 rounded-full"
                          style={{ backgroundColor: swatchColor }}
                        />
                      ) : (
                        <span className="flex h-full w-full items-center justify-center text-[10px] font-semibold text-gray-600">
                          {value.label.slice(0, 2)}
                        </span>
                      )}
                      {!available && (
                        <span className="absolute inset-0 flex items-center justify-center">
                          <span className="block h-px w-8 rotate-45 bg-gray-400" />
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            ) : (
              // Dropdown or button group for other attributes
              <div className="flex flex-wrap gap-2">
                {option.values.map((value) => {
                  const selected =
                    selections[option.attribute_code] === value.uid;
                  const available = isValueAvailable(
                    option.attribute_code,
                    value.uid,
                  );

                  return (
                    <button
                      key={value.uid}
                      onClick={() =>
                        available &&
                        handleSelect(option.attribute_code, value.uid)
                      }
                      disabled={!available}
                      className={`rounded-lg border px-4 py-2 text-sm font-medium transition ${
                        selected
                          ? "border-red-600 bg-red-50 text-red-600"
                          : available
                            ? "border-gray-200 bg-white text-gray-700 hover:border-gray-400"
                            : "cursor-not-allowed border-gray-100 bg-gray-50 text-gray-300 line-through"
                      }`}
                    >
                      {value.label}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
