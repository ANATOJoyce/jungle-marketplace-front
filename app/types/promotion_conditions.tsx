import { Customer } from "./customer";
import { Product } from "./product";
import { Promotion } from "./promotion";


export interface PromotionCondition {
  _id: string;
  allowedUsers: Customer[];
  allowedProducts: Product[];
  type:Promotion["type"];
  createdAt: string;
  updatedAt: string;
};

