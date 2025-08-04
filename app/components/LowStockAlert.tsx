import type { InventoryItem } from '~/types/inventory';

interface LowStockAlertProps {
  items: InventoryItem[];
}

export default function LowStockAlert({ items }: LowStockAlertProps) {
  if (items.length === 0) {
    return (
      <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative" role="alert">
        <strong className="font-bold">Aucune alerte ! </strong>
        <span className="block sm:inline">Tous les stocks sont à un niveau satisfaisant.</span>
      </div>
    );
  }

  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-lg">
      <div className="px-4 py-5 sm:px-6 bg-red-50">
        <h3 className="text-lg leading-6 font-medium text-red-800">
          Articles avec stock faible (&lt; 10 unités)
        </h3>
      </div>
      <div className="border-t border-gray-200">
        <ul className="divide-y divide-gray-200">
          {items.map((item) => (
            <li key={item.sku} className="px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="text-sm font-medium text-gray-900">
                    {item.product.name}
                  </div>
                  <div className="ml-2 text-sm text-gray-500">
                    (SKU: {item.sku})
                  </div>
                </div>
                <div className="text-sm text-red-600 font-bold">
                  Stock: {item.stock_quantity}
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}