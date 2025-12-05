import { json, redirect, type LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData, Link } from "@remix-run/react";
import { Edit, Eye, Trash2, TrendingUp, Tag, Percent, CheckCircle } from "lucide-react";
import { getSession } from "~/utils/session.server";

export async function loader({ request }: LoaderFunctionArgs) {
  const session = await getSession(request.headers.get("Cookie"));
  const token = session.get("token");
  const storeId = session.get("currentStoreId");

  if (!token) return redirect("/login");

  try {
    const res = await fetch(`${process.env.NEST_API_URL}/promotions/${storeId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) throw new Error("Impossible de récupérer les promotions");

    const promotions = await res.json();
    return json({ promotions, error: null });
  } catch (error) {
    console.error(error);
    return json({ promotions: [], error: (error as Error).message });
  }
}

export default function PromotionsPage() {
  const { promotions, error } = useLoaderData<typeof loader>();

  // Calcul des statistiques
  const stats = {
    total: promotions.length,
    active: promotions.filter((p: any) => p.status === "active").length,
    draft: promotions.filter((p: any) => p.status === "draft").length,
    percentage: promotions.filter((p: any) => p.method === "percentage").length,
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Promotions</h1>
        <Link
          to="/dashboard/promotion"
          className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg font-medium transition-colors shadow-sm"
        >
          + Nouvelle promotion
        </Link>
      </div>

      {error && (
        <div className="bg-orange-50 border-l-4 border-orange-500 p-4 mb-6 rounded">
          <p className="text-orange-700">{error}</p>
        </div>
      )}

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium">Total</p>
              <p className="text-3xl font-bold text-gray-800 mt-1">{stats.total}</p>
            </div>
            <div className="bg-orange-100 p-3 rounded-lg">
              <Tag className="h-6 w-6 text-orange-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium">Actives</p>
              <p className="text-3xl font-bold text-gray-800 mt-1">{stats.active}</p>
            </div>
            <div className="bg-orange-100 p-3 rounded-lg">
              <CheckCircle className="h-6 w-6 text-orange-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium">Brouillons</p>
              <p className="text-3xl font-bold text-gray-800 mt-1">{stats.draft}</p>
            </div>
            <div className="bg-gray-100 p-3 rounded-lg">
              <Edit className="h-6 w-6 text-gray-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium">En pourcentage</p>
              <p className="text-3xl font-bold text-gray-800 mt-1">{stats.percentage}</p>
            </div>
            <div className="bg-orange-100 p-3 rounded-lg">
              <Percent className="h-6 w-6 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      {promotions.length === 0 ? (
        <div className="bg-white p-12 rounded-xl border border-gray-200 text-center">
          <Tag className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">Aucune promotion pour le moment.</p>
          <Link
            to="/dashboard/promotion"
            className="inline-block mt-4 text-orange-600 hover:text-orange-700 font-medium"
          >
            Créer votre première promotion →
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="p-4 text-left text-sm font-semibold text-gray-700">Type</th>
                <th className="p-4 text-left text-sm font-semibold text-gray-700">Méthode</th>
                <th className="p-4 text-left text-sm font-semibold text-gray-700">Code</th>
                <th className="p-4 text-left text-sm font-semibold text-gray-700">Valeur</th>
                <th className="p-4 text-left text-sm font-semibold text-gray-700">Statut</th>
                <th className="p-4 text-left text-sm font-semibold text-gray-700">Créée le</th>
                <th className="p-4 text-left text-sm font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {promotions.map((p: any) => (
                <tr key={p._id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                  <td className="p-4 text-gray-800 font-medium">{p.type}</td>
                  <td className="p-4 text-gray-600">{p.method}</td>
                  <td className="p-4">
                    {p.code ? (
                      <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-md font-mono text-sm">
                        {p.code}
                      </span>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                  <td className="p-4 text-gray-800 font-semibold">{p.value}</td>
                  <td className="p-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        p.status === "active"
                          ? "bg-orange-100 text-orange-700"
                          : p.status === "draft"
                          ? "bg-gray-100 text-gray-600"
                          : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      {p.status}
                    </span>
                  </td>
                  <td className="p-4 text-gray-600 text-sm">
                    {new Date(p.createdAt).toLocaleDateString('fr-FR')}
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-1">
                      <Link
                        to={`/dashboard/promotions/${p._id}`}
                        className="p-2 text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                        title="Voir détails"
                      >
                        <Eye className="h-4 w-4" />
                      </Link>
                      <Link
                        to={`/dashboard/promotions/${p._id}/edit`}
                        className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                        title="Modifier"
                      >
                        <Edit className="h-4 w-4" />
                      </Link>
                      <button
                        className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                        title="Supprimer"
                        onClick={() => console.log("Supprimer promotion", p._id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}