import { CustomerGroup } from "./customer-group";

export interface Customer {
  _id: string;
  phone: string;
  name: string;
  created_by?: string;
  customers?: CustomerGroup[];
  groups?: string[];    // ou CustomerGroupCustomer[]
  addresses?: string[]; // ou CustomerAddress[]
  deleted_at?: Date;
  createdAt: string;
  updatedAt: string;
}
