// types/product-variant.ts
import { ProductOptionValue } from "./product-option-value";
import { MoneyAmount } from "./money-amount";
export interface ProductVariant {
  id: string;
  color: string;  // Par exemple, cela peut être "Couleur : Rouge"
  price: number;
  stock: number;
  size: string;
  // D'autres champs ici...
}
