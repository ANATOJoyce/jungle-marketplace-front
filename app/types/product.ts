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
import { Order } from "./order";

export enum ProductStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',

}

export interface Product {
  imageUrl: any;
  _id: string;
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
  order: Order;
  price: number;
  createdAt: string;
  origin_country?: string;
  hs_code?: string;
  mid_code?: string;
  material?: string;
  discountable?: boolean;
  external_id?: string;
  metadata?: Record<string, unknown>;
  owner?: User;
  storeId?: Store; // modifié d’après ta remarque
  variants: ProductVariant[];
  totalStock: number;
}
