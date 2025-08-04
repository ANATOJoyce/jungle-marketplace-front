// types/region.ts
import { Country } from "./country";

export interface Region {
  id: string;
  name: string;
  currency_code: string;
  automatic_taxes: boolean;
  countries?: Country[];
  metadata?: Record<string, unknown>;
}
