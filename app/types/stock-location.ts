// types/stock-location.ts
export interface StockLocation {
  id: string;
  name: string;
  metadata?: Record<string, unknown>;
  address?: string; // id de l'adresse stockée
}
