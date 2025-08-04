// types/order-change-action.ts

import { OrderChange } from "./order-change"; // à relier à l'interface `OrderChange`
import { Order } from "./order"; // à relier à l'interface `Order`
import { Return } from "./return"; // interface à définir
import { Claim } from "./claim"; // interface à définir
import { Exchange } from "./exchange"; // interface à définir

export interface OrderChangeAction {
  id: string; // ex: "ordcha_..."

  order_id: string | Order; // L'ID ou l'objet `Order`
  return_id?: string | Return; // L'ID ou l'objet `Return`
  claim_id?: string | Claim; // L'ID ou l'objet `Claim`
  exchange_id?: string | Exchange; // L'ID ou l'objet `Exchange`

  ordering: number; // Ordre de l'action
  version?: number;
  reference?: string;
  reference_id?: string;

  action: string; // Type d'action (par exemple "accept", "decline", "modify")
  details: Record<string, any>; // Détails spécifiques à l'action

  amount?: number; // Montant associé à l'action (si applicable)

  internal_note?: string; // Note interne pour l'action

  applied: boolean; // Si l'action a été appliquée ou non

  order_change?: string | OrderChange; // L'ID ou l'objet `OrderChange`

  deletedAt?: string; // Date de suppression si soft delete
  createdAt: string;
  updatedAt: string;
}
