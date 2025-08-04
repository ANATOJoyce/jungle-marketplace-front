// types/order-claim.ts

import { Order } from "./order"; // à relier à l'interface `Order`
import { OrderShipping } from "./order-shipping"; // interface à définir
import { Return } from "./return"; // interface à définir
import { OrderTransaction } from "./order-transaction"; // interface à définir
import { OrderClaimItem } from "./order-claim-item";

export enum ClaimType {
  REFUND = 'refund',
  REPLACEMENT = 'replacement',
}

export interface OrderClaim {
  id: string; // ex: "claim_..."

  order_version: number; // Version de la commande à laquelle la réclamation est associée
  display_id: number; // Identifiant unique de la réclamation à afficher

  type: ClaimType; // Type de réclamation : remboursement ou remplacement

  no_notification?: boolean; // Indique si aucune notification ne doit être envoyée

  refund_amount?: number; // Montant du remboursement (si applicable)

  created_by?: string; // Utilisateur ayant créé la réclamation

  canceled_at?: string; // Date à laquelle la réclamation a été annulée (si applicable)

  metadata?: Record<string, any>; // Métadonnées supplémentaires concernant la réclamation

  order: string | Order; // L'ID ou l'objet complet de la commande concernée

  return?: string | Return; // L'ID ou l'objet de la "Return" associée à la réclamation

  additional_items: (string | OrderClaimItem)[]; // Liste des articles supplémentaires dans la réclamation

  claim_items: (string | OrderClaimItem)[]; // Liste des articles réclamés

  shipping_methods: (string | OrderShipping)[]; // Liste des méthodes d'expédition associées à la réclamation

  transactions: (string | OrderTransaction)[]; // Liste des transactions associées à la réclamation

  deleted_at?: string; // Date de suppression en cas de suppression douce (soft delete)

  createdAt: string;
  updatedAt: string;
}
