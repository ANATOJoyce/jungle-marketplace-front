import { useLoaderData, Link, Form } from "@remix-run/react";
import type { LoaderFunction } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { getSession } from "~/utils/session.server";
import { Plus, Store, Edit, Trash2, LogIn, Calendar, MapPin, Users, Activity } from "lucide-react";
import { useState } from "react";

type Country = {
  _id: string;
  name: string;
  iso2: string;
};

type Store = {
  _id: string;
  name: string;
  status: string;
  country: Country; // <-- ici on met l'objet complet
  createdAt: string;
  updatedAt: string;
};

type LoaderData = {
  stores: Store[];
};
export const loader: LoaderFunction = async ({ request }) => {
  const session = await getSession(request.headers.get("Cookie"));
  const token = session.get("token");
  if (!token) return redirect("/login");

  // On suppose que ton endpoint NestJS supporte la population de country
  const res = await fetch(`${process.env.NEST_API_URL}/store/my?populate=country`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    throw new Response("Erreur lors de la récupération des boutiques", { status: res.status });
  }

  const data = await res.json();

  const stores = Array.isArray(data)
    ? data.map((store: any) => ({
        _id: store._id || store.id,
        name: store.name,
        status: store.status,
        country: store.country // ici country est déjà peuplé
          ? { _id: store.country._id, name: store.country.name, iso2: store.country.iso2 }
          : null,
        createdAt: store.createdAt,
        updatedAt: store.updatedAt,
      }))
    : [];

  return json({ stores });
};

