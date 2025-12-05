import { json, LoaderFunctionArgs, redirect } from "@remix-run/node";
import { useLoaderData, Form } from "@remix-run/react";
import { getSession } from "~/utils/session.server";

type LoaderData = {
  promotion: any | null;
  error: string | null;
};

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const session = await getSession(request.headers.get("Cookie"));
  const token = session.get("token");
  const storeId = session.get("currentStoreId");
  const promotionId = params.id;

  if (!token) return redirect("/login");
  if (!promotionId) return json<LoaderData>({ promotion: null, error: "Promotion introuvable" });

  try {
    const res = await fetch(`${process.env.NEST_API_URL}/promotions/${storeId}/${promotionId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      const message = body?.message || "Impossible de charger la promotion";
      return json<LoaderData>({ promotion: null, error: message });
    }

    const promotion = await res.json();
    return json<LoaderData>({ promotion, error: null });
  } catch (err: unknown) {
    const error: any = err;
    console.error(error);
    return json<LoaderData>({ promotion: null, error: error?.message || "Erreur serveur inconnue" });
  }
};

export default function PromotionDetails() {
  const { promotion, error } = useLoaderData<typeof loader>();

  if (error) return <p className="text-red-500">{error}</p>;
  if (!promotion) return <p>Promotion introuvable</p>;

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-xl shadow">
      <h1 className="text-2xl font-bold mb-4">Détails de la promotion</h1>

      <p><strong>Type :</strong> {promotion.type}</p>
      <p><strong>Méthode :</strong> {promotion.method}</p>
      <p><strong>Code :</strong> {promotion.code || "-"}</p>
      <p><strong>Valeur :</strong> {promotion.value}</p>

      {/* Statut modifiable */}
      <Form method="post" action={`/dashboard/promotions/${promotion._id}/status`}>
        <label className="block mt-4 mb-1">Statut :</label>
        <select name="status" defaultValue={promotion.status} className="border p-2 rounded">
          <option value="draft">Brouillon</option>
          <option value="active">Actif</option>
          <option value="expired">Expiré</option>
          <option value="deleted">Supprimé</option>
        </select>
        <button type="submit" className="ml-2 bg-orange-600 text-white px-4 py-2 rounded">Mettre à jour</button>
      </Form>

      {/* Conditions */}
      <div className="mt-6">
        <h2 className="text-xl font-semibold mb-2">Conditions</h2>
        {promotion.condition?.length ? (
          <ul className="list-disc pl-6">
            {promotion.condition.map((cond: string, index: number) => (
              <li key={index}>{cond}</li>
            ))}
          </ul>
        ) : (
          <p>Aucune condition définie</p>
        )}
      </div>
    </div>
  );
}
