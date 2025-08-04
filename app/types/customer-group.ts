export interface CustomerGroup {
  id: string;
  name: string;
  metadata?: Record<string, unknown>;
  customers?: { _id: string }[];
  created_at?: string;
  updated_at?: string;
}