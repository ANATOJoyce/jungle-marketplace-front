// types/order.ts

import { Currency } from "./currency";
import { Customer } from "./customer";
import { OrderItem } from "./order-item";
import { OrderStatus } from "./order-status";
import { Payment } from "./payment";
import { SalesChannel } from "./sales-channel";

export interface Order {
  _id: string;
  display_id?: number | null;
  status: OrderStatus;
  currency_code: Currency;
  metadata?: Record<string, unknown>;
  store: {
    id: string;
    name?: string;
  };
  customer?: Customer;
  email: string;
  items?: OrderItem[]; // liste d'objets OrderItem avec produit, qty, price
  payments?: Payment[];
  sales_channel?: SalesChannel;
  total: number;
  createdAt: string;
  updatedAt: string;
  deleted_at?: Date;
}
