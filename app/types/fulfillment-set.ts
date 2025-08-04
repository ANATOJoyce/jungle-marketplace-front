// types/fulfillment-set.ts

import { ServiceZone } from "./service-zone";

export interface FulfillmentSet {
  id: string;
  name: string;
  type: string;
  service_zones: (string | ServiceZone)[];
  metadata?: Record<string, any> | null;
  deleted_at?: string | null;

  service_zones_details?: ServiceZone[];
}
