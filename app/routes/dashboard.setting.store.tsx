import { Link } from "@remix-run/react";
import { Plus } from "lucide-react";
import { useStores } from "~/hooks/useStore";

export default function MesBoutiques() {
  const { stores, loading } = useStores();

  if (loading) return <p>Chargement...</p>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-orange-600">Mes Boutiques</h2>
        <Link
          to="/dashboard/settings/store"
          className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600"
        >
          <Plus size={18} />
          Nouvelle boutique
        </Link>
      </div>

      {stores.length === 0 ? (
        <p>Vous n’avez pas encore de boutique. Créez-en une !</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {stores.map((store) => (
            <div key={store._id} className="border rounded-lg p-4 shadow-sm bg-white">
              <h3 className="text-lg font-semibold">{store.name}</h3>
              <p className="text-sm text-gray-500">{store.default_region_id}</p>
              {store.logo && (
                <img src={store.logo} alt="Logo" className="w-16 h-16 mt-2 rounded-full" />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
