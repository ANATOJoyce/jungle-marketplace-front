// types/store.ts
import { User } from "./user";

export interface Store {
  id: string;
  name: string;
  default_sales_channel_id: string;
  default_region_id: string;
  default_location_id: string | null;
  supported_currencies: string[];
  owner: string | {
    first_name?: string;
    last_name?: string;
    email?: string;
  };
  status?: "active" | "inactive";
    createdAt: string,
    updatedAt: string,
}

