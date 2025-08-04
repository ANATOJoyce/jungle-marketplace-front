// types/order-item.ts

export interface OrderItem {
  id: string; // Ex: "orditem_..."
  version: number;

  unit_price?: string;
  compare_at_unit_price?: string;

  quantity: string;
  fulfilled_quantity: string;
  delivered_quantity: string;
  shipped_quantity: string;
  return_requested_quantity: string;
  return_received_quantity: string;
  return_dismissed_quantity: string;
  written_off_quantity: string;

  metadata?: Record<string, unknown>;

  order: string; // ID de la commande
  item: string;  // ID de OrderLineItem

  deleted_at?: Date;
  createdAt: string;
  updatedAt: string;
}
