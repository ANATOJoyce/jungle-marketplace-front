// types/geo-zone.ts

import { ServiceZone } from "./service-zone";


export type GeoZoneType = "country" | "province" | "city" | "zip";

export interface GeoZone {
  id: string;
  type: GeoZoneType;
  country_code: string;
  province_code?: string | null;
  city?: string | null;
  postal_expression?: Record<string, unknown> | null;
  service_zone: string | ServiceZone;
  metadata?: Record<string, unknown> | null;
  deleted_at?: string | null;

  service_zone_details?: ServiceZone;
}
