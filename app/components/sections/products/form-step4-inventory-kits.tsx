// components/product/form-step4-inventory-kits.tsx

import { InventoryItem } from "~/types/inventory";

type Props = {
  inventoryItems: InventoryItem[];
};

export function Step4InventoryKits({ inventoryItems }: Props) {
  return (
    <section className="mb-6">
      <h2 className="text-lg font-semibold mb-2">Kits d'inventaire</h2>
      {/* Ex. : choix des composants d’un kit */}
      <ul>
        {inventoryItems.map((item) => (
          <li key={item.sku}>
            {item.product.name} ({item.stock_quantity} en stock)
          </li>
        ))}
      </ul>
    </section>
  );
}
