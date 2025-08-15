import React, { useState, useMemo } from "react";
import { json, Link, useLoaderData } from "@remix-run/react";
import { Order } from "~/types/order";
import { 
  ShoppingCart, 
  Search, 
  Filter, 
  Calendar, 
  User, 
  CreditCard, 
  Truck, 
  Euro,
  ChevronDown,
  Eye,
  Package2
} from "lucide-react";

export async function loader() {
  try {
    const res = await fetch(`${process.env.PUBLIC_NEST_API_URL}/order`);

    if (!res.ok) {
      console.error("Réponse API non OK :", res.status);
      throw new Response("Échec de récupération des commandes", { status: res.status });
    }

    const data = await res.json();

    return json({
      orders: data.orders ?? [],
      total: data.total ?? 0,
      page: data.page ?? 1,
      totalPages: data.totalPages ?? 1,
    });
  } catch (error) {
    console.error("Erreur dans le loader /order :", error);
    throw new Response("Erreur de connexion à l’API", { status: 500 });
  }
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

  // Génération des options de filtres avec useMemo et sécurité sur orders
  const uniqueStatuses = useMemo(() => {
    return [...new Set(orders.map((o) => o.status).filter(Boolean))];
  }, [orders]);

  const uniquePaymentStatuses = useMemo(() => {
    return [...new Set(orders.map((o) => o.payments?.[0]?.status).filter(Boolean))];
  }, [orders]);

  const uniqueSalesChannels = useMemo(() => {
    return [...new Set(orders.map((o) => o.sales_channel?.name).filter(Boolean))];
  }, [orders]);

  // Filtrage sécurisé des commandes
  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      return (
        (filters.status ? order.status === filters.status : true) &&
        (filters.paymentStatus ? order.payments?.[0]?.status === filters.paymentStatus : true) &&
        (filters.salesChannel ? order.sales_channel?.name === filters.salesChannel : true) &&
        (searchTerm
          ? order.customer?.first_name?.toLowerCase().includes(searchTerm.toLowerCase())
          : true)
      );
    });
  }, [orders, filters, searchTerm]);

  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value,
    });
  };

  const getStatusColor = (status: string) => {
    const statusColors = {
      pending: "bg-yellow-100 text-yellow-800",
      processing: "bg-orange-100 text-orange-800",
      shipped: "bg-blue-100 text-blue-800",
      delivered: "bg-green-100 text-green-800",
      cancelled: "bg-red-100 text-red-800",
    };
    return statusColors[status as keyof typeof statusColors] || "bg-gray-100 text-gray-800";
  };

  const getPaymentStatusColor = (status: string) => {
    const paymentColors = {
      paid: "bg-green-100 text-green-800",
      pending: "bg-yellow-100 text-yellow-800",
      failed: "bg-red-100 text-red-800",
      refunded: "bg-purple-100 text-purple-800",
    };
    return paymentColors[status as keyof typeof paymentColors] || "bg-gray-100 text-gray-800";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-yellow-50 to-amber-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <div className="p-4 bg-gradient-to-r from-orange-500 to-yellow-500 rounded-2xl shadow-lg">
              <ShoppingCart className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-600 to-yellow-600 bg-clip-text text-transparent">
                Gestion des Commandes
              </h1>
              <p className="text-gray-600 mt-1">
                {total} commande{total > 1 ? 's' : ''} au total
              </p>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="flex space-x-4">
            <div className="bg-white rounded-xl shadow-lg p-4 border border-orange-100">
              <div className="flex items-center space-x-2">
                <Package2 className="h-5 w-5 text-orange-500" />
                <span className="text-sm text-gray-600">Aujourd'hui</span>
              </div>
              <div className="text-2xl font-bold text-orange-600">
                {filteredOrders.filter(order => 
                  new Date(order.createdAt).toDateString() === new Date().toDateString()
                ).length}
              </div>
            </div>
          </div>
        </div>

        {/* Filtres et Recherche */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 border border-orange-100">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Barre de recherche */}
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Rechercher par nom de client..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white"
              />
            </div>

            {/* Filtres */}
            <div className="flex flex-wrap gap-3">
              <div className="relative">
                <select
                  name="status"
                  value={filters.status}
                  onChange={handleFilterChange}
                  className="appearance-none bg-white border border-gray-200 rounded-xl px-4 py-3 pr-10 focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 cursor-pointer"
                >
                  <option value="">Tous les statuts</option>
                  {uniqueStatuses.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 pointer-events-none" />
              </div>

              <div className="relative">
                <select
                  name="paymentStatus"
                  value={filters.paymentStatus}
                  onChange={handleFilterChange}
                  className="appearance-none bg-white border border-gray-200 rounded-xl px-4 py-3 pr-10 focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 cursor-pointer"
                >
                  <option value="">Tous les paiements</option>
                  {uniquePaymentStatuses.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 pointer-events-none" />
              </div>

              <div className="relative">
                <select
                  name="salesChannel"
                  value={filters.salesChannel}
                  onChange={handleFilterChange}
                  className="appearance-none bg-white border border-gray-200 rounded-xl px-4 py-3 pr-10 focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 cursor-pointer"
                >
                  <option value="">Tous les canaux</option>
                  {uniqueSalesChannels.map((channel) => (
                    <option key={channel} value={channel}>
                      {channel}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 pointer-events-none" />
              </div>

              <button className="inline-flex items-center px-4 py-3 bg-gradient-to-r from-orange-500 to-yellow-500 text-white rounded-xl hover:from-orange-600 hover:to-yellow-600 transition-all duration-200 shadow-lg hover:shadow-xl">
                <Filter className="h-4 w-4 mr-2" />
                Filtrer
              </button>
            </div>
          </div>
        </div>

        {/* Tableau des commandes */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-orange-100">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-orange-50 to-yellow-50">
                <tr>
                  <th className="p-4 text-left text-sm font-semibold text-gray-900 border-b border-orange-100">
                    <div className="flex items-center space-x-2">
                      <ShoppingCart className="h-4 w-4 text-orange-500" />
                      <span>Commande</span>
                    </div>
                  </th>
                  <th className="p-4 text-left text-sm font-semibold text-gray-900 border-b border-orange-100">
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4 text-orange-500" />
                      <span>Date</span>
                    </div>
                  </th>
                  <th className="p-4 text-left text-sm font-semibold text-gray-900 border-b border-orange-100">
                    <div className="flex items-center space-x-2">
                      <User className="h-4 w-4 text-orange-500" />
                      <span>Client</span>
                    </div>
                  </th>
                  <th className="p-4 text-left text-sm font-semibold text-gray-900 border-b border-orange-100">
                    Canal de vente
                  </th>
                  <th className="p-4 text-left text-sm font-semibold text-gray-900 border-b border-orange-100">
                    <div className="flex items-center space-x-2">
                      <CreditCard className="h-4 w-4 text-orange-500" />
                      <span>Paiement</span>
                    </div>
                  </th>
                  <th className="p-4 text-left text-sm font-semibold text-gray-900 border-b border-orange-100">
                    <div className="flex items-center space-x-2">
                      <Truck className="h-4 w-4 text-orange-500" />
                      <span>Expédition</span>
                    </div>
                  </th>
                  <th className="p-4 text-right text-sm font-semibold text-gray-900 border-b border-orange-100">
                    <div className="flex items-center justify-end space-x-2">
                      <Euro className="h-4 w-4 text-orange-500" />
                      <span>Total</span>
                    </div>
                  </th>
                  <th className="p-4 text-center text-sm font-semibold text-gray-900 border-b border-orange-100">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredOrders.length > 0 ? (
                  filteredOrders.map((order, index) => (
                    <tr
                      key={order.id}
                      className="hover:bg-gradient-to-r hover:from-orange-50 hover:to-yellow-50 transition-all duration-200 group"
                    >
                      <td className="p-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-orange-100 to-yellow-100 rounded-xl flex items-center justify-center">
                            <span className="text-orange-600 font-semibold text-sm">
                              #{String(index + 1).padStart(2, '0')}
                            </span>
                          </div>
                          <div>
                            <Link 
                              to={`/orders/${order.id}`}
                              className="font-semibold text-orange-600 hover:text-orange-700 transition-colors duration-200"
                            >
                              {order.id}
                            </Link>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="text-gray-900 font-medium">
                          {new Date(order.createdAt).toLocaleDateString('fr-FR', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric'
                          })}
                        </div>
                        <div className="text-sm text-gray-500">
                          {new Date(order.createdAt).toLocaleTimeString('fr-FR', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-gradient-to-br from-orange-200 to-yellow-200 rounded-full flex items-center justify-center">
                            <User className="h-4 w-4 text-orange-600" />
                          </div>
                          <span className="text-gray-900 font-medium">
                            {order.customer?.first_name ?? "Client anonyme"}
                          </span>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                          {order.sales_channel?.name ?? "—"}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getPaymentStatusColor(order.payments?.[0]?.status ?? "")}`}>
                          {order.payments?.[0]?.status ?? "—"}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className="text-gray-900">
                          {order.fulfillments?.[0]?.shipping_option_details ?? "En attente"}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <div className="text-lg font-bold text-gray-900">
                          {order.total ? `${order.total.toFixed(2)} €` : "—"}
                        </div>
                      </td>
                      <td className="p-4 text-center">
                        <Link
                          to={`/orders/${order.id}`}
                          className="inline-flex items-center justify-center w-8 h-8 bg-gradient-to-r from-orange-500 to-yellow-500 text-white rounded-lg hover:from-orange-600 hover:to-yellow-600 transition-all duration-200 opacity-0 group-hover:opacity-100"
                        >
                          <Eye className="h-4 w-4" />
                        </Link>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={8} className="text-center py-12">
                      <div className="flex flex-col items-center space-y-4">
                        <div className="w-16 h-16 bg-gradient-to-br from-orange-100 to-yellow-100 rounded-2xl flex items-center justify-center">
                          <ShoppingCart className="h-8 w-8 text-orange-400" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-2">
                            Aucune commande trouvée
                          </h3>
                          <p className="text-gray-600">
                            Aucune commande ne correspond aux filtres actuels.
                          </p>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="bg-gradient-to-r from-orange-50 to-yellow-50 px-6 py-4 border-t border-orange-100">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Affichage de {filteredOrders.length} commande{filteredOrders.length > 1 ? 's' : ''} sur {total}
              </div>
              
              <div className="flex items-center space-x-3">
                <span className="text-sm text-gray-600">
                  Page {page} sur {totalPages}
                </span>
                <div className="flex space-x-1">
                  {Array.from({ length: Math.min(totalPages, 3) }, (_, i) => (
                    <button
                      key={i + 1}
                      className={`w-8 h-8 rounded-lg text-sm font-medium transition-all duration-200 ${
                        page === i + 1
                          ? 'bg-gradient-to-r from-orange-500 to-yellow-500 text-white shadow-lg'
                          : 'bg-white text-gray-600 hover:bg-orange-50 border border-gray-200'
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}