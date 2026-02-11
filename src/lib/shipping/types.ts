export interface SavedCarrierAccount {
  id: string;
  carrier: "ups" | "fedex" | "other";
  accountNumber: string;
  nickname: string;
}

export const CARRIER_OPTIONS = [
  { value: "ups", label: "UPS" },
  { value: "fedex", label: "FedEx" },
  { value: "other", label: "Other" },
] as const;

export type CarrierValue = (typeof CARRIER_OPTIONS)[number]["value"];
