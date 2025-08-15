import { useLoaderData, Form, useNavigation } from "@remix-run/react";
import type { LoaderFunction, ActionFunction } from "@remix-run/node";
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

export const loader: LoaderFunction = async ({ params, request }) => {
  const session = await getSession(request.headers.get("Cookie"));
  const token = session.get("token");

  if (!token) return redirect("/login");
  const { id } = params;

  const res = await fetch(`${process.env.PUBLIC_NEST_API_URL}/promotion/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) throw new Response("Erreur lors du chargement", { status: res.status });

  const promotion: Promotion = await res.json();
  return json(promotion);
};
export const action: ActionFunction = async ({ request, params }) => {
  const session = await getSession(request.headers.get("Cookie"));
  const token = session.get("token");
  if (!token) return redirect("/login");

const formData = await request.formData();

const method = formData.get("_method");

const payload = {
  name: formData.get("name"),
  code: formData.get("code"),
  value: Number(formData.get("value")),
  status: formData.get("status"),
};

  const res = await fetch(`${process.env.PUBLIC_NEST_API_URL}/promotion/${params.id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const data = await res.json();
    return json({ error: data.message }, { status: res.status });
  }

  return redirect("/dashboard/promotions");
};
export default function EditPromotionPage() {
  const promo = useLoaderData<Promotion>();
  const navigation = useNavigation();

  return (
    <div className="max-w-xl mx-auto py-10 px-4">
      <h1 className="text-2xl font-bold text-orange-600 mb-6">Modifier la promotion</h1>

      <Form method="post" className="space-y-4">
        <div>
          <label className="block font-medium">Nom</label>
          <input
            type="text"
            name="name"
            defaultValue={promo.name}
            required
            className="w-full border px-4 py-2 rounded"
          />
        </div>

        <div>
          <label className="block font-medium">Code</label>
          <input
            type="text"
            name="code"
            defaultValue={promo.code || ""}
            className="w-full border px-4 py-2 rounded"
          />
        </div>

        <div>
          <label className="block font-medium">Valeur</label>
          <input
            type="number"
            name="value"
            defaultValue={promo.value}
            required
            className="w-full border px-4 py-2 rounded"
          />
        </div>

        <div>
          <label className="block font-medium">Statut</label>
          <select name="status" defaultValue={promo.status} className="w-full border px-4 py-2 rounded">
            <option value="active">Actif</option>
            <option value="draft">Brouillon</option>
          </select>
        </div>

        <button
          type="submit"
          className="w-full bg-orange-600 text-white py-3 rounded hover:bg-orange-700"
        >
          {navigation.state === "submitting" ? "Enregistrement..." : "Enregistrer"}
        </button>
      </Form>

      <Form method="post" className="mt-6">
        <input type="hidden" name="_method" value="delete" />
        <button
            type="submit"
            className="w-full py-3 bg-red-600 text-white rounded hover:bg-red-700"
            onClick={(e) => {
            if (!confirm("Êtes-vous sûr de vouloir supprimer cette promotion ?")) {
                e.preventDefault();
            }
            }}
        >
            Supprimer la promotion
        </button>
        </Form>

    </div>
  );
}
