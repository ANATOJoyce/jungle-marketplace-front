// types/product.ts
import { ProductVariant } from "./product-variant";
import { ProductType } from "./product-type";
import { ProductTag } from "./product-tag";
import { ProductOption } from "./product-option";
import { ProductImage } from "./product-image";
import { ProductCollection } from "./product-collection";
import { ProductCategory } from "./product-category";
import { User } from "./user";
import { Store } from "./store";
import { SalesChannel } from "./sales-channel";

export enum ProductStatus {
  DRAFT = 'draft',
  PROPOSED = 'proposed',
  PUBLISHED = 'published',
  REJECTED = 'rejected',
}

export interface Product {
  id: string;
  title: string;
  handle: string;
  subtitle?: string;
  description?: string;
  is_giftcard?: boolean;
  status: ProductStatus;
  thumbnail?: string;
  weight?: number;
  length?: number;
  height?: number;
  width?: number;
  origin_country?: string;
  hs_code?: string;
  mid_code?: string;
  material?: string;
  discountable?: boolean;
  external_id?: string;
  metadata?: Record<string, unknown>;
  owner?: User;
  store?: Store; // modifié d’après ta remarque
  variants: ProductVariant[];
  type?: ProductType;
  tags?: ProductTag[];
  options?: ProductOption[];
  images?: ProductImage[];
  collection?: ProductCollection;
  categories?: ProductCategory[];
  deleted_at?: string | null;
 sales_channels: SalesChannel[];
}
