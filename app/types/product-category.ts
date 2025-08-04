// types/product-category.ts
import { Product } from "./product";

export interface ProductCategory {
  id: string;
  name: string;
  description?: string;
  handle: string;
  mpath?: string;
  is_active?: boolean;
  is_internal?: boolean;
  rank?: number;
  metadata?: Record<string, unknown>;
  parent_category?: ProductCategory;
  category_children?: ProductCategory[];
  products?: Product[];
}
