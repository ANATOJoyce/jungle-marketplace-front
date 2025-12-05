// app/routes/admin/dashboard/regions/create.tsx
import { ActionFunctionArgs, json, redirect, type LoaderFunction } from "@remix-run/node";
import { Form, useActionData, useNavigation } from "@remix-run/react";
import { getSession } from "~/utils/session.server";

/* ------------------ Loader ------------------ */
export const loader: LoaderFunction = async ({ request }) => {
  const session = await getSession(request.headers.get("Cookie"));
  const token = session.get("token");

  if (!token) return redirect("/login");

  return json({});
};

/* ------------------ Action ------------------ */
export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();

  const name = formData.get("name") as string;
  const currency_code = formData.get("currency_code") as string;
  const automatic_taxes = formData.get("automatic_taxes") === "on";
  const countries = (formData.get("countries") as string)
    ?.split(",")
    .map((id) => id.trim())
    .filter(Boolean);

  if (!name || !currency_code) {
    return json({ error: "Le nom et le code de devise sont requis." }, { status: 400 });
  }

  const region = { name, currency_code, automatic_taxes, countries };

  // Envoi vers ton API NestJS
  const session = await getSession(request.headers.get("Cookie"));
  const token = session.get("token");

  const response = await fetch(`${process.env.PUBLIC_NEST_API_URL || "http://localhost:3000"}/regions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(region),
  });

  if (!response.ok) {
    const text = await response.text();
    return json({ error: `Erreur lors de la création : ${text}` }, { status: 400 });
  }

  return redirect("/admin/dashboard/regions");
}

/* ------------------ Composant ------------------ */
export default function NewRegion() {
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";

  return (
    <div className="max-w-lg mx-auto mt-10 bg-white shadow-lg rounded-2xl p-6">
      <h1 className="text-2xl font-semibold mb-6 text-gray-800">Créer une région</h1>

      {actionData?.error && (
        <p className="bg-red-100 text-red-700 border border-red-400 rounded-md p-2 mb-4">
          {actionData.error}
        </p>
      )}

      <Form method="post" className="space-y-4">
        {/* Nom */}
        <div>
          <label className="block text-sm font-medium mb-1">Nom</label>
          <input
            type="text"
            name="name"
            required
            className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-500"
            placeholder="Europe"
          />
        </div>

        {/* Code devise */}
        <div>
          <label className="block text-sm font-medium mb-1">Code de devise</label>
          <input
            type="text"
            name="currency_code"
            required
            className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-500"
            placeholder="EUR"
          />
        </div>

        {/* Taxes automatiques */}
        <div className="flex items-center space-x-2">
          <input
            id="automatic_taxes"
            type="checkbox"
            name="automatic_taxes"
            defaultChecked
            className="w-4 h-4 border-gray-300 rounded text-blue-600 focus:ring-blue-500"
          />
          <label htmlFor="automatic_taxes" className="text-sm">
            Activer les taxes automatiques
          </label>
        </div>

        {/* Pays */}
        <div>
          <label className="block text-sm font-medium mb-1">
            Identifiants des pays (séparés par des virgules)
          </label>
          <input
            type="text"
            name="countries"
            className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-500"
            placeholder="Ex: 64fa4beaa9..., 64fa4c21b2..."
          />
        </div>

        {/* Bouton */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {isSubmitting ? "Création..." : "Créer la région"}
        </button>
      </Form>
    </div>
  );
}
