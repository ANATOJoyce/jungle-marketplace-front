// types/product-variant.ts
import { ProductOptionValue } from "./product-option-value";
import { MoneyAmount } from "./money-amount";

export interface ProductVariant {
  id: string;
  title: string;
  sku?: string;
  barcode?: string;
  ean?: string;
  upc?: string;
  allow_backorder?: boolean;
  manage_inventory?: boolean;
  hs_code?: string;
  origin_country?: string;
  mid_code?: string;
  material?: string;
  weight?: number;
  length?: number;
  height?: number;
  width?: number;
  metadata?: Record<string, unknown>;
  variant_rank?: number;
  product?: string; // product id
  options?: ProductOptionValue[];
  prices?: MoneyAmount[];
}
