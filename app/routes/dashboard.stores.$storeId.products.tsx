import { json, LoaderFunctionArgs, redirect } from "@remix-run/node";
import { useLoaderData, Link, useSearchParams, Form, useSubmit, useFetcher } from "@remix-run/react";
import { Product } from "~/types/product";
import { 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Package, 
  Edit, 
  Trash2, 
  Eye, 
  Search,
  Filter,
  SortAsc,
  SortDesc,
  Grid,
  List,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  X,
  Palette,
  Ruler,
  DollarSign,
  Hash,
  Upload,
  Image as ImageIcon,
  Minus
} from "lucide-react";
import { getSession } from "~/utils/session.server";
import { useState, useEffect } from "react";
import UploadWidget from "~/components/uploadWidget";

interface PaginatedProducts {
  products: Product[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  error?: string;
}
interface FetcherData {
  success?: boolean;
  error?: string;
  // Ajoutez d'autres propriétés si nécessaire
}


export async function loader({ request, params }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const page = parseInt(url.searchParams.get("page") || "1", 10);
  const limit = parseInt(url.searchParams.get("limit") || "10", 10);
  const search = url.searchParams.get("search") || "";
  const sortBy = url.searchParams.get("sortBy") || "title";
  const sortOrder = url.searchParams.get("sortOrder") || "asc";

  const session = await getSession(request.headers.get("Cookie"));
  const token = session.get("token");
  const storeId = params.storeId;

  if (!token) return redirect("/login");

  if (!storeId) {
    return json({
      products: [],
      total: 0,
      page: 1,
      limit: 10,
      totalPages: 1,
      error: "ID de boutique manquant.",
    });
  }

  try {
    const apiUrl = new URL(`${process.env.NEST_API_URL}/product/store/${storeId}`);
    apiUrl.searchParams.append("page", page.toString());
    apiUrl.searchParams.append("limit", limit.toString());
    apiUrl.searchParams.append("sortBy", sortBy);
    apiUrl.searchParams.append("sortOrder", sortOrder);
    if (search) apiUrl.searchParams.append("search", search);

    const response = await fetch(apiUrl.toString(), {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) {
      const text = await response.text();
      console.error("Erreur API backend:", text);
      throw new Error("Impossible de récupérer les produits");
    }

    const data = await response.json();
console.log(data)
    const productsWithTotalStock = data.data.map((product: any) => ({
      ...product,
      totalStock: product.totalStock
    }));

    return json({
      products: productsWithTotalStock,
      total: data.meta?.totalStock || 0,
      page: data.meta?.page || 1,
      limit: data.meta?.pageSize || 10,
      totalPages: data.meta?.totalPages || 1,
    });
  } catch (error) {
    console.error("Erreur lors de la récupération des produits:", error);
    return json({
      products: [],
      total: 0,
      page: 1,
      limit: 10,
      totalPages: 1,
      error: "Une erreur est survenue lors de la récupération des produits.",
    });
  }
}

// Modal de création de produit


export default function ProductListPage() {
  const { products, total, page, totalPages, error } = useLoaderData<PaginatedProducts>();
  const [searchParams, setSearchParams] = useSearchParams();
  
  // États locaux
  const [searchTerm, setSearchTerm] = useState(searchParams.get("search") || "");
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  const [showFilters, setShowFilters] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);

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
    const currentOrder = searchParams.get("sortOrder") || "asc";
    
    if (currentSort === field) {
      params.set("sortOrder", currentOrder === "asc" ? "desc" : "asc");
    } else {
      params.set("sortBy", field);
      params.set("sortOrder", "asc");
    }
    params.set("page", "1");
    setSearchParams(params);
  };

  const getStockStatus = (stock: number) => {
    if (stock === 0) return { status: "out", color: "text-red-600", bg: "bg-red-50", icon: AlertTriangle };
    if (stock < 10) return { status: "low", color: "text-yellow-600", bg: "bg-yellow-50", icon: AlertTriangle };
    return { status: "good", color: "text-green-600", bg: "bg-green-50", icon: CheckCircle };
  };

