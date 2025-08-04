// src/types/index.ts
export interface Currency {
  code: string;
  name: string;
  symbol: string;
}

export interface Region {
  id: string;
  name: string;
  taxRate: number;
  currencyCode: string;
  createdAt?: string;
  updatedAt?: string;
}

// Type pour la création d'une région (sans les champs auto-générés)
export type RegionInput = Pick<Region, 'name' | 'taxRate' | 'currencyCode'>;

// Type pour la mise à jour d'une région (tous les champs optionnels sauf l'ID)
export type RegionUpdate = Partial<RegionInput> & { id: string };