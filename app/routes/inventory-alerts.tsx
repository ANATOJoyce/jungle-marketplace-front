import { json } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import LowStockAlert from '~/components/LowStockAlert';
import { isInventoryItemArray } from '~/types/inventory';

export const loader = async () => {
  const response = await fetch(`${process.env.PUBLIC_NEST_API_URL}/inventory/alerts/low-stock/10`);
  const data = await response.json();

  if (!isInventoryItemArray(data)) {
    console.error('Invalid inventory data structure', data);
    throw json('Invalid inventory data', { status: 500 });
  }

  return json(data);
};


export default function InventoryAlerts() {
  const lowStockItems = useLoaderData<typeof loader>();
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Alertes de Stock Faible</h1>
      <LowStockAlert items={lowStockItems} />
    </div>
  );
}