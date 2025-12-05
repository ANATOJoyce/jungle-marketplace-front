// app/routes/stores/$storeId.tsx
import { LoaderFunction, ActionFunction, json, redirect } from "@remix-run/node";
import { useLoaderData, Form, useNavigation } from "@remix-run/react";
import type { Store } from "~/types/store";

// --- LOADER ---
export const loader: LoaderFunction = async ({ params }) => {
  const res = await fetch(`${process.env.NEST_API_URL}/store/${params.storeId}`);

  if (!res.ok) {
    throw new Response("Erreur lors du chargement de la boutique", { status: res.status });
  }

  const rawStore = await res.json();

  const store: Store = {
    id: rawStore._id ?? rawStore.id,
    name: rawStore.name,
    default_sales_channel_id: rawStore.default_sales_channel_id,
    default_region_id: rawStore.default_region_id,
    default_location_id: rawStore.default_location_id ?? null,
    supported_currencies: rawStore.supported_currencies ?? [],
    owner: rawStore.owner,
    status: rawStore.status,
    createdAt: rawStore.createdAt,
    updatedAt: rawStore.updatedAt,
  };

  return json(store);
};

// --- ACTION ---
export const action: ActionFunction = async ({ request, params }) => {
  const formData = await request.formData();
  const actionType = formData.get("actionType");

  let newStatus: string | null = null;

  if (actionType === "activate") newStatus = "active";
  if (actionType === "deactivate") newStatus = "inactive";

  if (!newStatus) {
    return json({ error: "Action inconnue." }, { status: 400 });
  }

  const res = await fetch(`${process.env.NEST_API_URL}/store/${params.id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status: newStatus }),
  });

  if (!res.ok) {
    return json({ error: `Erreur lors de la mise à jour de la boutique.` }, { status: 500 });
  }

  return redirect(`/admin/dashboard/stores/${params.id}?success=status_mis_a_jour`);
};

// --- COMPOSANT ---
export default function StoreDetails() {
  const store = useLoaderData<Store>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString("fr-FR", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  const isInactive = store.status === "inactive";

  return (
    <div className="p-6 max-w-3xl mx-auto bg-white shadow rounded-xl mt-6">
      <h1 className="text-2xl font-bold mb-4 text-orange-600">Détails de la Boutique</h1>

      <div className="space-y-2">
        <p><strong>IDccccc:</strong> {store.id}</p>
        <p><strong>Nom:</strong> {store.name}</p>
        <p><strong>Canal de vente par défaut:</strong> {store.default_sales_channel_id || "—"}</p>
        <p><strong>Région par défaut:</strong> {store.default_region_id || "—"}</p>
        <p><strong>Emplacement par défaut:</strong> {store.default_location_id || "—"}</p>
        <p><strong>Devises supportées:</strong> {store.supported_currencies.join(", ") || "—"}</p>
        <p><strong>Statut:</strong> 
          <span className={`ml-2 px-2 py-1 rounded text-sm ${isInactive ? 'bg-orange-100 text-orange-800' : 'bg-orange-100 text-orange-800'}`}>
            {isInactive ? "Inactif" : "Actif"}
          </span>
        </p>
        <p><strong>Créé le:</strong> {formatDate(store.createdAt)}</p>
        <p><strong>Mis à jour le:</strong> {formatDate(store.updatedAt)}</p>
      </div>

      <div className="mt-6 space-x-4">
        {isInactive ? (
          <Form method="post" className="inline">
            <input type="hidden" name="actionType" value="activate" />
            <button
              type="submit"
              className="px-6 py-3 bg-orange-600 text-white rounded hover:bg-orange-700 disabled:opacity-50 transition-colors"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Activation..." : "Activer la boutique"}
            </button>
          </Form>
        ) : (
          <Form method="post" className="inline">
            <input type="hidden" name="actionType" value="deactivate" />
            <button
              type="submit"
              className="px-6 py-3 bg-orange-600 text-white rounded hover:bg-orange-700 disabled:opacity-50 transition-colors"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Désactivation..." : "Désactiver la boutique"}
            </button>
          </Form>
        )}
      </div>
    </div>
  );
}