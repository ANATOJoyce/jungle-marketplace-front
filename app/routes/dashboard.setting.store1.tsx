// app/routes/stores.tsx
import { useLoaderData, Link, Form } from "@remix-run/react";
import type { LoaderFunction } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { getSession } from "~/utils/session.server";
import { Plus, Store, Edit, Trash2, LogIn, Calendar, MapPin, Users, Activity } from "lucide-react";
import { useState } from "react";

type StoreType = {
  _id: string;
  name: string;
  status: string;
  default_sales_channel_id: string;
  default_region_id: string;
  default_location_id: string | null;
  createdAt: string;
  updatedAt: string;
};

type LoaderData = {
  stores: StoreType[];
};

export const loader: LoaderFunction = async ({ request }) => {
  const session = await getSession(request.headers.get("Cookie"));
  const token = session.get("token");

  if (!token) return redirect("/login");

  const res = await fetch(`${process.env.NEST_API_URL}/store/my`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (res.status === 404) return json<LoaderData>({ stores: [] });
  if (!res.ok) throw new Response("Erreur lors de la récupération des boutiques", { status: res.status });

  const data = await res.json();
  let stores: StoreType[] = [];

  if (Array.isArray(data)) {
    stores = data.map(store => ({
      _id: store.id ?? store._id,
      name: store.name,
      status: store.status,
      default_sales_channel_id: store.default_sales_channel_id,
      default_region_id: store.default_region_id,
      default_location_id: store.default_location_id ?? null,
      createdAt: store.createdAt,
      updatedAt: store.updatedAt,
    }));
  } else if (Array.isArray(data?.stores)) {
    stores = data.stores.map((store: any) => ({
      _id: store.id ?? store._id,
      name: store.name,
      status: store.status,
      default_sales_channel_id: store.default_sales_channel_id,
      default_region_id: store.default_region_id,
      default_location_id: store.default_location_id ?? null,
      createdAt: store.createdAt,
      updatedAt: store.updatedAt,
    }));
  } else if (data?.id && data?.name) {
    stores = [{
      _id: data.id,
      name: data.name,
      status: data.status,
      default_sales_channel_id: data.default_sales_channel_id,
      default_region_id: data.default_region_id,
      default_location_id: data.default_location_id ?? null,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    }];
  }

  return json<LoaderData>({ stores });
};

export default function StoresList() {
  const { stores } = useLoaderData<LoaderData>();
  const [loadingStoreId, setLoadingStoreId] = useState<string | null>(null);

  const formatDate = (isoDate: string) =>
    new Date(isoDate).toLocaleDateString("fr-FR", { year: "numeric", month: "short", day: "numeric" });

  const handleConnect = (storeId: string) => setLoadingStoreId(storeId);

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
    <div className="min-h-screen bg-white p-6">
      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 flex justify-between items-center">
          <div>
            <p className="text-gray-600 text-sm font-medium">Total des boutiques</p>
            <p className="text-3xl font-bold text-gray-900">{stores.length}</p>
          </div>
          <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
            <Store className="text-blue-600" size={24} />
          </div>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 flex justify-between items-center">
          <div>
            <p className="text-gray-600 text-sm font-medium">Boutiques actives</p>
            <p className="text-3xl font-bold text-green-600">{activeStores.length}</p>
          </div>
          <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
            <Activity className="text-green-600" size={24} />
          </div>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 flex justify-between items-center">
          <div>
            <p className="text-gray-600 text-sm font-medium">Boutiques inactives</p>
            <p className="text-3xl font-bold text-red-500">{inactiveStores.length}</p>
          </div>
          <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
            <Activity className="text-red-500" size={24} />
          </div>
        </div>
      </div>

      {/* Vue mobile */}
      <div className="block lg:hidden space-y-4">
        {stores.map(store => {
          const isInactive = store.status === "inactive";
          const isLoading = loadingStoreId === store._id;
          return (
            <div key={store._id} className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-gray-900">{store.name}</h3>
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                    isInactive ? "bg-red-100 text-red-800" : "bg-green-100 text-green-800"
                  }`}>
                    <div className={`w-2 h-2 rounded-full mr-2 ${isInactive ? "bg-red-500" : "bg-green-500"}`}></div>
                    {isInactive ? "Inactive" : "Active"}
                  </span>
                </div>

                <div className="space-y-2 text-sm text-gray-600 mb-4">
                  <div className="flex items-center"><Users className="w-4 h-4 mr-2" /> Canal: {store.default_sales_channel_id}</div>
                  <div className="flex items-center"><MapPin className="w-4 h-4 mr-2" /> Région: {store.default_region_id}</div>
                  <div className="flex items-center"><Calendar className="w-4 h-4 mr-2" /> Créée le {formatDate(store.createdAt)}</div>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Link to={`/dashboard/stores/${store._id}/edit`} className="inline-flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 text-sm font-medium">
                    <Edit className="w-4 h-4 mr-2" /> Modifier
                  </Link>
                  <Link to={`/dashboard/stores/${store._id}/remove`} className="inline-flex items-center px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 text-sm font-medium">
                    <Trash2 className="w-4 h-4 mr-2" /> Supprimer
                  </Link>
                  <Form method="post" action={`/dashboard/stores/${store._id}/connect`}>
                    <button
                      type="submit"
                      disabled={isInactive || isLoading}
                      onClick={() => handleConnect(store._id)}
                      className={`inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                        isInactive ? "bg-gray-300 text-gray-500 cursor-not-allowed" :
                        isLoading ? "bg-green-400 text-white cursor-wait" :
                        "bg-green-500 text-white hover:bg-green-600"
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

      {/* Vue desktop */}
      <div className="hidden lg:block bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden mt-6">
        <div className="bg-[#fab143] px-8 py-6">
          <h2 className="text-xl font-semibold text-white">Liste de vos boutiques</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-6 py-4 font-semibold text-gray-900">Boutique</th>
                <th className="text-left px-6 py-4 font-semibold text-gray-900">Statut</th>
                <th className="text-left px-6 py-4 font-semibold text-gray-900">Canal de vente</th>
                <th className="text-left px-6 py-4 font-semibold text-gray-900">Région</th>
                <th className="text-left px-6 py-4 font-semibold text-gray-900">Localisation</th>
                <th className="text-left px-6 py-4 font-semibold text-gray-900">Créée le</th>
                <th className="text-left px-6 py-4 font-semibold text-gray-900">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {stores.map(store => {
                const isInactive = store.status === "inactive";
                const isLoading = loadingStoreId === store._id;

                return (
                  <tr key={store._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-yellow-400 rounded-xl flex items-center justify-center">
                        <Store className="text-white" size={20} />
                      </div>
                      <span className="font-semibold text-gray-900">{store.name}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                        isInactive ? "bg-red-100 text-red-800" : "bg-green-100 text-green-800"
                      }`}>
                        <div className={`w-2 h-2 rounded-full mr-2 ${isInactive ? "bg-red-500" : "bg-green-500"}`}></div>
                        {isInactive ? "Inactive" : "Active"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-700">{store.default_sales_channel_id}</td>
                    <td className="px-6 py-4 text-gray-700">{store.default_region_id}</td>
                    <td className="px-6 py-4 text-gray-700">{store.default_location_id || <span className="text-gray-400 italic">Non définie</span>}</td>
                    <td className="px-6 py-4 text-gray-700">{formatDate(store.createdAt)}</td>
                    <td className="px-6 py-4 flex items-center gap-2">
                      <Link to={`/dashboard/stores/${store._id}/edit`} className="px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 text-sm font-medium" title="Modifier">
                        <Edit className="w-4 h-4" />
                      </Link>
                      <Link to={`/dashboard/stores/${store._id}/remove`} className="px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 text-sm font-medium" title="Supprimer">
                        <Trash2 className="w-4 h-4" />
                      </Link>
                      <Form method="post" action={`/dashboard/stores/${store._id}/connect`}>
                        <button
                          type="submit"
                          disabled={isInactive || isLoading}
                          onClick={() => handleConnect(store._id)}
                          className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                            isInactive ? "bg-gray-300 text-gray-500 cursor-not-allowed" :
                            isLoading ? "bg-green-400 text-white cursor-wait" :
                            "bg-green-500 text-white hover:bg-green-600"
                          }`}
                          title={isInactive ? "Boutique inactive" : "Se connecter"}
                        >
                          <LogIn className="w-4 h-4" />
                        </button>
                      </Form>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
