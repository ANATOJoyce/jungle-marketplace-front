// types/product-collection.ts
import { Product } from "./product";

export interface ProductCollection {
  id: string;
  title: string;
  handle: string;
  metadata?: Record<string, unknown>;
  products?: Product[];
}
