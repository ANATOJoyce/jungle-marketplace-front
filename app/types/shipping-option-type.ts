// types/shipping-option-type.ts

export interface ShippingOptionType {
  id: string;
  label: string;
  description?: string | null;
  code: string;
}
