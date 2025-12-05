// app/routes/stores/$storeId/customers.tsx
import { useLoaderData, Link, useSearchParams } from "@remix-run/react";
import type { LoaderFunctionArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { getSession } from "~/utils/session.server";
import { useState, useEffect } from "react";
import { 
  Users, 
  Eye, 
  Crown, 
  Star, 
  TrendingUp, 
  CheckCircle, 
  XCircle, 
  ChevronLeft, 
  ChevronRight, 
  List as ListIcon, 
  Grid, 
  Download 
} from "lucide-react";

// ---------------------------
// Typage TypeScript
// ---------------------------
interface CustomerSummary {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  createdAt: string;
  lastLoginAt?: string;
  totalOrders: number;
  totalSpent: number;
  lastOrderDate?: string;
  avgOrderValue: number;
}

interface LoaderData {
  customers: CustomerSummary[];
  meta: {
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  };
  error?: string;
}

// ---------------------------
// Loader
// ---------------------------
export async function loader({ request, params }: LoaderFunctionArgs) {
  const session = await getSession(request.headers.get("Cookie"));
  const token = session.get("token");
  const storeId = params.storeId;

  if (!token) return redirect("/login");
  if (!storeId) throw new Response("Boutique introuvable", { status: 404 });

  const url = new URL(request.url);
  const page = parseInt(url.searchParams.get("page") || "1", 10);
  const limit = parseInt(url.searchParams.get("limit") || "12", 10);
  const search = url.searchParams.get("search") || "";
  const type = url.searchParams.get("type") || "";

  try {
    const apiUrl = new URL(`${process.env.NEST_API_URL}/orders/store/${storeId}/customers`);
    apiUrl.searchParams.append("page", page.toString());
    apiUrl.searchParams.append("limit", limit.toString());
    if (search) apiUrl.searchParams.append("search", search);
    if (type) apiUrl.searchParams.append("type", type);

    const response = await fetch(apiUrl.toString(), {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) {
      const errorText = await response.text();
      return json({
        customers: [],
        meta: { total: 0, page, pageSize: limit, totalPages: 1 },
        error: errorText,
      });
    }

    const data = await response.json();

    return json(data);
  } catch (err) {
    return json({
      customers: [],
      meta: { total: 0, page, pageSize: limit, totalPages: 1 },
      error: "Erreur de connexion au serveur.",
    });
  }
}

// ---------------------------
// Utilitaires
// ---------------------------
const formatDate = (dateString?: string) => {
  if (!dateString) return "-";
  return new Date(dateString).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "XOF",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

const formatPhone = (phone: string) => {
  return phone.replace(/(\d{2})(?=\d)/g, "$1 ");
};

const getCustomerTypeConfig = (totalSpent: number) => {
  if (totalSpent >= 100000) return { label: "Premium", bg: "bg-yellow-50", text: "text-yellow-700", border: "border-yellow-200", icon: Crown };
  if (totalSpent >= 50000) return { label: "VIP", bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200", icon: Star };
  if (totalSpent >= 20000) return { label: "Fidèle", bg: "bg-purple-50", text: "text-purple-700", border: "border-purple-200", icon: TrendingUp };
  if (totalSpent >= 5000) return { label: "Régulier", bg: "bg-green-50", text: "text-green-700", border: "border-green-200", icon: CheckCircle };
  return { label: "Nouveau", bg: "bg-gray-50", text: "text-gray-700", border: "border-gray-200", icon: Users };
};

// ---------------------------
// Page principale
// ---------------------------
export default function CustomersPage() {
  const { customers, meta, error } = useLoaderData<LoaderData>();
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState(searchParams.get("search") || "");
  const [selectedType, setSelectedType] = useState(searchParams.get("type") || "");
  const [viewMode, setViewMode] = useState<"grid" | "list">("list");
  const [showFilters, setShowFilters] = useState(false);

  // Debounce recherche
  useEffect(() => {
    const timer = setTimeout(() => {
      const params = new URLSearchParams(searchParams);
      if (searchTerm) params.set("search", searchTerm);
      else params.delete("search");
      params.set("page", "1");
      setSearchParams(params);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Filtrage par type
  const filteredCustomers = customers.filter(c => {
    if (!selectedType) return true;
    const spent = c.totalSpent;
    switch (selectedType) {
      case "premium": return spent >= 100000;
      case "vip": return spent >= 50000 && spent < 100000;
      case "fidele": return spent >= 20000 && spent < 50000;
      case "regulier": return spent >= 5000 && spent < 20000;
      case "nouveau": return spent < 5000;
      default: return true;
    }
  });

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", newPage.toString());
    setSearchParams(params);
  };

  // Statistiques
  const stats = {
    total: customers.length,
    totalSpent: customers.reduce((sum, c) => sum + c.totalSpent, 0),
    avgOrderValue: customers.length ? customers.reduce((sum, c) => sum + c.avgOrderValue, 0) / customers.length : 0,
    premium: customers.filter(c => c.totalSpent >= 100000).length,
    vip: customers.filter(c => c.totalSpent >= 50000 && c.totalSpent < 100000).length,
    fidele: customers.filter(c => c.totalSpent >= 20000 && c.totalSpent < 50000).length,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from--50 to-gray-100 p-6">
      <div className="max-w-7xl mx-auto space-y-8">

        {/* Header stats */}
        <div className="bg-white rounded-3xl shadow-xl border border-gray-200 p-8">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
            <div className="flex items-center gap-6">
              <div className="relative">
                <div className="p-4 bg-gradient-to-br from-gray-600 via-gray-700 to-gray-900 rounded-2xl shadow-lg">
                  <Users className="h-10 w-10 text-white" />
                </div>
          
              </div>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                  Gestion des Clients
                </h1>
                <p className="text-gray-600 mt-2 text-lg">
                  Suivez et gérez tous vos clients
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

          <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mt-8">
            <div className="bg-gradient-to-br from-gray-50 to-white p-6 rounded-xl border border-gray-200 hover:shadow-lg transition-all duration-300">
              <p className="text-gray-500 text-sm font-medium">Total Clients</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stats.total}</p>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-white p-6 rounded-xl border border-green-200 hover:shadow-lg transition-all duration-300">
              <p className="text-green-600 text-sm font-medium">Total dépensé</p>
              <p className="text-xl font-bold text-green-700 mt-1">{formatCurrency(stats.totalSpent)}</p>
            </div>
            <div className="bg-gradient-to-br from-indigo-50 to-white p-6 rounded-xl border border-indigo-200 hover:shadow-lg transition-all duration-300">
              <p className="text-indigo-600 text-sm font-medium">Panier moyen</p>
              <p className="text-xl font-bold text-indigo-700 mt-1">{formatCurrency(stats.avgOrderValue)}</p>
            </div>
            <div className="bg-gradient-to-br from-yellow-50 to-white p-6 rounded-xl border border-yellow-200 hover:shadow-lg transition-all duration-300">
              <p className="text-yellow-600 text-sm font-medium">Premium</p>
              <p className="text-2xl font-bold text-yellow-700 mt-1">{stats.premium}</p>
            </div>
            <div className="bg-gradient-to-br from-blue-50 to-white p-6 rounded-xl border border-blue-200 hover:shadow-lg transition-all duration-300">
              <p className="text-blue-600 text-sm font-medium">VIP</p>
              <p className="text-2xl font-bold text-blue-700 mt-1">{stats.vip}</p>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-white p-6 rounded-xl border border-purple-200 hover:shadow-lg transition-all duration-300">
              <p className="text-purple-600 text-sm font-medium">Fidèle</p>
              <p className="text-2xl font-bold text-purple-700 mt-1">{stats.fidele}</p>
            </div>
          </div>
        </div>

        {/* Recherche et filtres */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex-1 max-w-md relative">
              <input
                type="text"
                placeholder="Rechercher un client..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-4 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-all duration-300"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center px-4 py-3 rounded-xl border transition-all duration-300 ${
                  showFilters ? 'bg-gray-800 text-white border-gray-800' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                }`}
              >
                Filtres
              </button>
              <div className="flex border border-gray-300 rounded-xl overflow-hidden">
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-3 transition-all duration-300 ${viewMode === "list" ? 'bg-gray-800 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
                >
                  <ListIcon className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-3 transition-all duration-300 ${viewMode === "grid" ? 'bg-gray-800 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
                >
                  <Grid className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          {showFilters && (
            <div className="mt-6 p-4 bg-gray-50 rounded-xl border border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Type de client</label>
                  <select
                    value={selectedType}
                    onChange={(e) => setSelectedType(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500"
                  >
                    <option value="">Tous</option>
                    <option value="premium">Premium</option>
                    <option value="vip">VIP</option>
                    <option value="fidele">Fidèle</option>
                    <option value="regulier">Régulier</option>
                    <option value="nouveau">Nouveau</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>
        {/* Liste/Grille des clients */}
        {filteredCustomers.length > 0 ? (
          <>
            {viewMode === "list" ? (
              <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-200">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gradient-to-r from-gray-700 via-gray-800 to-gray-900 text-white">
                      <tr>
                        <th className="px-6 py-5 text-left text-sm font-semibold">Client</th>
                        <th className="px-6 py-5 text-left text-sm font-semibold">Inscription</th>
                        <th className="px-6 py-5 text-left text-sm font-semibold">Dernière commande</th>
                        <th className="px-6 py-5 text-left text-sm font-semibold">Téléphone</th>
                        <th className="px-6 py-5 text-left text-sm font-semibold">Type</th>
                        <th className="px-6 py-5 text-left text-sm font-semibold">Total dépensé</th>
                        <th className="px-6 py-5 text-left text-sm font-semibold">Moyenne commande</th>
                        <th className="px-6 py-5 text-center text-sm font-semibold">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {filteredCustomers.map((customer, index) => {
                        const typeConfig = getCustomerTypeConfig(customer.totalSpent);
                        const TypeIcon = typeConfig.icon;

                        return (
                          <tr 
                            key={customer._id} 
                            className="hover:bg-gray-50 transition-all duration-300 group"
                            style={{ animation: `fadeInUp 0.5s ease-out ${index * 0.05}s both` }}
                          >
                            <td className="px-6 py-5">
                              <div className="font-semibold text-gray-900 group-hover:text-gray-700 transition-colors">{customer.name}</div>
                            </td>
                            <td className="px-6 py-5 text-gray-600">
                              {customer.createdAt ? new Date(customer.createdAt).toLocaleDateString() : "-"}
                            </td>
                            <td className="px-6 py-5 text-gray-600">
                              {customer.lastOrderDate ? new Date(customer.lastOrderDate).toLocaleDateString() : "-"}
                            </td>
                            <td className="px-6 py-5 text-gray-600">{customer.phone ? formatPhone(customer.phone) : "-"}</td>
                            <td className="px-6 py-5">
                              <div className={`inline-flex items-center px-3 py-2 rounded-full text-sm font-medium border ${typeConfig.bg} ${typeConfig.text} ${typeConfig.border}`}>
                                <TypeIcon className="h-4 w-4 mr-2" />
                                {typeConfig.label}
                              </div>
                            </td>
                            <td className="px-6 py-5 font-bold text-gray-900">{formatCurrency(customer.totalSpent)}</td>
                            <td className="px-6 py-5 font-medium text-gray-700">{formatCurrency(customer.avgOrderValue)}</td>
                            <td className="px-6 py-5">
                              <div className="flex justify-center">
                                <Link
                                  to={`/dashboard/customers/${customer._id}`}
                                  className="p-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-all duration-300 hover:scale-110 shadow-md"
                                  title="Voir le client"
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
                {filteredCustomers.map((customer, index) => {
                  const typeConfig = getCustomerTypeConfig(customer.totalSpent);
                  const TypeIcon = typeConfig.icon;

                  return (
                    <div 
                      key={customer._id}
                      className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-300 group hover:-translate-y-1"
                      style={{ animation: `fadeInUp 0.5s ease-out ${index * 0.05}s both` }}
                    >
                      <div className="p-6">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h3 className="font-bold text-lg text-gray-900 mb-1">{customer.name}</h3>
                            <p className="text-sm text-gray-600">{customer.email}</p>
                          </div>
                          <div className="text-right">
                            <div className="font-bold text-xl text-gray-900">{formatCurrency(customer.totalSpent)}</div>
                          </div>
                        </div>

                        <div className="space-y-3 mb-4">
                          <div className={`inline-flex items-center px-3 py-2 rounded-full text-sm font-medium border ${typeConfig.bg} ${typeConfig.text} ${typeConfig.border}`}>
                            <TypeIcon className="h-4 w-4 mr-2" />
                            {typeConfig.label}
                          </div>
                        </div>

                        <div className="mb-4">
                          <div className="text-sm text-gray-600">
                            Moyenne commande: <span className="font-medium">{formatCurrency(customer.avgOrderValue)}</span>
                          </div>
                        </div>

                        <div className="pt-4 border-t border-gray-200">
                          <Link
                            to={`/dashboard/customers/${customer._id}`}
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

            {/* Pagination */}
            {meta.totalPages > 1 && (
              <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
                <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                  <div className="text-sm text-gray-600">
                    Affichage de <span className="font-medium">{(meta.page - 1) * meta.pageSize + 1}</span> à{' '}
                    <span className="font-medium">{Math.min(meta.page * meta.pageSize, meta.total)}</span> sur{' '}
                    <span className="font-medium">{meta.total}</span> clients
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
                        if (meta.totalPages <= 5) pageNum = i + 1;
                        else if (meta.page <= 3) pageNum = i + 1;
                        else if (meta.page >= meta.totalPages - 2) pageNum = meta.totalPages - 4 + i;
                        else pageNum = meta.page - 2 + i;

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
                  <Users className="h-20 w-20 text-gray-400 mx-auto" />
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                  <XCircle className="h-4 w-4 text-white" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Aucun client trouvé</h3>
              <p className="text-gray-600 mb-8 max-w-md mx-auto">
                {searchTerm 
                  ? `Aucun résultat pour "${searchTerm}". Essayez avec d'autres critères.`
                  : "Aucun client n'a encore été enregistré pour cette boutique."
                }
              </p>
              {searchTerm && (
                <button 
                  onClick={() => setSearchTerm("")}
                  className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-gray-700 via-gray-800 to-gray-900 text-white font-semibold rounded-2xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
                >
                  <XCircle className="h-5 w-5 mr-3" />
                  Effacer la recherche
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      <style>{`
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
      `}</style>
    </div>
  );
}
