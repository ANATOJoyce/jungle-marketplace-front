import { useLoaderData } from "@remix-run/react";
import type { LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/node";

type DashboardData = {
  totalProducts: number;
  totalCustomers: number;
  totalPromotions: number;
  totalOrders: number;
};
/*
export const loader: LoaderFunction = async () => {
  // Appelle ton API NestJS pour récupérer les données du dashboard
  const [productsRes, customersRes, promotionsRes, ordersRes] = await Promise.all([
    fetch("http://localhost:3000/products"),
    fetch("http://localhost:3000/customers"),
    fetch("http://localhost:3000/promotions"),
    fetch("http://localhost:3000/orders"),
  ]);

  const [totalProducts, totalCustomers, totalPromotions, totalOrders] = await Promise.all([
    productsRes.json(),
    customersRes.json(),
    promotionsRes.json(),
    ordersRes.json(),
  ]);

  return json({
    totalProducts,
    totalCustomers,
    totalPromotions,
    totalOrders,
  });
};*/

export default function Dashboard() {
  const { totalProducts, totalCustomers, totalPromotions, totalOrders } = useLoaderData<DashboardData>();

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold">Tableau de bord</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
        <StatCard title="Produits" value={totalProducts} />
        <StatCard title="Clients" value={totalCustomers} />
        <StatCard title="Promotions" value={totalPromotions} />
        <StatCard title="Commandes" value={totalOrders} />
      </div>
    </div>
  );
}

function StatCard({ title, value }: { title: string; value: number }) {
  return (
    <div className="bg-white shadow rounded-lg p-4 text-center">
      <p className="text-gray-500">{title}</p>
      <p className="text-2xl font-semibold">{value}</p>
    </div>
  );
}
