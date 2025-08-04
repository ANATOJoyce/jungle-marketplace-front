// src/components/ProductInventoryKit.tsx

import { useState } from "react";
import { FormInput } from "~/components/FormInput";

type InventoryItem = {
  name: string;
  quantity: number;
};

type ProductInventoryKitProps = {
  inventoryItems: InventoryItem[];
  onAddInventoryItem: (item: InventoryItem) => void;
  onRemoveInventoryItem: (name: string) => void;
};

export function ProductInventoryKit({
  inventoryItems,
  onAddInventoryItem,
  onRemoveInventoryItem,
}: ProductInventoryKitProps) {
  const [newItem, setNewItem] = useState<InventoryItem>({ name: "", quantity: 1 });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewItem((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAddItem = () => {
    if (newItem.name && newItem.quantity > 0) {
      onAddInventoryItem(newItem);
      setNewItem({ name: "", quantity: 1 });
    }
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Kits d'inventaire</h2>

      <div className="mb-4">
        <FormInput
          label="Nom de l'article"
          name="name"
          type="text"
          value={newItem.name}
          onChange={handleInputChange}
        />

        <FormInput
          label="Quantité"
          name="quantity"
          type="number"
          value={newItem.quantity.toString()}
          onChange={handleInputChange}
        />

        <button
          type="button"
          className="bg-blue-500 text-white px-4 py-2 rounded"
          onClick={handleAddItem}
        >
          Ajouter un article
        </button>
      </div>

      <div>
        <h3 className="font-semibold">Articles du kit</h3>
        {inventoryItems.length === 0 ? (
          <p>Aucun article ajouté.</p>
        ) : (
          <ul>
            {inventoryItems.map((item) => (
              <li key={item.name} className="flex justify-between items-center">
                <span>{`${item.name} - Quantité: ${item.quantity}`}</span>
                <button
                  onClick={() => onRemoveInventoryItem(item.name)}
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