  // Calcul des statistiques
// On suppose que chaque produit a un tableau `variants` peuplé avec les documents Variant
const stats = {
  totalProducts: products.length,
  totalVariants: products.reduce(
    (acc, p) => acc + (p.variants?.length || 0),
    0
  ),
  totalStock: products.reduce((acc, p) => {
    const variantsStock = p.variants?.reduce(
      (sum, v) => sum + (v.stock || 0),
      0
    ) ?? 0;
    return acc + (p.totalStock || 0) + variantsStock;
  }, 0),
  outOfStock: products.filter(p => {
    const variantsStock = p.variants?.reduce((sum, v) => sum + (v.stock || 0), 0) ?? 0;
    return ((p.totalStock || 0) + variantsStock) === 0;
  }).length,
  lowStock: products.filter(p => {
    const variantsStock = p.variants?.reduce((sum, v) => sum + (v.stock || 0), 0) ?? 0;
    const total = (p.totalStock || 0) + variantsStock;
    return total > 0 && total < 10;
  }).length,
};


  // Récupérer storeId depuis les params
  const storeId = searchParams.get("storeId") || "";

  return (
    <div className="min-h-screen bg-gradient-to-br from--50 to-gray-100 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header amélioré */}
        <div className="bg-white rounded-3xl shadow-xl border border-gray-200 p-8">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
            <div className="flex items-center gap-6">
              <div className="relative">
                <div className="p-4 bg-gradient-to-br from-gray-600 via-gray-700 to-gray-900 rounded-2xl shadow-lg">
                  <Package className="h-10 w-10 text-white" />
                </div>
          
              </div>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                  Gestion des Produits
                </h1>
                <p className="text-gray-600 mt-2 text-lg">
                  Gérez votre inventaire et vos produits
                </p>
              </div>
            </div>

          <div className="flex gap-3">
            <Link
              to={`/dashboard/produits`}
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-gray-700 to-gray-900 text-white font-semibold rounded-xl hover:shadow-lg transition-all"
            >
            <Plus className="mr-2" size={16} />
              Ajouter un produit
            </Link>
          </div>
          </div>

          {/* Statistiques */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-8">
            <div className="bg-gradient-to-br from-gray-50 to-white p-6 rounded-xl border border-gray-200 hover:shadow-lg transition-all duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm font-medium">Produits</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{stats.totalProducts}</p>
                </div>
                <Package className="h-8 w-8 text-gray-600" />
              </div>
            </div>

            <div className="bg-gradient-to-br from-gray-50 to-white p-6 rounded-xl border border-gray-200 hover:shadow-lg transition-all duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm font-medium">Variantes</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{stats.totalVariants}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-gray-600" />
              </div>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-white p-6 rounded-xl border border-green-200 hover:shadow-lg transition-all duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-600 text-sm font-medium">Stock Total</p>
                  <p className="text-2xl font-bold text-green-700 mt-1">{stats.totalStock}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </div>

            <div className="bg-gradient-to-br from-yellow-50 to-white p-6 rounded-xl border border-yellow-200 hover:shadow-lg transition-all duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-yellow-600 text-sm font-medium">Stock Faible</p>
                  <p className="text-2xl font-bold text-yellow-700 mt-1">{stats.lowStock}</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-yellow-600" />
              </div>
            </div>

            <div className="bg-gradient-to-br from-red-50 to-white p-6 rounded-xl border border-red-200 hover:shadow-lg transition-all duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-red-600 text-sm font-medium">Rupture</p>
                  <p className="text-2xl font-bold text-red-700 mt-1">{stats.outOfStock}</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-red-600" />
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
                  placeholder="Rechercher des produits..."
                                    value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-gray-500 focus:ring-4 focus:ring-gray-100 transition-all duration-200 placeholder-gray-400"
                />
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Bouton filtre */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl transition-colors"
              >
                <Filter className="h-5 w-5" />
                <span>Filtres</span>
              </button>

              {/* Toggle vue */}
              <div className="flex bg-gray-100 rounded-xl p-1">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-2 rounded-lg transition-colors ${
                    viewMode === "grid" ? "bg-white shadow-sm" : "hover:bg-gray-200"
                  }`}
                >
                  <Grid className="h-5 w-5" />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-2 rounded-lg transition-colors ${
                    viewMode === "list" ? "bg-white shadow-sm" : "hover:bg-gray-200"
                  }`}
                >
                  <List className="h-5 w-5" />
                </button>
              </div>

              {/* Tri */}
              <div className="relative">
                <select
                  value={`${searchParams.get("sortBy") || "title"}-${searchParams.get("sortOrder") || "asc"}`}
                  onChange={(e) => {
                    const [sortBy, sortOrder] = e.target.value.split("-");
                    const params = new URLSearchParams(searchParams);
                    params.set("sortBy", sortBy);
                    params.set("sortOrder", sortOrder);
                    setSearchParams(params);
                  }}
                  className="pl-10 pr-8 py-2 border-2 border-gray-200 rounded-xl focus:border-gray-500 focus:ring-4 focus:ring-gray-100 appearance-none bg-white"
                >
                  <option value="title-asc">Nom (A-Z)</option>
                  <option value="title-desc">Nom (Z-A)</option>
                  <option value="price-asc">Prix (Croissant)</option>
                  <option value="price-desc">Prix (Décroissant)</option>
                  <option value="createdAt-desc">Plus récent</option>
                  <option value="createdAt-asc">Plus ancien</option>
                </select>
                <SortAsc className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              </div>
            </div>
          </div>

          {/* Filtres avancés */}
          {showFilters && (
            <div className="mt-6 p-4 bg-gray-50 rounded-xl border border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Statut de stock</label>
                  <select className="w-full border-2 border-gray-200 rounded-lg px-3 py-2 focus:border-gray-500 focus:ring-4 focus:ring-gray-100">
                    <option value="">Tous</option>
                    <option value="in-stock">En stock</option>
                    <option value="low-stock">Stock faible</option>
                    <option value="out-of-stock">Rupture</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Prix min</label>
                  <input
                    type="number"
                    placeholder="0"
                    className="w-full border-2 border-gray-200 rounded-lg px-3 py-2 focus:border-gray-500 focus:ring-4 focus:ring-gray-100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Prix max</label>
                  <input
                    type="number"
                    placeholder="100000"
                    className="w-full border-2 border-gray-200 rounded-lg px-3 py-2 focus:border-gray-500 focus:ring-4 focus:ring-gray-100"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Liste des produits */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
          {error ? (
            <div className="p-8 text-center">
              <div className="bg-red-50 border border-red-200 rounded-xl p-6 inline-flex flex-col items-center">
                <AlertTriangle className="h-12 w-12 text-red-500 mb-4" />
                <h3 className="text-lg font-semibold text-red-800 mb-2">Erreur</h3>
                <p className="text-red-600">{error}</p>
              </div>
            </div>
          ) : products.length === 0 ? (
            <div className="p-12 text-center">
              <div className="bg-gray-50 rounded-2xl p-8 inline-flex flex-col items-center">
                <Package className="h-16 w-16 text-gray-400 mb-4" />
                <h3 className="text-xl font-semibold text-gray-700 mb-2">Aucun produit trouvé</h3>
                <p className="text-gray-500 mb-6">
                  {searchTerm ? "Aucun résultat pour votre recherche." : "Commencez par ajouter votre premier produit."}
                </p>
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-gray-700 to-gray-900 text-white font-semibold rounded-xl hover:shadow-lg transition-all"
                >
                  <Plus className="mr-2" size={16} />
                  Ajouter un produit
                </button>
              </div>
            </div>
          ) : viewMode === "grid" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
              {products.map((product) => {
                const stockStatus = getStockStatus(product.totalStock || 0);
                const StatusIcon = stockStatus.icon;
                
                return (
                  <div key={product._id} className="bg-gradient-to-br from-gray-50 to-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-300 group">
                    <div className="relative">
                      {product.imageUrl ? (
                        <img
                          src={product.imageUrl}
                          alt={product.title}
                          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
                          <ImageIcon className="h-12 w-12 text-gray-400" />
                        </div>
                      )}
                      <div className="absolute top-3 right-3">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold `}>
                          {product.status}
                        </span>
                      </div>
                    </div>

                    <div className="p-6">
                      <h3 className="font-semibold text-lg text-gray-900 mb-2 line-clamp-2 group-hover:text-gray-700 transition-colors">
                        {product.title}
                      </h3>
                      <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                        {product.description}
                      </p>

                      <div className="flex items-center justify-between mb-4">
                        <span className="text-2xl font-bold text-gray-900">
                          {product.variants?.toLocaleString()} CFA
                        </span>
                        <span className={`text-sm font-medium ${stockStatus.color}`}>
                          Stock: {product.totalStock}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <Link
                          to={`/dashboard/products/${product._id}/edit`}
                          className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
                        >
                          <Edit className="h-4 w-4" />
                          Modifier
                        </Link>
                        <Link
                          to={`/dashboard/product/${product._id}`}
                          className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm font-medium"
                        >
                          <Eye className="h-4 w-4" />
                          Voir
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Produit
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Prix
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Stock
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Statut
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Variantes
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {products.map((product) => {
                    const stockStatus = getStockStatus(product.totalStock || 0);
                    const StatusIcon = stockStatus.icon;
                    
                    return (
                      <tr key={product._id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-4">
                            {product.imageUrl ? (
                              <img
                                src={product.imageUrl}
                                alt={product.title}
                                className="w-12 h-12 rounded-lg object-cover"
                              />
                            ) : (
                              <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                                <ImageIcon className="h-6 w-6 text-gray-400" />
                              </div>
                            )}
                            <div>
                              <div className="font-medium text-gray-900">{product.title}</div>
                              <div className="text-sm text-gray-500 line-clamp-1">
                                {product.description}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-lg font-semibold text-gray-900">
                            {product.price?.toLocaleString()} CFA
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 font-medium">
                            {product.totalStock}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold `}>
                            {product.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">
                            {product.variants?.length || 0} variante(s)
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <Link
                              to={`/dashboard/product/${product._id}`}
                              className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                              title="Voir détails"
                            >
                              <Eye className="h-4 w-4" />
                            </Link>
                            <Link
                              to={`/dashboard/products/${product._id}/edit`}
                              className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                              title="Modifier"
                            >
                              <Edit className="h-4 w-4" />
                            </Link>
                            <Link
                              to={`/dashboard/products/${product._id}/remove`}
                              className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                              title="Supprimer"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Link>

                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  Affichage de <span className="font-medium">{(page - 1) * 10 + 1}</span> à{" "}
                  <span className="font-medium">{Math.min(page * 10, total)}</span> sur{" "}
                  <span className="font-medium">{total}</span> produits
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handlePageChange(page - 1)}
                    disabled={page === 1}
                    className="p-2 rounded-lg border border-gray-300 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                    <button
                      key={pageNum}
                      onClick={() => handlePageChange(pageNum)}
                      className={`w-10 h-10 rounded-lg border transition-colors ${
                        page === pageNum
                          ? "bg-gray-900 text-white border-gray-900"
                          : "border-gray-300 hover:bg-gray-100"
                      }`}
                    >
                      {pageNum}
                    </button>
                  ))}
                  
                  <button
                    onClick={() => handlePageChange(page + 1)}
                    disabled={page === totalPages}
                    className="p-2 rounded-lg border border-gray-300 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

    </div>
  );
}