import { useLoaderData, Link } from "@remix-run/react";
import type { LoaderFunction } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { getSession } from "~/utils/session.server";

type Store = {
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
  stores: Store[];
};

export const loader: LoaderFunction = async ({ request }) => {
  const session = await getSession(request.headers.get("Cookie"));
  const token = session.get("token");

  if (!token) return redirect("/login");

  const res = await fetch(`${process.env.NEST_API_URL}/store/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });

 // APRÈS
  if (res.status === 404) {
    return json<LoaderData>({ stores: [] }); // aucun magasin trouvé
  }

  if (!res.ok) {
    throw new Response("Erreur lors de la récupération des boutiques", {
      status: res.status,
    });
  }
  const data = await res.json();
  console.log("Données reçues de l’API :", data);

  let stores: Store[] = [];

if (Array.isArray(data)) {
  // Cas 1 : data est un tableau de boutiques
  stores = data.map((store) => ({
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
  // Cas 2 : data.stores est un tableau
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
  // Cas 3 : data est une boutique unique
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
} else {
  // Cas invalide
  console.error("Format inattendu reçu de l’API :", data);
  throw new Response("Format de données invalide", { status: 500 });
}

return json<LoaderData>({ stores });

};
export default function StoresList() {
  const { stores } = useLoaderData<LoaderData>();

  if (!Array.isArray(stores)) {
    return (
      <div className="text-red-500 font-semibold">
        Erreur : les boutiques reçues ne sont pas valides.
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

return (
    <div className="max-w-6xl mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold text-orange-600 mb-6">Mes Boutiques</h1>

      {stores.length === 0 ? (
        <p>Vous n’avez pas encore de boutique. Deconnectez  Allez a l'accueil pour créer votre boutique</p>
        
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full border border-gray-200 rounded-lg">
            <thead className="bg-orange-100">
              <tr>
                <th className="text-left px-4 py-2">Nom</th>
                <th className="text-left px-4 py-2">Statut</th>
                <th className="text-left px-4 py-2">Canal de vente</th>
                <th className="text-left px-4 py-2">Région</th>
                <th className="text-left px-4 py-2">Localisation</th>
                <th className="text-left px-4 py-2">Créé le</th>
                <th className="text-left px-4 py-2">Mis à jour le</th>
                <th className="text-left px-4 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {stores.map((store) => {
                const isInactive = store.status === "inactive";
                const statusColor = isInactive
                  ? "text-red-600 bg-red-100"
                  : "text-orange-600 bg-orange-100";

                return (
                  <tr key={store._id} className="border-t border-gray-200">
                    <td className="px-4 py-3">{store.name}</td>

                    <td className="px-4 py-3">
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${statusColor}`}
                      >
                        {isInactive ? "Inactif" : "Actif"}
                      </span>
                    </td>

                    <td className="px-4 py-3">{store.default_sales_channel_id}</td>
                    <td className="px-4 py-3">{store.default_region_id}</td>
                    <td className="px-4 py-3">
                      {store.default_location_id ?? "—"}
                    </td>
                    <td className="px-4 py-3">{formatDate(store.createdAt)}</td>
                    <td className="px-4 py-3">{formatDate(store.updatedAt)}</td>

                    <td className="px-4 py-3">
                      <Link
                        to={`/dashboard/stores/${store._id}/edit`}
                        className="inline-block px-3 py-1 bg-orange-500 text-white rounded hover:bg-orange-600 text-sm"
                      >
                        Modifier
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}