import { PromotionCondition } from "./promotion_conditions";
import { Store } from "./store";

export interface Promotion {
  _id: string;
  type: "amount_off_order" | "amount_off_products" | "buy_x_get_y" | "free_shipping";
  method: "code" | "automatic";
  code?: string;
  value?: number;
  max_quantity?: number;
  quantityX?: number;
  quantityY?: number;
  status: "active" | "draft" | "expired";
  starts_at?: string;
  ends_at?: string;
  condition: PromotionCondition;
  store: Store;
  createdAt: string;
  updatedAt: string;
}
