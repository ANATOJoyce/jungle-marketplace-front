// types/product-tag.ts
export interface ProductTag {
  id: string;
  value: string;
  metadata?: Record<string, unknown>;
  products?: string[]; // list of product ids
}
