// types/sales-channel.ts
export interface SalesChannel {
  id: string;
  name: string;
  description?: string;
  is_disabled: boolean;
  metadata?: Record<string, unknown>;
}
