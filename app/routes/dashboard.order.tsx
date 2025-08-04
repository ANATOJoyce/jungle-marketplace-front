import { useState } from "react";
import { Link, useLoaderData } from "@remix-run/react";
import { Order } from "~/types/order";

export async function loader() {
  const res = await fetch("http://localhost:3000/order");
  return await res.json();
}

export default function OrderListPage() {
  const { orders, total, page, totalPages } = useLoaderData<{
    orders: Order[];
    total: number;
    page: number;
    totalPages: number;
  }>();

  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    status: "",
    paymentStatus: "",
    salesChannel: "",
  });

  // 🔁 Génération dynamique des options de filtres
  const uniqueStatuses = [...new Set(orders.map((o) => o.status).filter(Boolean))];
  const uniquePaymentStatuses = [...new Set(
    orders.map((o) => o.payments?.[0]?.status).filter(Boolean)
  )];
  const uniqueSalesChannels = [...new Set(
    orders.map((o) => o.sales_channel?.name).filter(Boolean)
  )];

  // 🎯 Application des filtres et recherche
  const filteredOrders = orders.filter((order) => {
    return (
      (filters.status ? order.status === filters.status : true) &&
      (filters.paymentStatus ? order.payments?.[0]?.status === filters.paymentStatus : true) &&
      (filters.salesChannel ? order.sales_channel?.name === filters.salesChannel : true) &&
      (searchTerm ? order.customer?.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) : true)
    );
  });

  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">Liste des Commandes</h1>

      {/* 🎛️ Filtres */}
      <div className="mb-4 flex gap-4 items-end flex-wrap">
        <input
          type="text"
          placeholder="Rechercher par client..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="border rounded px-2 py-1"
        />

        <select
          name="status"
          value={filters.status}
          onChange={handleFilterChange}
          className="border rounded px-2 py-1"
        >
          <option value="">Tous les statuts</option>
          {uniqueStatuses.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>

        <select
          name="paymentStatus"
          value={filters.paymentStatus}
          onChange={handleFilterChange}
          className="border rounded px-2 py-1"
        >
          <option value="">Tous les paiements</option>
          {uniquePaymentStatuses.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>

        <select
          name="salesChannel"
          value={filters.salesChannel}
          onChange={handleFilterChange}
          className="border rounded px-2 py-1"
        >
          <option value="">Tous les canaux</option>
          {uniqueSalesChannels.map((channel) => (
            <option key={channel} value={channel}>
              {channel}
            </option>
          ))}
        </select>
      </div>

      {/* 📊 Tableau des commandes */}
      <table className="w-full border rounded">
        <thead>
          <tr className="bg-gray-100">
            <th>Order ID</th>
            <th>Date</th>
            <th>Client</th>
            <th>Canal de vente</th>
            <th>Paiement</th>
            <th>Expédition</th>
            <th>Total</th>
          </tr>
        </thead>
        <tbody>
          {filteredOrders.length > 0 ? (
            filteredOrders.map((order: any) => (
              <tr key={order._id} className="border-t hover:bg-gray-50">
                <td>
                  <Link
                    to={`/orders/${order._id}`}
                    className="text-blue-600 underline"
                  >
                    {order._id}
                  </Link>
                </td>
                <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                <td>{order.customer?.name || "—"}</td>
                <td>{order.sales_channel?.name || "—"}</td>
                <td>{order.payments?.[0]?.status || "—"}</td>
                <td>{order.fulfillments?.[0]?.status || "—"}</td>
                <td>{order.total?.toFixed(2)} €</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={7} className="text-center py-4">
                Aucune commande trouvée avec les filtres actuels.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
