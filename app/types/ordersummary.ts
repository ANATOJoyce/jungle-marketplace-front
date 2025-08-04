export interface OrderSummary {
  id?: string;
  version: number;
  totals: Record<string, unknown>;
  order: string; // ObjectId
  deleted_at?: Date;
  createdAt: string;
  updatedAt: string;
}
