// types/order-claim-item.ts

import { OrderClaim } from "./order-claim"; // interface à définir
import { OrderLineItem } from "./order-line-item"; // interface à définir
import { OrderClaimItemImage } from "./order-claim-item-image"; // interface à définir

export enum ClaimReason {
  MISSING_ITEM = 'missing_item',
  WRONG_ITEM = 'wrong_item',
  PRODUCTION_FAILURE = 'production_failure',
  OTHER = 'other',
}

export interface OrderClaimItem {
  id: string; // ID unique de l'élément de réclamation (ex: "claitem_...")

  reason?: ClaimReason; // Raisons de la réclamation, comme item manquant, erreur dans l'article, etc.

  quantity: number; // Quantité de l'article réclamé

  is_additional_item: boolean; // Indique si c'est un article supplémentaire à la réclamation

  note?: string; // Remarque ou commentaire supplémentaire pour l'élément

  metadata?: Record<string, any>; // Métadonnées liées à l'élément de réclamation

  claim: string | OrderClaim; // L'ID ou l'objet complet de la réclamation

  item: string | OrderLineItem; // L'ID ou l'objet complet de l'article dans la commande concernée

  images: (string | OrderClaimItemImage)[]; // Liste des images de l'élément réclamé

  deleted_at?: string; // Date de suppression si applicable

  createdAt: string; // Date de création de l'élément de réclamation
  updatedAt: string; // Date de mise à jour de l'élément de réclamation
}
