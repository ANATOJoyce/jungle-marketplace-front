// types/order.ts

import { Currency } from "./currency";
import { Customer } from "./customer";
import { Fulfillment } from "./fulfillment";
import { OrderItem } from "./order-item";
import { OrderStatus } from "./order-status";
import { OrderSummary } from "./order-summary";
import { Payment } from "./payment";
import { SalesChannel } from "./sales-channel";

export interface Order {
  id: string;
  display_id?: number | null;
  status: OrderStatus;
  currency_code: Currency;
  metadata?: Record<string, unknown>;
  store: string; // ObjectId en string
  email: string;
  shipping_address?: string | null; // ObjectId en string
  billing_address?: string | null;  // ObjectId en string
  summaries?: OrderSummary;             // ObjectId[] en string
  items?: OrderItem;                 // ObjectId[] en string
  shipping_methods?: string[];      // ObjectId[] en string
  deleted_at?: Date;
  total: number;
  createdAt: string;
  updatedAt: string;
    customer?: Customer;
  payments?: Payment[];
  fulfillments?: Fulfillment[];
  sales_channel?: SalesChannel;
}
