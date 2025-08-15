import { json, LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData, Link, useSearchParams } from "@remix-run/react";
import { productStatusColors } from "~/components/ui/productStatusColors";
import { Product } from "~/types/product";
import { ProductVariant } from "~/types/product-variant";
import { ChevronLeft, ChevronRight, Plus, Search, Filter, Package } from "lucide-react";
import { getSession } from "~/utils/session.server";

interface PaginatedProducts {
  products: Product[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const page = parseInt(url.searchParams.get("page") || "1", 10);
  const limit = parseInt(url.searchParams.get("limit") || "10", 10);
  const search = url.searchParams.get("search") || "";
  const status = url.searchParams.get("status") || "";
  const salesChannelId = url.searchParams.get("salesChannelId") || "";

  const session = await getSession(request.headers.get("Cookie"));
  const token = session.get("token");
  console.log(token,"token")

  const apiUrl = new URL(`${process.env.NEST_API_URL}/product/me`);
  apiUrl.searchParams.append("page", page.toString());
  apiUrl.searchParams.append("limit", limit.toString());
  if (search) apiUrl.searchParams.append("search", search);
  if (status) apiUrl.searchParams.append("status", status);
  if (salesChannelId) apiUrl.searchParams.append("salesChannelId", salesChannelId);

  try {
    const response = await fetch(apiUrl.toString(), {
      headers: {
        Authorization: token ? `Bearer ${token}` : "",
      },
    });

    if (!response.ok) {
      throw new Response("Failed to fetch products", { status: response.status });
    }

    const data = await response.json();

    return json({
      products: data.data || [],
      total: data.meta?.total || 0,
      page: data.meta?.page || 1,
      limit: data.meta?.pageSize || 10,
      totalPages: data.meta?.totalPages || 1,
    });
  } catch (error) {
    console.error("Error fetching products:", error);
    return json({
      products: [],
      total: 0,
      page: 1,
      limit: 10,
      totalPages: 1,
    });
  }
}



export default function ProductListPage() {
  const { products, total, page, totalPages } = useLoaderData<PaginatedProducts>();
  const [searchParams, setSearchParams] = useSearchParams();

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", newPage.toString());
    setSearchParams(params);
  };

  const handleSearch = (searchTerm: string) => {
    const params = new URLSearchParams(searchParams);
    params.set("search", searchTerm);
    params.set("page", "1");
    setSearchParams(params);
  };

