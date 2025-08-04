// types/order-address.ts

export interface OrderAddress {
  id: string; // Ex: "ordaddr_..."
  customer_id?: string;
  company?: string;
  first_name?: string;
  last_name?: string;
  address_1?: string;
  address_2?: string;
  city?: string;
  country_code?: string;
  province?: string;
  postal_code?: string;
  phone?: string;
  metadata?: Record<string, any>;

  createdAt: string;
  updatedAt: string;
}
