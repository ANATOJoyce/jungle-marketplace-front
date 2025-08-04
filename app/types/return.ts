// types/return.ts

import { Order } from "./order"; // interface à définir pour la commande
import { OrderExchange } from "./exchange"; // interface à définir pour l'échange
import { OrderClaim } from "./claim"; // interface à définir pour la réclamation
import { ReturnItem } from "./return-item"; // interface à définir pour l'élément de retour
import { OrderShipping } from "./order-shipping"; // interface à définir pour la méthode de livraison
import { OrderTransaction } from "./transaction"; // interface à définir pour la transaction

export interface Return {
  id: string;
  order_version: number;
  display_id: number;
  status: ReturnStatus;
  location_id: string;
  no_notification?: boolean | null;
  refund_amount?: number | null;
  created_by?: string | null;
  metadata?: Record<string, any> | null;
  requested_at?: string | null;
  received_at?: string | null;
  canceled_at?: string | null;
  order: Order | string; // Peut être un objet Order ou son ID
  exchange?: OrderExchange | string | null;
  claim?: OrderClaim | string | null;
  items: ReturnItem[] | string[]; // Liste d'objets ReturnItem ou d'ID
  shipping_methods: OrderShipping[] | string[]; // Liste d'objets OrderShipping ou d'ID
  transactions: OrderTransaction[] | string[]; // Liste d'objets OrderTransaction ou d'ID
  deleted_at?: string | null;
}

export enum ReturnStatus {
  OPEN = 'open',
  REQUESTED = 'requested',
  RECEIVED = 'received',
  CANCELED = 'canceled',
  REQUIRES_ACTION = 'requires_action',
}
