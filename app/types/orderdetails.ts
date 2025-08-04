import { Customer } from "./customer";
import { Fulfillment } from "./fulfillment";
import { Payment } from "./payment";
import { Currency } from "./currency";
import { OrderItem } from "./order-item";
import { OrderStatus } from "./order-status";
import { OrderSummary } from "./order-summary";
import { ShippingMethod } from "./shipping_method";

export interface OrderDetails {
  id: string;
  display_id?: number | null;
  status: OrderStatus;
  currency_code: Currency;
  total: number;
  metadata?: Record<string, unknown>;

  createdAt: string;
  updatedAt: string;
  deleted_at?: Date;

  store: string;

  customer?: Customer;
  payments?: Payment[];
  fulfillments?: Fulfillment[];
  shipping_methods?: ShippingMethod[];
  billing_address?: any;
  shipping_address?: any;
  summaries?: OrderSummary;
  items?: OrderItem[];
}
