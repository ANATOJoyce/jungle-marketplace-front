import { Currency } from "./currency";
import { ProductVariant } from "./product-variant";

export interface MoneyAmount {
  id: string;
  amount: number;
  currency_code: string;
  currency?: string | Currency; // id ou objet Currency
  variant?: string | ProductVariant; // id ou objet ProductVariant
  deleted_at?: string | null;
}
