import { useLoaderData, Link } from "@remix-run/react";
import type { LoaderFunction } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { getSession } from "~/utils/session.server";

type Promotion = {
  _id: string;
  name: string;
  type: string;
  value: number;
  status: "active" | "draft" | "deleted";
  code?: string;
};

type LoaderData = {
  promotions: Promotion[];
};

export const loader: LoaderFunction = async ({ request }) => {
  const session = await getSession(request.headers.get("Cookie"));
  const token = session.get("token");
  console.log("Token extrait de la session:", token);

  if (!token) return redirect("/login");

  const res = await fetch(`${process.env.PUBLIC_NEST_API_URL}/promotion`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    throw new Response("Erreur lors de la récupération des promotions", { status: res.status });
  }

  const promotions: Promotion[] = await res.json();
  return json<LoaderData>({ promotions });

  
};
export default function PromotionsList() {
  const { promotions } = useLoaderData<LoaderData>();

  return (
    <div className="max-w-5xl mx-auto py-10 px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-orange-600">Promotions</h1>
        <Link
          to="/dashboard/promotions/create"
          className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded"
        >
          + Créer une promotion
        </Link>
      </div>

      {promotions.length === 0 ? (
        <p>Aucune promotion disponible.</p>
      ) : (
        <table className="w-full border-collapse bg-white shadow rounded-lg">
          <thead>
            <tr className="bg-gray-100 text-left text-sm text-gray-600">
              <th className="p-3">Nom</th>
              <th className="p-3">Type</th>
              <th className="p-3">Code</th>
              <th className="p-3">Valeur</th>
              <th className="p-3">Statut</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {promotions.map((promo) => (
              <tr key={promo._id} className="border-t hover:bg-gray-50 text-sm">
                <td className="p-3">{promo.name}</td>
                <td className="p-3 capitalize">{promo.type.replace(/_/g, " ")}</td>
                <td className="p-3">{promo.code || "-"}</td>
                <td className="p-3">
                  {promo.type.includes("percent") ? `${promo.value}%` : `${promo.value}€`}
                </td>
                <td className="p-3">
                  <span
                    className={`px-2 py-1 rounded text-xs font-semibold ${
                      promo.status === "active"
                        ? "bg-green-100 text-green-700"
                        : promo.status === "draft"
                        ? "bg-yellow-100 text-yellow-700"
                        : "bg-gray-200 text-gray-500"
                    }`}
                  >
                    {promo.status}
                  </span>
                </td>
                <td className="p-3">
                  <Link
                    to={`/dashboard/promotions/${promo._id}/edit`}
                    className="text-orange-600 hover:underline mr-2"
                  >
                    Modifier
                  </Link>
                  {/* Optionnel : ajout suppression */}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
