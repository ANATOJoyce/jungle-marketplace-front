// types/product-image.ts
export interface ProductImage {
  id: string;
  url: string;
  metadata?: Record<string, unknown>;
  rank?: number;
  product?: string; // product id
}
