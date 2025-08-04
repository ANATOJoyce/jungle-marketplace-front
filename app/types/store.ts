// types/store.ts
import { User } from "./user";

export interface Store {
  id: string;
  name: string;
  default_sales_channel_id?: string;
  default_region_id?: string;
  default_location_id?: string;
  metadata?: Record<string, unknown>;
  owner?: User;
  supported_currencies?: string[]; // Ids des devises supportées
}
