import { Currency } from "~/types";
import { Customer } from "~/types/customer";
import { Fulfillment } from "~/types/fulfillment";
import { OrderItem } from "~/types/order-item";
import { OrderStatus } from "~/types/order-status";
import { OrderSummary } from "~/types/order-summary";
import { Payment } from "~/types/payment";


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

  // relations peuplées
  customer?: Customer;
  payments?: Payment[];
  fulfillments?: Fulfillment[];
  shipping_methods?: any[]; // à typer si tu as une entité shipping_method
  billing_address?: string | any;  // ou typé
  shipping_address?: string | any; // ou typé
  summaries?: OrderSummary;
  items?: OrderItem[];
}
