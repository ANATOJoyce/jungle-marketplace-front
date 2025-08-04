// types/shipping-option.ts


import { Fulfillment } from "./fulfillment";
import { FulfillmentProvider } from "./fulfillment-provider";
import { ServiceZone } from "./service-zone";
import { ShippingOptionRule } from "./shipping-option-rule";
import { ShippingOptionType } from "./shipping-option-type";
import { ShippingProfile } from "./shipping-profile";

export type ShippingOptionPriceType = "flat" | "calculated";

export interface ShippingOption {
  id: string;
  name: string;
  price_type: ShippingOptionPriceType;
  data?: Record<string, unknown> | null;
  metadata?: Record<string, unknown> | null;

  service_zone: string | ServiceZone;
  shipping_profile?: string | ShippingProfile | null;
  provider?: string | FulfillmentProvider | null;
  type?: string | ShippingOptionType | null;

  rules?: (string | ShippingOptionRule)[];
  fulfillments?: (string | Fulfillment)[];

  service_zone_details?: ServiceZone;
  shipping_profile_details?: ShippingProfile | null;
  provider_details?: FulfillmentProvider | null;
  type_details?: ShippingOptionType | null;
  rules_details?: ShippingOptionRule[];
  fulfillments_details?: Fulfillment[];
}
