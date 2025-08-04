// types/product-option.ts
import { ProductOptionValue } from "./product-option-value";

export interface ProductOption {
  id?: string;
  title: string;
  metadata?: Record<string, unknown>;
  product?: string; // product id
  values?: ProductOptionValue[];
}
