// src/components/ProductOrganize.tsx

import { FormInput } from "~/components/FormInput";

type ProductOrganizeProps = {
  categories: string[];
  collections: string[];
  shippingProfiles: string[];
  salesChannels: string[];
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  errors?: {
    category?: string;
    collection?: string;
    shippingProfile?: string;
    salesChannel?: string;
  };
  onNext?: (data: any) => void;  // Ajouter cette ligne pour accepter la prop onNext
};

export function ProductOrganize({
  categories,
  collections,
  shippingProfiles,
  salesChannels,
  onChange,
  errors,
  onNext, // Récupérer la prop onNext
}: ProductOrganizeProps) {
  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Organiser le produit</h2>

      <FormInput
        label="Catégorie"
        name="category"
        type="select"
        options={categories.map((category) => ({ value: category, label: category }))}
        onChange={onChange}
        error={errors?.category}
      />

      <FormInput
        label="Collection"
        name="collection"
        type="select"
        options={collections.map((collection) => ({ value: collection, label: collection }))}
        onChange={onChange}
        error={errors?.collection}
      />

      <FormInput
        label="Profil d'expédition"
        name="shippingProfile"
        type="select"
        options={shippingProfiles.map((profile) => ({ value: profile, label: profile }))}
        onChange={onChange}
        error={errors?.shippingProfile}
      />

      <FormInput
        label="Canaux de vente"
        name="salesChannel"
        type="select"
        options={salesChannels.map((channel) => ({ value: channel, label: channel }))}
        onChange={onChange}
        error={errors?.salesChannel}
      />

      {/* Bouton suivant pour appeler onNext */}
      <button
        type="button"
        onClick={() => onNext && onNext({ category: "Sample", collection: "Sample" })} // Passer les données au onNext
        className="bg-blue-500 text-white px-4 py-2 rounded mt-4"
      >
        Suivant
      </button>
    </div>
  );
}
