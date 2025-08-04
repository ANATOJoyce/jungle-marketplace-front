// types/order-change.ts

import { Order } from "./order"; // interface principale des commandes
import { OrderChangeAction } from "./order-change-action";

export type OrderChangeStatus = "pending" | "confirmed" | "declined" | "canceled";

export interface OrderChange {
  id: string; // ex: "ordch_..."

  return_id?: string;
  claim_id?: string;
  exchange_id?: string;

  version: number;
  change_type?: string;
  description?: string;

  status: OrderChangeStatus;

  internal_note?: string;
  created_by?: string;
  requested_by?: string;
  requested_at?: string;

  confirmed_by?: string;
  confirmed_at?: string;

  declined_by?: string;
  declined_reason?: string;
  declined_at?: string;

  canceled_by?: string;
  canceled_at?: string;

  metadata?: Record<string, unknown>;

  order: string | Order; // l'ID ou l'objet Order
  actions: (string | OrderChangeAction)[];

  deleted_at?: string;
  createdAt: string;
  updatedAt: string;
}
