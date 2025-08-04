import { CustomerGroup } from "./customer-group";

export interface Customer {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  has_account: boolean;
  metadata?: Record<string, any>;
  created_by?: string;
  customers?: CustomerGroup[];
  groups?: string[];    // ou CustomerGroupCustomer[]
  addresses?: string[]; // ou CustomerAddress[]
  deleted_at?: Date;
  createdAt: string;
  updatedAt: string;
}
