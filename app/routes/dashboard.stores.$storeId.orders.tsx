// app/routes/stores/$storeId/orders.tsx
import { useLoaderData, Link, useSearchParams } from "@remix-run/react";
import type { LoaderFunctionArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { getSession } from "~/utils/session.server";
import { Order } from "~/types/order";
import { 
  Plus, 
  Eye, 
  ShoppingCart, 
  ChevronLeft, 
  ChevronRight,
  Search,
  Filter,
  Calendar,
  DollarSign,
  Package,
  User,
  Clock,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  XCircle,
  Truck,
  CreditCard,
  RotateCcw,
  SortAsc,
  SortDesc,
  Download,
  Grid,
  List as ListIcon
} from "lucide-react";
import { useState, useEffect } from "react";

interface LoaderData {
  orders: Order[];
  meta: {
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  };
  error?: string;
}

export async function loader({ request, params }: LoaderFunctionArgs) {
  const session = await getSession(request.headers.get("Cookie"));
  const token = session.get("token");
  const storeId = params.storeId;

  if (!token) return redirect("/login");
  if (!storeId) {
    return json({
      orders: [],
      meta: { total: 0, page: 1, pageSize: 10, totalPages: 1 },
      error: "ID de boutique manquant."
    });
  }
  
  const url = new URL(request.url);
  const page = parseInt(url.searchParams.get("page") || "1", 10);
  const limit = parseInt(url.searchParams.get("limit") || "10", 10);
  const search = url.searchParams.get("search") || "";
  const status = url.searchParams.get("status") || "";
  const sortBy = url.searchParams.get("sortBy") || "createdAt";
  const sortOrder = url.searchParams.get("sortOrder") || "desc";

  try {
    const apiUrl = new URL(`${process.env.NEST_API_URL}/orders/store/${storeId}`);
    apiUrl.searchParams.append("page", page.toString());
    apiUrl.searchParams.append("limit", limit.toString());
    apiUrl.searchParams.append("sortBy", sortBy);
    apiUrl.searchParams.append("sortOrder", sortOrder);
    if (search) apiUrl.searchParams.append("search", search);
    if (status) apiUrl.searchParams.append("status", status);

    const response = await fetch(apiUrl.toString(), {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (!response.ok) {
      const text = await response.text();
      return json({
        orders: [],
        meta: { total: 0, page: 1, pageSize: limit, totalPages: 1 },
        error: `Erreur backend: ${text}`
      });
    }

    const data = await response.json();
    return json({
      orders: data.orders || [],
      meta: data.meta || { total: 0, page: 1, pageSize: limit, totalPages: 1 },
    });
  } catch (err) {
    console.error(err);
    return json({
      orders: [],
      meta: { total: 0, page: 1, pageSize: limit, totalPages: 1 },
      error: "Erreur lors de la récupération des commandes."
    });
  }
}

export default function OrdersListPage() {
  const { orders, meta, error } = useLoaderData<LoaderData>();
  const [searchParams, setSearchParams] = useSearchParams();
  
  // États locaux
  const [searchTerm, setSearchTerm] = useState(searchParams.get("search") || "");
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  const [showFilters, setShowFilters] = useState(false);

  // Debounce pour la recherche
  useEffect(() => {
    const timer = setTimeout(() => {
      const params = new URLSearchParams(searchParams);
      if (searchTerm) {
        params.set("search", searchTerm);
      } else {
        params.delete("search");
      }
      params.set("page", "1");
      setSearchParams(params);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", newPage.toString());
    setSearchParams(params);
  };

  const handleSort = (field: string) => {
    const params = new URLSearchParams(searchParams);
    const currentSort = searchParams.get("sortBy");
    const currentOrder = searchParams.get("sortOrder") || "desc";
    
    if (currentSort === field) {
      params.set("sortOrder", currentOrder === "asc" ? "desc" : "asc");
    } else {
      params.set("sortBy", field);
      params.set("sortOrder", "desc");
    }
    params.set("page", "1");
    setSearchParams(params);
  };

  const getStatusConfig = (status: string) => {
    const configs = {
      pending: { 
        bg: "bg-yellow-50", 
        text: "text-yellow-700", 
        border: "border-yellow-200", 
        icon: Clock,
        label: "En attente"
      },
      confirmed: { 
        bg: "bg-blue-50", 
        text: "text-blue-700", 
        border: "border-blue-200", 
        icon: CheckCircle,
        label: "Confirmée"
      },
      shipped: { 
        bg: "bg-purple-50", 
        text: "text-purple-700", 
        border: "border-purple-200", 
        icon: Truck,
        label: "Expédiée"
      },
      delivered: { 
        bg: "bg-green-50", 
        text: "text-green-700", 
        border: "border-green-200", 
        icon: CheckCircle,
        label: "Livrée"
      },
      canceled: { 
        bg: "bg-red-50", 
        text: "text-red-700", 
        border: "border-red-200", 
        icon: XCircle,
        label: "Annulée"
      },
      returned: { 
        bg: "bg-pink-50", 
        text: "text-pink-700", 
        border: "border-pink-200", 
        icon: RotateCcw,
        label: "Retournée"
      },
    };
    return configs[status as keyof typeof configs] || {
      bg: "bg-gray-50", 
      text: "text-gray-700", 
      border: "border-gray-200", 
      icon: AlertCircle,
      label: status
    };
  };

  const getPaymentConfig = (status: string) => {
    const configs = {
      paid: { 
        bg: "bg-green-50", 
        text: "text-green-700", 
        border: "border-green-200", 
        icon: CheckCircle,
        label: "Payé"
      },
      pending: { 
        bg: "bg-yellow-50", 
        text: "text-yellow-700", 
        border: "border-yellow-200", 
        icon: Clock,
        label: "En attente"
      },
      failed: { 
        bg: "bg-red-50", 
        text: "text-red-700", 
        border: "border-red-200", 
        icon: XCircle,
        label: "Échoué"
      },
    };
    return configs[status as keyof typeof configs] || {
      bg: "bg-gray-50", 
      text: "text-gray-700", 
      border: "border-gray-200", 
      icon: CreditCard,
      label: status || "—"
    };
  };

  // Calcul des statistiques
  const stats = {
    total: meta.total,
    totalRevenue: orders.reduce((sum, order) => sum + Number(order.total || 0), 0),
    pending: orders.filter(order => order.status === "pending").length,
    confirmed: orders.filter(order => order.status === "confirmed").length,
    delivered: orders.filter(order => order.status === "delivered").length,
    avgOrderValue: orders.length > 0 ? orders.reduce((sum, order) => sum + Number(order.total || 0), 0) / orders.length : 0
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from--50 to-gray-100 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header amélioré */}
        <div className="bg-white rounded-3xl shadow-xl border border-gray-200 p-8">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
            <div className="flex items-center gap-6">
              <div className="relative">
                <div className="p-4 bg-gradient-to-br from-gray-600 via-gray-700 to-gray-900 rounded-2xl shadow-lg">
                  <ShoppingCart className="h-10 w-10 text-white" />
                </div>
            
              </div>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                  Gestion des Commandes
                </h1>
                <p className="text-gray-600 mt-2 text-lg">
                  Suivez et gérez toutes vos commandes
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <button className="group relative inline-flex items-center px-6 py-3 bg-gradient-to-r from-gray-700 via-gray-800 to-gray-900 text-white font-semibold rounded-2xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300">
                <Download className="h-5 w-5 mr-2" />
                Exporter
              </button>
            </div>
          </div>

          {/* Statistiques */}
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mt-8">
            <div className="bg-gradient-to-br from-gray-50 to-white p-6 rounded-xl border border-gray-200 hover:shadow-lg transition-all duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm font-medium">Commandes</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{stats.total}</p>
                </div>
                <ShoppingCart className="h-8 w-8 text-gray-600" />
              </div>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-white p-6 rounded-xl border border-green-200 hover:shadow-lg transition-all duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-600 text-sm font-medium">Chiffre d'affaires</p>
                  <p className="text-xl font-bold text-green-700 mt-1">{stats.totalRevenue.toFixed(0)}€</p>
                </div>
                <DollarSign className="h-8 w-8 text-green-600" />
              </div>
            </div>

            <div className="bg-gradient-to-br from-yellow-50 to-white p-6 rounded-xl border border-yellow-200 hover:shadow-lg transition-all duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-yellow-600 text-sm font-medium">En attente</p>
                  <p className="text-2xl font-bold text-yellow-700 mt-1">{stats.pending}</p>
                </div>
                <Clock className="h-8 w-8 text-yellow-600" />
              </div>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-white p-6 rounded-xl border border-blue-200 hover:shadow-lg transition-all duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-600 text-sm font-medium">Confirmées</p>
                  <p className="text-2xl font-bold text-blue-700 mt-1">{stats.confirmed}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-blue-600" />
              </div>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-white p-6 rounded-xl border border-purple-200 hover:shadow-lg transition-all duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-600 text-sm font-medium">Livrées</p>
                  <p className="text-2xl font-bold text-purple-700 mt-1">{stats.delivered}</p>
                </div>
                <Truck className="h-8 w-8 text-purple-600" />
              </div>
            </div>

            <div className="bg-gradient-to-br from-indigo-50 to-white p-6 rounded-xl border border-indigo-200 hover:shadow-lg transition-all duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-indigo-600 text-sm font-medium">Panier moyen</p>
                  <p className="text-xl font-bold text-indigo-700 mt-1">{stats.avgOrderValue.toFixed(0)}€</p>
                </div>
                <TrendingUp className="h-8 w-8 text-indigo-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Barre de recherche et filtres */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Rechercher des commandes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-all duration-300"
                />
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center px-4 py-3 rounded-xl border transition-all duration-300 ${
                  showFilters 
                    ? 'bg-gray-800 text-white border-gray-800' 
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                }`}
              >
                <Filter className="h-4 w-4 mr-2" />
                Filtres
              </button>

              <div className="flex border border-gray-300 rounded-xl overflow-hidden">
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-3 transition-all duration-300 ${
                    viewMode === "list" 
                      ? 'bg-gray-800 text-white' 
                      : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <ListIcon className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-3 transition-all duration-300 ${
                    viewMode === "grid" 
                      ? 'bg-gray-800 text-white' 
                      : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Grid className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Filtres avancés */}
          {showFilters && (
            <div className="mt-6 p-4 bg-gray-50 rounded-xl border border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Statut</label>
                  <select className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500">
                    <option value="">Tous les statuts</option>
                    <option value="pending">En attente</option>
                    <option value="confirmed">Confirmée</option>
                    <option value="shipped">Expédiée</option>
                    <option value="delivered">Livrée</option>
                    <option value="canceled">Annulée</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Paiement</label>
                  <select className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500">
                    <option value="">Tous</option>
                    <option value="paid">Payé</option>
                    <option value="pending">En attente</option>
                    <option value="failed">Échoué</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Période</label>
                  <select className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500">
                    <option value="">Toutes</option>
                    <option value="today">Aujourd'hui</option>
                    <option value="week">Cette semaine</option>
                    <option value="month">Ce mois</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Trier par</label>
                  <select 
                    onChange={(e) => handleSort(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500"
                  >
                    <option value="createdAt">Date</option>
                    <option value="total">Montant</option>
                    <option value="status">Statut</option>
                    <option value="display_id">Numéro</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-6 rounded-lg shadow-lg">
            <div className="flex items-center">
              <AlertCircle className="h-6 w-6 mr-3" />
              <div>
                <strong>Erreur:</strong> {error}
              </div>
            </div>
          </div>
        )}

        {/* Liste/Grille des commandes */}
        {orders.length > 0 ? (
          <>
            {viewMode === "list" ? (
              <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-200">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gradient-to-r from-gray-700 via-gray-800 to-gray-900 text-white">
                      <tr>
                        <th className="px-6 py-5 text-left text-sm font-semibold">
                          <button 
                            onClick={() => handleSort("display_id")}
                            className="flex items-center hover:text-gray-300 transition-colors"
                          >
                            Commande
                            {searchParams.get("sortBy") === "display_id" && (
                              searchParams.get("sortOrder") === "asc" ? <SortAsc className="h-4 w-4 ml-2" /> : <SortDesc className="h-4 w-4 ml-2" />
                            )}
                          </button>
                        </th>
                        <th className="px-6 py-5 text-left text-sm font-semibold">Client</th>
                        <th className="px-6 py-5 text-left text-sm font-semibold">Statut</th>
                        <th className="px-6 py-5 text-left text-sm font-semibold">Paiement</th>
                        <th className="px-6 py-5 text-left text-sm font-semibold">
                          <button 
                            onClick={() => handleSort("total")}
                            className="flex items-center hover:text-gray-300 transition-colors"
                          >
                            Total
                            {searchParams.get("sortBy") === "total" && (
                              searchParams.get("sortOrder") === "asc" ? <SortAsc className="h-4 w-4 ml-2" /> : <SortDesc className="h-4 w-4 ml-2" />
                            )}
                          </button>
                        </th>
                        <th className="px-6 py-5 text-left text-sm font-semibold">Produits</th>
                        <th className="px-6 py-5 text-center text-sm font-semibold">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {orders.map((order, index) => {
                        const statusConfig = getStatusConfig(order.status);
                        const paymentConfig = getPaymentConfig(order.payments?.[0]?.status ?? "");
                        const StatusIcon = statusConfig.icon;
                        const PaymentIcon = paymentConfig.icon;
                        
                        return (
                          <tr 
                            key={order._id} 
                            className="hover:bg-gray-50 transition-all duration-300 group"
                            style={{ 
                              animation: `fadeInUp 0.5s ease-out ${index * 0.1}s both` 
                            }}
                          >
                            <td className="px-6 py-5">
                              <div className="font-semibold text-gray-900 group-hover:text-gray-700 transition-colors">
                                #{order.display_id}
                              </div>
                            </td>
                            <td className="px-6 py-5">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center">
                                  <User className="h-5 w-5 text-gray-600" />
                                </div>
                                <div>
                                  <div className="font-medium text-gray-900">
                                    {order.customer?.name ?? "Client anonyme"}
                                  </div>
                                  <div className="text-sm text-gray-500">
                                    {order.customer?.phone ?? "—"}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-5">
                              <div className={`inline-flex items-center px-3 py-2 rounded-full text-sm font-medium border ${statusConfig.bg} ${statusConfig.text} ${statusConfig.border}`}>
                                <StatusIcon className="h-4 w-4 mr-2" />
                                {statusConfig.label}
                              </div>
                            </td>
                            <td className="px-6 py-5">
                              <div className={`inline-flex items-center px-3 py-2 rounded-full text-sm font-medium border ${paymentConfig.bg} ${paymentConfig.text} ${paymentConfig.border}`}>
                                <PaymentIcon className="h-4 w-4 mr-2" />
                                {paymentConfig.label}
                              </div>
                            </td>
                            <td className="px-6 py-5">
                              <div className="font-bold text-lg text-gray-900">
                                {Number(order.total ?? 0).toFixed(2)}€
                              </div>
                            </td>
                            <td className="px-6 py-5">
                              <div className="space-y-1 max-w-xs">
                                {order.items?.slice(0, 2).map((item, idx) => {
                                  const quantity = Number(item.quantity ?? 0);
                                  const productName = (item.item as any)?.title ?? "Produit inconnu";
                                  return (
                                    <div key={idx} className="text-sm text-gray-600 truncate">
                                      <span className="font-medium">{quantity}x</span> {productName}
                                    </div>
                                  );
                                })}
                                {(order.items?.length || 0) > 2 && (
                                  <div className="text-xs text-gray-500">
                                    +{(order.items?.length || 0) - 2} autres produits
                                  </div>
                                )}
                              </div>
                            </td>
                            <td className="px-6 py-5">
                              <div className="flex justify-center">
                                <Link
                                  to={`/dashboard/orders/${order._id}`}
                                  className="p-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-all duration-300 hover:scale-110 shadow-md"
                                  title="Voir la commande"
                                >
                                  <Eye className="w-4 h-4" />
                                </Link>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {orders.map((order, index) => {
                  const statusConfig = getStatusConfig(order.status);
                  const paymentConfig = getPaymentConfig(order.payments?.[0]?.status ?? "");
                  const StatusIcon = statusConfig.icon;
                  const PaymentIcon = paymentConfig.icon;
                  
                  return (
                    <div 
                      key={order._id}
                      className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-300 group hover:-translate-y-1"
                      style={{ 
                        animation: `fadeInUp 0.5s ease-out ${index * 0.1}s both` 
                      }}
                    >
                      <div className="p-6">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h3 className="font-bold text-lg text-gray-900 mb-1">
                              #{order.display_id}
                            </h3>
                            <p className="text-sm text-gray-600">
                              {order.customer?.name ?? "Client anonyme"}
                            </p>
                          </div>
                          <div className="text-right">
                            <div className="font-bold text-xl text-gray-900">
                              {Number(order.total ?? 0).toFixed(2)}€
                            </div>
                          </div>
                        </div>

                        <div className="space-y-3 mb-4">
                          <div className={`inline-flex items-center px-3 py-2 rounded-full text-sm font-medium border ${statusConfig.bg} ${statusConfig.text} ${statusConfig.border}`}>
                            <StatusIcon className="h-4 w-4 mr-2" />
                            {statusConfig.label}
                          </div>
                          
                          <div className={`inline-flex items-center px-3 py-2 rounded-full text-sm font-medium border ml-2 ${paymentConfig.bg} ${paymentConfig.text} ${paymentConfig.border}`}>
                            <PaymentIcon className="h-4 w-4 mr-2" />
                            {paymentConfig.label}
                          </div>
                        </div>

                        <div className="mb-4">
                          <h4 className="text-sm font-medium text-gray-700 mb-2">Produits:</h4>
                          <div className="space-y-1">
                            {order.items?.slice(0, 2).map((item, idx) => {
                              const quantity = Number(item.quantity ?? 0);
                              const productName = (item.item as any)?.title ?? "Produit inconnu";
                              return (
                                <div key={idx} className="text-sm text-gray-600 flex justify-between">
                                  <span className="truncate mr-2">{productName}</span>
                                  <span className="font-medium">{quantity}x</span>
                                </div>
                              );
                            })}
                            {(order.items?.length || 0) > 2 && (
                              <div className="text-xs text-gray-500">
                                +{(order.items?.length || 0) - 2} autres produits
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="pt-4 border-t border-gray-200">
                          <Link
                            to={`/dashboard/orders/${order._id}`}
                            className="w-full flex items-center justify-center px-4 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-all duration-300 font-medium"
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            Voir les détails
                          </Link>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Pagination améliorée */}
            {meta.totalPages > 1 && (
              <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
                <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                  <div className="text-sm text-gray-600">
                    Affichage de <span className="font-medium">{(meta.page - 1) * meta.pageSize + 1}</span> à{' '}
                    <span className="font-medium">{Math.min(meta.page * meta.pageSize, meta.total)}</span> sur{' '}
                    <span className="font-medium">{meta.total}</span> commandes
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <button
                      disabled={meta.page === 1}
                      onClick={() => handlePageChange(meta.page - 1)}
                      className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
                    >
                      <ChevronLeft className="h-4 w-4 mr-1" />
                      Précédent
                    </button>
                    
                    <div className="flex space-x-1">
                      {Array.from({ length: Math.min(5, meta.totalPages) }, (_, i) => {
                        let pageNum;
                        if (meta.totalPages <= 5) {
                          pageNum = i + 1;
                        } else if (meta.page <= 3) {
                          pageNum = i + 1;
                        } else if (meta.page >= meta.totalPages - 2) {
                          pageNum = meta.totalPages - 4 + i;
                        } else {
                          pageNum = meta.page - 2 + i;
                        }
                        
                        return (
                          <button
                            key={pageNum}
                            onClick={() => handlePageChange(pageNum)}
                            className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-300 ${
                              meta.page === pageNum
                                ? 'bg-gradient-to-r from-gray-700 to-gray-900 text-white shadow-lg'
                                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                            }`}
                          >
                            {pageNum}
                          </button>
                        );
                      })}
                    </div>
                    
                    <button
                      disabled={meta.page === meta.totalPages}
                      onClick={() => handlePageChange(meta.page + 1)}
                      className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
                    >
                      Suivant
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-12">
            <div className="text-center">
              <div className="relative inline-block">
                <div className="p-6 bg-gradient-to-br from-gray-100 to-gray-200 rounded-3xl mb-6">
                  <ShoppingCart className="h-20 w-20 text-gray-400 mx-auto" />
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                  <AlertCircle className="h-4 w-4 text-white" />
                </div>
              </div>
              
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Aucune commande trouvée</h3>
              <p className="text-gray-600 mb-8 max-w-md mx-auto">
                {searchTerm 
                  ? `Aucun résultat pour "${searchTerm}". Essayez avec d'autres critères.`
                  : "Aucune commande n'a encore été passée dans cette boutique."
                }
              </p>
              
              <div className="space-y-4">
                {searchTerm ? (
                  <button 
                    onClick={() => setSearchTerm("")}
                    className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-gray-700 via-gray-800 to-gray-900 text-white font-semibold rounded-2xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
                  >
                    <XCircle className="h-5 w-5 mr-3" />
                    Effacer la recherche
                  </button>
                ) : (
                  <div className="text-center">
                    <p className="text-gray-500 text-sm">
                      Les commandes apparaîtront ici une fois que les clients commenceront à acheter vos produits.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      <style>
{`
  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(30px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .line-clamp-2 {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
`}
</style>

    </div>
  );
}