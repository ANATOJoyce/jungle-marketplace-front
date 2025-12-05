import { json, redirect } from "@remix-run/node";
import { useLoaderData, Link, useSearchParams, Form } from "@remix-run/react";
import type { ActionFunction, LoaderFunction } from "@remix-run/node";
import { getSession } from "~/utils/session.server";
import { LogIn } from "lucide-react";

export type Store = {
  _id: string;
  name: string;
  owner?: {
    first_name?: string;
    last_name?: string;
    email?: string;
  };
  country?: {
    name?: string;
    currency_code?: string;
  };
  supported_currencies?: string;
  status?: "active" | "inactive";
};

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  const storeId = formData.get("storeId");

  if (!storeId || typeof storeId !== "string") {
    return json({ error: "ID de boutique manquant" }, { status: 400 });
  }

  try {
    const res = await fetch(`${process.env.NEST_API_URL}/store/${storeId}/activate`, {
      method: "PATCH", // corrige ici
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer`, // si route protégée
      },
    });

    const data = await res.json();
    if (!res.ok) {
      return json({ error: data.message || "Erreur lors de l’activation" }, { status: res.status });
    }

    return json({ success: true });
  } catch (err) {
    console.error("Erreur activation:", err);
    return json({ error: "Erreur serveur" }, { status: 500 });
  }
};


export const loader: LoaderFunction = async ({ request }) => {
  const session = await getSession(request.headers.get("Cookie"));
  const token = session.get("token");

  if (!token) return redirect("/login");

  const url = new URL(request.url);
  const page = parseInt(url.searchParams.get("page") || "1");
  const perPage = parseInt(url.searchParams.get("perPage") || "10");
  const search = url.searchParams.get("search") || "";

  try {
    const res = await fetch(
      `${process.env.PUBLIC_NEST_API_URL}/store/my-stores?page=${page}&limit=${perPage}&q=${search}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    if (!res.ok) throw new Error(`Erreur ${res.status}: ${await res.text()}`);

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
        error: error instanceof Error ? error.message : "Erreur serveur inconnue",
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

  // Calcul des statistiques
  const totalStores = count;
  const activeStores = stores.filter(s => s.status === 'active').length;
  const inactiveStores = stores.filter(s => s.status === 'inactive').length;
  const uniqueCountries = new Set(stores.map(s => s.country?.name).filter(Boolean)).size;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="container mx-auto px-4 py-8">
        {/* En-tête */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Gestion des Boutiques</h1>
          <p className="text-gray-600">Gérez et surveillez toutes vos boutiques en ligne</p>
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Boutiques */}
          <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl shadow-lg p-6 text-white transform hover:scale-105 transition-transform duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100 text-sm font-medium uppercase tracking-wide">Total Boutiques</p>
                <p className="text-4xl font-bold mt-2">{totalStores}</p>
                <p className="text-orange-200 text-2xs mt-2">Toutes les boutiques</p>
              </div>
              <div className="bg-white bg-opacity-20 rounded-full p-4">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
            </div>
          </div>

          {/* Boutiques Actives */}
          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg p-6 text-white transform hover:scale-105 transition-transform duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm font-medium uppercase tracking-wide">Boutiques Actives</p>
                <p className="text-4xl font-bold mt-2">{activeStores}</p>
                <p className="text-green-200 text-2xs mt-2">En fonctionnement</p>
              </div>
              <div className="bg-white bg-opacity-20 rounded-full p-4">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Boutiques Inactives */}
          <div className="bg-gradient-to-br from-gray-500 to-gray-600 rounded-xl shadow-lg p-6 text-white transform hover:scale-105 transition-transform duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-200 text-sm font-medium uppercase tracking-wide">Boutiques Inactives</p>
                <p className="text-4xl font-bold mt-2">{inactiveStores}</p>
                <p className="text-gray-300 text-2xs mt-2">À activer</p>
              </div>
              <div className="bg-white bg-opacity-20 rounded-full p-4">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Pays */}
          <div className="bg-gradient-to-br from-slate-700 to-slate-800 rounded-xl shadow-lg p-6 text-white transform hover:scale-105 transition-transform duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-300 text-sm font-medium uppercase tracking-wide">Pays Couverts</p>
                <p className="text-4xl font-bold mt-2">{uniqueCountries}</p>
                <p className="text-slate-400 text-2xs mt-2">Présence internationale</p>
              </div>
              <div className="bg-white bg-opacity-20 rounded-full p-4">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Recherche */}
        <div className="bg-white p-6 rounded-xl shadow-md mb-6 border border-gray-200">
          <form method="get" className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-3">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  name="search"
                  defaultValue={searchParams.get("search") || ""}
                  placeholder="Rechercher par nom, ville, pays..."
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
                />
              </div>
            </div>
            <button
              type="submit"
              className="bg-gradient-to-r from-orange-600 to-orange-700 text-white px-6 py-3 rounded-lg hover:from-orange-700 hover:to-orange-800 transition-all duration-200 font-medium shadow-md hover:shadow-lg flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              Filtrer
            </button>
          </form>
        </div>

        {/* Erreur */}
        {error && (
          <div className="bg-orange-50 border-l-4 border-orange-500 p-5 mb-6 rounded-lg shadow-sm">
            <div className="flex items-center">
              <svg className="w-6 h-6 text-orange-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-orange-700 font-medium">{error}</p>
            </div>
          </div>
        )}

        {/* Tableau */}
        <div className="bg-white shadow-lg rounded-xl overflow-hidden border border-gray-200">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Nom</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Propriétaire</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Pays</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Devise du pays</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Devise(s) boutique</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Statut</th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {stores.length > 0 ? (
                  stores.map((store, index) => {
                    const isInactive = store.status !== "active";

                    return (
                      <tr
                        key={store._id}
                        className={`hover:bg-orange-50 transition-colors ${
                          index % 2 === 0 ? "bg-white" : "bg-gray-50"
                        }`}
                      >
                        {/* Nom de la boutique */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10 bg-orange-100 rounded-lg flex items-center justify-center">
                              <svg
                                className="w-6 h-6 text-orange-600"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                                />
                              </svg>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{store.name}</div>
                            </div>
                          </div>
                        </td>

                        {/* Propriétaire */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {store.owner?.first_name || "—"} {store.owner?.last_name || ""}
                          </div>
                          {store.owner?.email && (
                            <div className="text-xs text-gray-500">{store.owner.email}</div>
                          )}
                        </td>

                        {/* Pays */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center text-sm text-gray-900">
                            {store.country?.name ?? "—"}
                          </div>
                        </td>

                        {/* Devise du pays */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-slate-100 text-slate-800">
                            {store.country?.currency_code ?? "—"}
                          </span>
                        </td>

                        {/* Devises supportées */}
                        {/* Devises supportées */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-wrap gap-1">
                          {store.supported_currencies ? (
                            <span className="px-2 py-1 text-xs font-medium rounded-full bg-orange-100 text-orange-800">
                              {store.supported_currencies}
                            </span>
                          ) : (
                            <span className="text-gray-400">—</span>
                          )}
                        </div>
                      </td>


                        {/* Statut */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          {store.status === "active" ? (
                            <span className="px-4 py-1 inline-flex items-center gap-1.5 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                              <span className="w-2 h-2 bg-green-800 rounded-full"></span>
                              Actif
                            </span>
                          ) : (
                            <span className="px-4 py-1 inline-flex items-center gap-1.5 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
                              <span className="w-2 h-2 bg-gray-500 rounded-full"></span>
                              Inactif
                            </span>
                          )}
                        </td>

                        {/* Bouton Activer */}
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                        <Form method="post" action={`/admin/dashboard/stores/${store._id}/activer`} className="inline">
                          <button
                            type="submit"
                            disabled={store.status === "active"}
                            className={`inline-flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                              store.status === "active"
                                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                                : "bg-green-500 text-white hover:bg-green-600"
                            }`}
                            title={store.status === "active" ? "Boutique déjà active" : "Activer la boutique"}
                          >
                            Activer
                          </button>
                        </Form>


                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center justify-center">
                        <p className="text-gray-500 text-lg font-medium">
                          {error ? "Erreur de chargement" : "Aucune boutique disponible"}
                        </p>
                        <p className="text-gray-400 text-sm mt-1">
                          {error ? "Veuillez réessayer plus tard" : "Commencez par créer votre première boutique"}
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>

            </table>
          </div>
        </div>

        {/* Pagination */}
        {count > 0 && (
          <div className="mt-8 bg-white p-6 rounded-xl shadow-md border border-gray-200">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
              <div className="text-sm text-gray-600 font-medium">
                Affichage de <span className="text-orange-600 font-bold">{(currentPage - 1) * perPage + 1}</span> à{" "}
                <span className="text-orange-600 font-bold">{Math.min(currentPage * perPage, count)}</span> sur{" "}
                <span className="text-orange-600 font-bold">{count}</span> boutiques
              </div>
              <div className="flex items-center gap-3">
                <Link
                  to={`?page=${Math.max(1, currentPage - 1)}&perPage=${perPage}&search=${searchParams.get("search") || ""}`}
                  className={`px-4 py-2 border rounded-lg font-medium transition-all ${
                    currentPage <= 1
                      ? 'text-gray-400 bg-gray-50 cursor-not-allowed border-gray-200'
                      : 'text-gray-700 hover:bg-orange-50 hover:border-orange-300 border-gray-300'
                  }`}
                  aria-disabled={currentPage <= 1}
                >
                  ← Précédent
                </Link>
                <span className="px-4 py-2 text-sm font-semibold text-gray-700 bg-orange-50 border border-orange-200 rounded-lg">
                  Page {currentPage} / {Math.ceil(count / perPage)}
                </span>
                <Link
                  to={`?page=${currentPage + 1}&perPage=${perPage}&search=${searchParams.get("search") || ""}`}
                  className={`px-4 py-2 border rounded-lg font-medium transition-all ${
                    currentPage >= Math.ceil(count / perPage)
                      ? 'text-gray-400 bg-gray-50 cursor-not-allowed border-gray-200'
                      : 'text-gray-700 hover:bg-orange-50 hover:border-orange-300 border-gray-300'
                  }`}
                  aria-disabled={currentPage >= Math.ceil(count / perPage)}
                >
                  Suivant →
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}