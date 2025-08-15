import { json } from "@remix-run/node";
import { useLoaderData, Link, useSearchParams } from "@remix-run/react";
import type { LoaderFunction } from "@remix-run/node";

// Type Store avec `status`
export type Store = {
  id: string;
  name: string;
  default_sales_channel_id?: string;
  default_region_id?: string;
  default_location_id?: string;
  metadata?: Record<string, unknown>;
  supported_currencies?: string[];
  owner?: {
    email?: string;
    first_name?: string;
    last_name?: string;
  };
  status?: "active" | "inactive"; // 
};

export const loader: LoaderFunction = async ({ request }) => {
  const url = new URL(request.url);
  const page = parseInt(url.searchParams.get("page") || "1");
  const perPage = parseInt(url.searchParams.get("perPage") || "10");
  const search = url.searchParams.get("search") || "";

  try {
    const res = await fetch(
      `${process.env.PUBLIC_NEST_API_URL}/store?page=${page}&limit=${perPage}&q=${search}`
    );

    if (!res.ok) {
      throw new Error(`Erreur ${res.status}: ${await res.text()}`);
    }

    const data = await res.json();

    return json({
      stores: Array.isArray(data.stores) ? data.stores : Array.isArray(data) ? data : [],
      count: data.count || (Array.isArray(data) ? data.length : 0),
    });

  } catch (error) {
    return json(
      {
        stores: [],
        count: 0,
        error: error instanceof Error ? error.message : "Erreur serveur inconnue"
      },
      { status: 500 }
    );
  }
};

export default function StoresList() {
  const data = useLoaderData<{
    stores?: Store[];
    count?: number;
    error?: string;
  }>();

  const stores = data?.stores ?? [];
  const count = data?.count ?? 0;
  const error = data?.error;

  const [searchParams] = useSearchParams();
  const currentPage = parseInt(searchParams.get("page") || "1");
  const perPage = parseInt(searchParams.get("perPage") || "10");

  return (
    <div className="container mx-auto px-4 py-8">
      {/* En-tête */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Gestion des Boutiques</h1>
        <div className="flex gap-3 w-full md:w-auto">
          <Link
            to="/stores/new"
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-center w-full md:w-auto"
          >
            Activer une boutique
          </Link>
        </div>
      </div>

      {/* Recherche */}
      <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
        <form method="get" className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-3">
            <input
              type="text"
              name="search"
              defaultValue={searchParams.get("search") || ""}
              placeholder="Rechercher par nom, ville..."
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            Filtrer
          </button>
        </form>
      </div>

      {/* Erreur */}
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded-md">
          <div className="flex items-center">
            <svg className="h-5 w-5 text-red-500 mr-3" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <p className="text-red-700">{error}</p>
          </div>
        </div>
      )}

      {/* Tableau */}
      <div className="bg-white shadow-sm rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nom</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Propriétaire</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Devises</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th> {/*  */}
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {stores.length > 0 ? (
                stores.map((store) => (
                  <tr key={store.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{store.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                      {store.owner?.first_name} {store.owner?.last_name} ({store.owner?.email})                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-wrap gap-1">
                        {store.supported_currencies?.map(currency => (
                          <span key={currency} className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
                            {currency}
                          </span>
                        )) || 'Aucune'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap"> {/*  Colonne statut */}
                      {store.status === "active" ? (
                        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                          Actif
                        </span>
                      ) : (
                        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
                          Inactif
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{store.id}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <Link
                          to={`/admin/dashboard/stores/${store.id}`}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          Voir
                        </Link>
                        <Link
                          to={`/stores/${store.id}/edit`}
                          className="text-green-600 hover:text-green-900"
                        >
                          Éditer
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500">
                    {error ? "Erreur de chargement" : "Aucune boutique disponible"}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {count > 0 && (
        <div className="mt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="text-sm text-gray-500">
            Affichage de {(currentPage - 1) * perPage + 1} à {Math.min(currentPage * perPage, count)} sur {count} boutiques
          </div>
          <div className="flex items-center gap-2">
            <Link
              to={`?page=${Math.max(1, currentPage - 1)}&perPage=${perPage}&search=${searchParams.get("search") || ""}`}
              className={`px-3 py-1 border rounded-md ${currentPage <= 1 ? 'text-gray-400 bg-gray-50 cursor-not-allowed' : 'text-gray-700 hover:bg-gray-50'}`}
              aria-disabled={currentPage <= 1}
            >
              Précédent
            </Link>
            <span className="px-3 py-1 text-sm text-gray-700">
              Page {currentPage} sur {Math.ceil(count / perPage)}
            </span>
            <Link
              to={`?page=${currentPage + 1}&perPage=${perPage}&search=${searchParams.get("search") || ""}`}
              className={`px-3 py-1 border rounded-md ${currentPage >= Math.ceil(count / perPage) ? 'text-gray-400 bg-gray-50 cursor-not-allowed' : 'text-gray-700 hover:bg-gray-50'}`}
              aria-disabled={currentPage >= Math.ceil(count / perPage)}
            >
              Suivant
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
