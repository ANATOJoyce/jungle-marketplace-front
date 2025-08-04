export interface ShippingMethod {
  name: string;
  description?: Record<string, any> | null;
  amount: number;
  is_tax_inclusive: boolean;
  is_custom_amount: boolean;
  shipping_option_id?: string;
  data?: Record<string, any> | null;
  metadata?: Record<string, any> | null;
  cart: string; // ObjectId
  tax_lines: string[]; // ObjectId[]
  adjustments: string[]; // ObjectId[]
  deleted_at?: Date;
  createdAt: string;
  updatedAt: string;
}
