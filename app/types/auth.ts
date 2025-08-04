import { Role } from "./role.enum";

export type RegisterDto = {
  first_name: string;
  last_name: string;
  phone: string;
  email: string;
  password: string;
  shop_name: string,
  company_type:string;
  role:Role.VENDOR;
  address:string;

};