  const handleFilterChange = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams);
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    params.set("page", "1");
    setSearchParams(params);
  };

  return (
    <div className="min-h-screen bg-white p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-[#fbb344] rounded-xl shadow-lg">
              <Package className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-amber-800 bg-clip-text text-transparent">
                Gestion des Produits
              </h1>
              <p className="text-gray-600 mt-1">
                {total} produit{total > 1 ? "s" : ""}
              </p>
            </div>
          </div>

          <Link
            to="/dashboard/poduits"
            className="group relative inline-flex items-center px-6 py-3 bg-[#fbb344] text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 overflow-hidden"
          >
            <div className="absolute inset-0 bg-amber-600 opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
            <Plus className="h-5 w-5 mr-2 relative z-10" />
            <span className="relative z-10">Créer un Produit</span>
          </Link>
        </div>

        {/* Barre de recherche et filtres */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 border border-amber-100">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="flex-1 relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Rechercher un produit..."
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-200"
                onChange={(e) => handleSearch(e.target.value)}
                defaultValue={searchParams.get("search") || ""}
              />
            </div>

            {/* Filtres supplémentaires */}
            <select
              className="w-full md:w-auto border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-700 focus:ring-2 focus:ring-amber-500"
              value={searchParams.get("status") || ""}
              onChange={(e) => handleFilterChange("status", e.target.value)}
            >
              <option value="">Tous les statuts</option>
              <option value="draft">Brouillon</option>
              <option value="published">Publié</option>
              <option value="archived">Archivé</option>
            </select>

            <select
              className="w-full md:w-auto border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-700 focus:ring-2 focus:ring-amber-500"
              value={searchParams.get("salesChannelId") || ""}
              onChange={(e) => handleFilterChange("salesChannelId", e.target.value)}
            >
              <option value="">Tous les canaux</option>
              <option value="1">Boutique Web</option>
              <option value="2">Marketplace</option>
            </select>
          </div>
        </div>

        {/* Tableau des produits */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-amber-100">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-amber-50 to-amber-100">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 border-b border-amber-200">Produit</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 border-b border-amber-200">Variantes</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 border-b border-amber-200">Statut</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 border-b border-amber-200">Canaux de Vente</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 border-b border-amber-200">Boutique</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-amber-100">
                {products.map((product) => (
                  <tr key={product.handle} className="hover:bg-gradient-to-r hover:from-amber-50 hover:to-amber-100 transition-all duration-200">
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-amber-100 to-amber-200 rounded-xl flex items-center justify-center">
                          <Package className="h-6 w-6 text-amber-600" />
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900">{product.title}</div>
                          <div className="text-sm text-gray-500">ID: {product.handle}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {product.variants?.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {product.variants.map((variant) => (
                            <span key={variant.id} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                              {variant.sku}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-gray-500 italic">Aucune variante</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium"
                        style={{
                          backgroundColor: `${productStatusColors[product.status as keyof typeof productStatusColors] || "#6B7280"}20`,
                          color: productStatusColors[product.status as keyof typeof productStatusColors] || "#6B7280",
                        }}
                      >
                        {product.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {product.sales_channels?.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {product.sales_channels.map((channel) => (
                            <span key={channel.id} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              {channel.name}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-gray-500 italic">Aucun canal</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination avec ellipses */}
          <div className="bg-amber-50 px-6 py-4 border-t border-amber-200">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Affichage de {(page - 1) * 10 + 1} à {Math.min(page * 10, total)} sur {total} produits
              </div>

              <div className="flex items-center space-x-2">
                <button
                  disabled={page === 1}
                  onClick={() => handlePageChange(page - 1)}
                  className={`inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    page === 1 ? "bg-gray-100 text-gray-400 cursor-not-allowed" : "bg-white text-gray-700 border border-gray-300 hover:bg-amber-50 hover:shadow-md"
                  }`}
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Précédent
                </button>

                {(() => {
                  const pages: (number | "...")[] = [];
                  const start = Math.max(2, page - 1);
                  const end = Math.min(totalPages - 1, page + 1);

                  pages.push(1);
                  if (start > 2) pages.push("...");
                  for (let i = start; i <= end; i++) pages.push(i);
                  if (end < totalPages - 1) pages.push("...");
                  if (totalPages > 1) pages.push(totalPages);

                  return pages.map((p, idx) =>
                    typeof p === "number" ? (
                      <button
                        key={p}
                        onClick={() => handlePageChange(p)}
                        className={`w-10 h-10 rounded-lg text-sm font-medium transition-all duration-200 ${
                          page === p ? "bg-[#fbb344] text-white shadow-lg" : "bg-white text-gray-700 border border-gray-300 hover:bg-amber-50"
                        }`}
                      >
                        {p}
                      </button>
                    ) : (
                      <span key={`ellipsis-${idx}`} className="px-2 text-gray-500">
                        ...
                      </span>
                    )
                  );
                })()}

                <button
                  disabled={page === totalPages}
                  onClick={() => handlePageChange(page + 1)}
                  className={`inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    page === totalPages ? "bg-gray-100 text-gray-400 cursor-not-allowed" : "bg-white text-gray-700 border border-gray-300 hover:bg-amber-50 hover:shadow-md"
                  }`}
                >
                  Suivant
                  <ChevronRight className="h-4 w-4 ml-1" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Aucun produit trouvé */}
        {products.length === 0 && (
          <div className="text-center py-12">
            <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Aucun produit trouvé</h3>
            <p className="text-gray-600 mb-6">Commencez par créer votre premier produit.</p>
            <Link
              to="/dashboard/poduits"
              className="inline-flex items-center px-6 py-3 bg-[#fbb344] text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
            >
              <Plus className="h-5 w-5 mr-2" />
              Créer un Produit
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
