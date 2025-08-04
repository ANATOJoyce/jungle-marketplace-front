// src/components/ProductVariants.tsx
import { useState } from "react";
import { FormInput } from "~/components/FormInput";

type ProductVariant = {
  id: string;
  color: string;
  size: string;
  sku: string;
  price: number;
};

type ProductVariantsProps = {
  variants: ProductVariant[];
  onAddVariant: (variant: ProductVariant) => void;
  onRemoveVariant: (id: string) => void;
};

export function ProductVariants({
  variants,
  onAddVariant,
  onRemoveVariant,
}: ProductVariantsProps) {
  const [newVariant, setNewVariant] = useState<ProductVariant>({
    id: "",
    color: "",
    size: "",
    sku: "",
    price: 0,
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setNewVariant((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAddVariant = () => {
    if (newVariant.color && newVariant.size && newVariant.sku && newVariant.price) {
      onAddVariant(newVariant);
      setNewVariant({ id: "", color: "", size: "", sku: "", price: 0 });
    }
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Gérer les variantes du produit</h2>

      <div className="mb-4">
        <FormInput
          label="Couleur"
          name="color"
          type="text"
          value={newVariant.color}
          onChange={handleInputChange}
        />

        <FormInput
          label="Taille"
          name="size"
          type="text"
          value={newVariant.size}
          onChange={handleInputChange}
        />

        <FormInput
          label="SKU"
          name="sku"
          type="text"
          value={newVariant.sku}
          onChange={handleInputChange}
        />

        <FormInput
          label="Prix"
          name="price"
          type="number"
          value={newVariant.price.toString()}
          onChange={handleInputChange}
        />

        <button
          type="button"
          className="bg-green-500 text-white px-4 py-2 rounded"
          onClick={handleAddVariant}
        >
          Ajouter la variante
        </button>
      </div>

      <div>
        <h3 className="font-semibold">Variantes existantes</h3>
        {variants.length === 0 ? (
          <p>Aucune variante ajoutée.</p>
        ) : (
          <ul>
            {variants.map((variant) => (
              <li key={variant.id} className="flex justify-between items-center">
                <span>{`${variant.color} - ${variant.size} - ${variant.sku}`}</span>
                <button
                  onClick={() => onRemoveVariant(variant.id)}
                  className="text-red-500 hover:text-red-700"
                >
                  Supprimer
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
