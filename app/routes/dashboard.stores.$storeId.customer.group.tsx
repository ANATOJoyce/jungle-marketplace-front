// app/routes/stores/$storeId/customers.tsx
import { useLoaderData, Link, useSearchParams, useNavigation } from "@remix-run/react";
import type { LoaderFunctionArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { getSession } from "~/utils/session.server";
import { useState, useEffect, useMemo } from "react";
import { Users, Search, Filter, Crown, Star, TrendingUp, CheckCircle, XCircle, ChevronLeft, ChevronRight, RefreshCw, Grid, List as ListIcon, Download, Eye } from "lucide-react";

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
  if (totalSpent >= 100000) return { label: "Premium", icon: Crown };
  if (totalSpent >= 50000) return { label: "VIP", icon: Star };
  if (totalSpent >= 20000) return { label: "Fidèle", icon: TrendingUp };
  if (totalSpent >= 5000) return { label: "Régulier", icon: CheckCircle };
  return { label: "Nouveau", icon: Users };
};

// ---------------------------
// Composant Card Client
// ---------------------------
function CustomerCard({ customer, index }: { customer: CustomerSummary; index: number }) {
  const typeConfig = getCustomerTypeConfig(customer.totalSpent);
  const TypeIcon = typeConfig.icon;

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-all duration-300">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center">
          <Users className="h-6 w-6 text-blue-600" />
        </div>
        <div>
          <h3 className="font-semibold text-lg">{customer.name}</h3>
          <div className="flex items-center gap-1 text-xs text-gray-500">
            <TypeIcon className="h-3 w-3" />
            <span>{typeConfig.label}</span>
          </div>
        </div>
      </div>

      <div className="space-y-1 text-sm text-gray-600 mb-4">
        <div>{customer.email}</div>
        {customer.phone && <div>{formatPhone(customer.phone)}</div>}
      </div>

      <div className="grid grid-cols-2 gap-2 text-xs text-gray-500 mb-4">
        <div>Inscription: <strong>{formatDate(customer.createdAt)}</strong></div>
        <div>Dernière connexion: <strong>{formatDate(customer.lastLoginAt)}</strong></div>
        <div>Commandes: <strong>{customer.totalOrders}</strong></div>
        <div>Total dépensé: <strong>{formatCurrency(customer.totalSpent)}</strong></div>
        <div>Panier moyen: <strong>{formatCurrency(customer.avgOrderValue)}</strong></div>
        <div>Dernière commande: <strong>{formatDate(customer.lastOrderDate)}</strong></div>
      </div>

      <Link
        to={`/dashboard/customers/${customer._id}/orders`}
        className="flex items-center gap-2 text-sm text-gray-700 hover:text-gray-900 font-medium"
      >
        <Eye className="h-4 w-4" /> Voir commandes
      </Link>
    </div>
  );
}

// ---------------------------
// Page principale
// ---------------------------
export default function CustomersPage() {
  const { customers, meta, error } = useLoaderData<LoaderData>();
  const navigation = useNavigation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState(searchParams.get("search") || "");
  const [selectedType, setSelectedType] = useState(searchParams.get("type") || "");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const isLoading = navigation.state === "loading";

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
  const filteredCustomers = useMemo(() => {
    if (!selectedType) return customers;
    return customers.filter(c => {
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
  }, [customers, selectedType]);

  if (isLoading) return <div className="p-20 text-center">Chargement...</div>;

  if (error) return <div className="text-red-600 p-4">{error}</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
      <div className="flex gap-2 mb-4">
        <input
          type="text"
          placeholder="Rechercher..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="flex-1 p-2 border rounded-lg"
        />
        <select
          value={selectedType}
          onChange={e => setSelectedType(e.target.value)}
          className="p-2 border rounded-lg"
        >
          <option value="">Tous</option>
          <option value="premium">Premium</option>
          <option value="vip">VIP</option>
          <option value="fidele">Fidèle</option>
          <option value="regulier">Régulier</option>
          <option value="nouveau">Nouveau</option>
        </select>
        <button onClick={() => setViewMode(viewMode === "grid" ? "list" : "grid")} className="p-2 border rounded-lg">
          {viewMode === "grid" ? <ListIcon className="h-4 w-4" /> : <Grid className="h-4 w-4" />}
        </button>
      </div>

      {filteredCustomers.length > 0 ? (
        <div className={viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" : ""}>
          {filteredCustomers.map((c, i) => (
            <CustomerCard key={c._id} customer={c} index={i} />
          ))}
        </div>
      ) : (
        <div className="p-6 bg-white rounded-lg shadow text-center text-gray-500">Aucun client trouvé</div>
      )}

      {/* Pagination simple */}
      {meta.totalPages > 1 && (
        <div className="flex gap-2 justify-center mt-6">
          <button
            disabled={meta.page <= 1}
            onClick={() => searchParams.set("page", (meta.page - 1).toString())}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className="px-3 py-1 border rounded">{meta.page} / {meta.totalPages}</span>
          <button
            disabled={meta.page >= meta.totalPages}
            onClick={() => searchParams.set("page", (meta.page + 1).toString())}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
}