export default function StoresList() {
  const { stores } = useLoaderData<LoaderData>();
  const [loadingStoreId, setLoadingStoreId] = useState<string | null>(null);

  if (!Array.isArray(stores)) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-yellow-50 to-amber-50 flex items-center justify-center">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 flex items-center space-x-3">
          <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
            <span className="text-white text-sm font-bold">!</span>
          </div>
          <div>
            <h3 className="text-red-800 font-semibold">Erreur de données</h3>
            <p className="text-red-700">Les boutiques reçues ne sont pas valides.</p>
          </div>
        </div>
      </div>
    );
  }

  const formatDate = (isoDate: string) =>
    new Date(isoDate).toLocaleDateString("fr-FR", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  const handleConnect = (storeId: string) => {
    setLoadingStoreId(storeId);
  };

  const activeStores = stores.filter(store => store.status === "active");
  const inactiveStores = stores.filter(store => store.status === "inactive");

  
  // Affichage si aucune boutique
  if (stores.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-orange-50 via-yellow-50 to-amber-50 p-6">
        <div className="w-28 h-28 bg-orange-100 rounded-full flex items-center justify-center mb-6">
          <Store className="text-orange-500" size={48} />
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-3">Vous n'avez pas encore de boutique</h2>
        <p className="text-gray-600 text-center mb-6 max-w-md">
          Pour commencer à vendre vos produits et gérer vos ventes, créez votre première boutique. Cela vous permettra de bénéficier du tableau de bord complet et de suivre vos performances.
        </p>
        <Link
          to="/register-shop"
          className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-orange-500 to-yellow-500 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
        >
          <Plus className="h-5 w-5 mr-2" />
          Créer ma première boutique
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white to-amber-50">
     
      <div className="max-w-7xl mx-auto px-4 py-8">
        
        {/* En-tête */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2 flex items-center gap-3">
                <Store className="text-orange-500" size={36} />
                Mes Boutiques
              </h1>
              <p className="text-gray-600">Gérez vos boutiques et accédez à leur tableau de bord</p>
            </div>

            <Link
              to="/register-shop"
              className="group relative inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-orange-500 to-yellow-500 text-white font-semibold rounded-2xl shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-orange-600 to-yellow-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <Plus className="h-6 w-6 mr-3 relative z-10" />
              <span className="relative z-10 text-lg">Créer une boutique</span>
            </Link>
          </div>

          {/* Statistiques */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Total des boutiques</p>
                  <p className="text-3xl font-bold text-gray-900">{stores.length}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <Store className="text-blue-600" size={24} />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Boutiques actives</p>
                  <p className="text-3xl font-bold text-green-600">{activeStores.length}</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                  <Activity className="text-green-600" size={24} />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Boutiques inactives</p>
                  <p className="text-3xl font-bold text-red-500">{inactiveStores.length}</p>
                </div>
                <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                  <Activity className="text-red-500" size={24} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Contenu principal */}
        {stores.length === 0 ? (
          <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-12 text-center">
            <div className="w-24 h-24 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Store className="text-orange-500" size={48} />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Aucune boutique trouvée</h3>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              Vous n'avez pas encore de boutique. Créez votre première boutique pour commencer à vendre vos produits.
            </p>
            <Link
              to="/register-shop"
              className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-orange-500 to-yellow-500 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
            >
              <Plus className="h-5 w-5 mr-2" />
              Créer ma première boutique
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Vue en cartes pour mobile/tablet */}
            <div className="block lg:hidden space-y-4">
              {stores.map((store) => {
                const isInactive = store.status === "inactive";
                const isLoading = loadingStoreId === store._id;

                return (
                  <div key={store._id} className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                        <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden mb-8">
                  </div>
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h3 className="text-xl font-bold text-gray-900 mb-2">{store.name}</h3>
                          <div className="flex items-center space-x-2 mb-3">
                            <span
                              className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                                isInactive
                                  ? "bg-red-100 text-red-800"
                                  : "bg-green-100 text-green-800"
                              }`}
                            >
                              <div className={`w-2 h-2 rounded-full mr-2 ${
                                isInactive ? "bg-red-500" : "bg-green-500"
                              }`}></div>
                              {isInactive ? "Inactive" : "Active"}
                            </span>
                          </div>
                        </div>
                      </div>

               <div className="space-y-3 text-sm text-gray-600 mb-6">
         <div className="space-y-3 text-sm text-gray-600 mb-6">
                    
                        <div className="flex items-center">
                          <MapPin className="w-4 h-4 mr-2" />
                          <span>Région: {store.country.name}</span>
                        </div>
                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 mr-2" />
                          <span>Créée le {formatDate(store.createdAt)}</span>
                        </div>
                      </div>


              <div className="flex items-center">
                <Calendar className="w-4 h-4 mr-2" />
                <span>Créée le {formatDate(store.createdAt)}</span>
              </div>
            </div>


                      <div className="flex flex-wrap gap-2">
                        <Link
                          to={`/dashboard/stores/${store._id}/edit`}
                          className="inline-flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm font-medium"
                        >
                          <Edit className="w-4 h-4 mr-2" />
                          Modifier
                        </Link>
                        
                        <Link
                          to={`/dashboard/stores/${store._id}/remove`}
                          className="inline-flex items-center px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm font-medium"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Supprimer
                        </Link>

                        <Form method="post" action={`/dashboard/stores/${store._id}/connect`}>
                          <button
                            type="submit"
                            disabled={isInactive || isLoading}
                            onClick={() => handleConnect(store._id)}
                            className={`inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                              isInactive
                                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                                : isLoading
                                ? "bg-green-400 text-white cursor-wait"
                                : "bg-green-500 text-white hover:bg-green-600"
                            }`}
                          >
                            {isLoading ? (
                              <>
                                <div className="animate-spin w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full"></div>
                                Connexion...
                              </>
                            ) : (
                              <>
                                <LogIn className="w-4 h-4 mr-2" />
                                Se connecter
                              </>
                            )}
                          </button>
                        </Form>
                      </div>

                      {isInactive && (
                        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                          <p className="text-yellow-800 text-sm font-medium">
                             Seules les boutiques actives peuvent être sélectionnées
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Vue tableau pour desktop */}
            <div className="hidden lg:block bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
              <div className="bg-[#fab143] px-8 py-6">
                <h2 className="text-xl font-semibold text-white">Liste de vos boutiques</h2>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="text-left px-6 py-4 font-semibold text-gray-900">Boutique</th>
                      <th className="text-left px-6 py-4 font-semibold text-gray-900">Statut</th>
                      <th className="text-left px-6 py-4 font-semibold text-gray-900">Région</th>
                      <th className="text-left px-6 py-4 font-semibold text-gray-900">Créée le</th>
                      <th className="text-left px-6 py-4 font-semibold text-gray-900">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {stores.map((store) => {
                      const isInactive = store.status === "inactive";
                      const isLoading = loadingStoreId === store._id;

                      return (
                        <tr key={store._id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center space-x-3">
                              <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-yellow-400 rounded-xl flex items-center justify-center">
                                <Store className="text-white" size={20} />
                              </div>
                              <div>
                                <div className="font-semibold text-gray-900">{store.name}</div>
                              </div>
                            </div>
                          </td>

                          <td className="px-6 py-4">
                            <span
                              className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                                isInactive
                                  ? "bg-red-100 text-red-800"
                                  : "bg-green-100 text-green-800"
                              }`}
                            >
                              <div className={`w-2 h-2 rounded-full mr-2 ${
                                isInactive ? "bg-red-500" : "bg-green-500"
                              }`}></div>
                              {isInactive ? "Inactive" : "Active"}
                            </span>
                          </td>

                            <td className="px-6 py-4 text-gray-700">
                              <div className="flex items-center gap-2">
                                {store.country ? (
                                  <>
                                    <img
                                      src={`https://flagcdn.com/16x12/${store.country.iso2.toLowerCase()}.png`}
                                      alt={store.country.name}
                                      className="w-4 h-3 rounded-sm"
                                    />
                                    <span>{store.country.name}</span>
                                  </>
                                ) : (
                                  <span>Pays non défini</span>
                                )}
                              </div>
                            </td>
                    
                          <td className="px-6 py-4 text-gray-700">{formatDate(store.createdAt)}</td>

                          <td className="px-6 py-4">
                            <div className="flex items-center space-x-2">
                              <Link
                                to={`/dashboard/stores/${store._id}/edit`}
                                className="inline-flex items-center px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm font-medium"
                                title="Modifier la boutique"
                              >
                                <Edit className="w-4 h-4" />
                              </Link>
                              
                              <Link
                                to={`/dashboard/stores/${store._id}/remove`}
                                className="inline-flex items-center px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm font-medium"
                                title="Supprimer la boutique"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Link>

                            <Form method="post" action={`/dashboard/stores/${store._id}/connect`} className="inline">
                              <button
                                type="submit"
                                disabled={isInactive}
                                className={`inline-flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                                  isInactive
                                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                                    : "bg-green-500 text-white hover:bg-green-600"
                                }`}
                                title={isInactive ? "Boutique inactive" : "Se connecter à la boutique"}
                              >
                                <LogIn className="w-4 h-4" />
                              </button>
                            </Form>

                            </div>

                            {isInactive && (
                              <p className="mt-2 text-xs text-red-600">
                                Boutique inactive
                              </p>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
      
          </div>
        )}
      </div>
    </div>
  );
}