// types/sales-channel.ts
export interface SalesChannel {
  id: string;
  name: string;
  description?: string;
  is_disabled: boolean;
  is_default?: boolean;
  currency_code?: string;
  region_id?: string;
  metadata?: Record<string, unknown>;
}
