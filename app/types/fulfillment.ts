export interface Fulfillment {
  id: string;
  location_id: string;
  packed_at: Date | null;
  shipped_at: Date | null;
  marked_shipped_by: string | null;
  created_by: string | null;
  delivered_at: Date | null;
  canceled_at: Date | null;
  data?: Record<string, any> | null;
  requires_shipping: boolean;

  items: string[]; // ou FulfillmentItem[]
  labels: string[]; // ou FulfillmentLabel[]
  provider?: string; // ou FulfillmentProvider
  shipping_option?: string; // ou ShippingOption
  delivery_address?: string; // ou FulfillmentAddress
  metadata?: Record<string, any> | null;
  deleted_at?: Date | null;
  order: string;

  // Relations peuplées possibles (facultatif selon ton backend)
  items_details?: any[];
  labels_details?: any[];
  provider_details?: any;
  shipping_option_details?: any;
  delivery_address_details?: any;

  createdAt: string;
  updatedAt: string;
}
