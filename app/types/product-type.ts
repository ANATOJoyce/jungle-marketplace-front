// types/product-type.ts
export interface ProductType {
  id: string;
  value: string;
  metadata?: Record<string, unknown>;
  products?: string[];
}
