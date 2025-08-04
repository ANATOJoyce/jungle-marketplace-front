// types/shipping-profile.ts

import { ShippingOption } from "./shipping-option";

export interface ShippingProfile {
  id: string;
  name: string;
  type: string;
  shipping_options?: string[]; // IDs ou objets selon ton API
  metadata?: Record<string, unknown> | null;
  deleted_at?: string | null;
  shipping_options_details?: ShippingOption[];
}
/*La gestion des variantes dynamiques ?

Le action côté Remix pour soumettre les données au backend NestJS ?

Un système d’étapes avec navigation et validation progressive ?*/