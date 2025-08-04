import type { InventoryItem } from '~/validators/inventory';

interface InventoryListProps {
  items: InventoryItem[];
}
export default function InventoryList({ items }: { items: InventoryItem[] }) {
  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-lg">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">SKU</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Produit</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Emplacement</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {items.map((item) => (
            <tr key={item.sku}>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.sku}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.product?.name}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.location?.name || 'N/A'}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                  ${item.stock_quantity < 10 ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                  {item.stock_quantity}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <a href={`/inventory/${item.sku}`} className="text-blue-600 hover:text-blue-900 mr-4">Voir</a>
                <a href={`/inventory/edit.${item.sku}`} className="text-indigo-600 hover:text-indigo-900">Modifier</a>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}