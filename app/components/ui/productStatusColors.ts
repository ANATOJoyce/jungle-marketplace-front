export enum ProductStatus {
  DRAFT = 'draft', // Nomvisible
  PROPOSED = 'proposed', // Propose
  PUBLISHED = 'published', // Publié
  REJECTED = 'rejected', // Rejeté
}

// Couleurs associées à chaque statut de produit
export const productStatusColors = {
  [ProductStatus.DRAFT]: '#A9A9A9', // Gris pour "Draft"
  [ProductStatus.PROPOSED]: '#FFA500', // Orange pour "Proposed"
  [ProductStatus.PUBLISHED]: '#28a745', // Vert pour "Published"
  [ProductStatus.REJECTED]: '#dc3545', // Rouge pour "Rejected"
};
