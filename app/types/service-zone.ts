// types/service-zone.ts

import { FulfillmentSet } from "./fulfillment-set";
import { GeoZone } from "./geo-zone";
import { ShippingOption } from "./shipping-option";

export interface ServiceZone {
  id: string;
  name: string;
  fulfillment_set: string | FulfillmentSet;
  geo_zones: (string | GeoZone)[];
  shipping_options: (string | ShippingOption)[];
  metadata?: Record<string, unknown> | null;
  deleted_at?: string | null;

  fulfillment_set_details?: FulfillmentSet;
  geo_zones_details?: GeoZone[];
  shipping_options_details?: ShippingOption[];
}
