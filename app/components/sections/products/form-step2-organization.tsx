// components/product/form-step2-organization.tsx

import { ProductCategory } from "~/types/product-category";
import { ProductCollection } from "~/types/product-collection";
import { ProductType } from "~/types/product-type";
import { SalesChannel } from "~/types/sales-channel";
import { ShippingProfile } from "~/types/shipping-profile";


type Props = {
  types: ProductType[];
  collections: ProductCollection[];
  categories: ProductCategory[];
  shippingProfiles: ShippingProfile[];
  salesChannels: SalesChannel[];
};

export function Step2Organization({
  types,
  collections,
  categories,
  shippingProfiles,
  salesChannels,
}: Props) {
  return (
    <section className="mb-6">
      <h2 className="text-lg font-semibold mb-2">Organisation</h2>
      {/* Ajouter les selects selon les props reçus */}
      {/* Exemples */}
      <select name="type">
        {types.map((t) => (
          <option key={t.id} value={t.id}>
            {t.value}
          </option>
        ))}
      </select>
      {/* À continuer selon besoin... */}
    </section>
  );
}
