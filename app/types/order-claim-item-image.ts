// types/order-claim-item-image.ts

import { OrderClaimItem } from "./order-claim-item"; // interface à définir

export interface OrderClaimItemImage {
  id: string; // ID unique de l'image (ex: "climg_...")

  claim_item: string | OrderClaimItem; // Référence à l'élément de réclamation auquel cette image est liée

  url: string; // L'URL de l'image

  metadata?: Record<string, any>; // Métadonnées supplémentaires liées à l'image (ex: format, taille)

  deleted_at?: string; // Date de suppression si applicable

  createdAt: string; // Date de création de l'image
  updatedAt: string; // Date de mise à jour de l'image
}
