// types/order-summary.ts

export interface OrderSummary {
  id: string; // Ex: "ordsum_65f8f4..." (formatté côté toJSON)
  version: number;
  totals: Record<string, unknown>;
  order: string; // ou Order si tu fais un `populate`
  deleted_at?: Date;
  createdAt: string;
  updatedAt: string;
}
