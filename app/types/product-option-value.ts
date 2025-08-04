import { ProductOption } from "./product-option";
import { ProductVariant } from "./product-variant";

// types/product-option-value.ts
export interface ProductOptionValue {
  id?: string;
  value: string;
  metadata?: Record<string, unknown>;
  option?: ProductOption;
  variants?: ProductVariant[];
}
