// types/shipping-option-rule.ts

import { ShippingOption } from "./shipping-option";

export type RuleOperator = "in" | "eq" | "ne" | "gt" | "gte" | "lt" | "lte" | "nin";

export interface ShippingOptionRule {
  id: string;
  attribute: string;
  operator: RuleOperator;
  value?: any | null;
  shipping_option: string | ShippingOption;

  shipping_option_details?: ShippingOption;
}
