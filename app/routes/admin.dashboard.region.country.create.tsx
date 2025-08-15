import { Form, useActionData } from "@remix-run/react";
import type { ActionFunction } from "@remix-run/node";
import { json } from "@remix-run/node";

type ActionData = {
  error?: string;
  success?: boolean;
};

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  const iso_2 = formData.get("iso_2");
  const iso_3 = formData.get("iso_3");
  const num_code = formData.get("num_code");
  const name = formData.get("name");
  const display_name = formData.get("display_name");

  if (
    !iso_2 || !iso_3 || !num_code || !name || !display_name ||
    typeof iso_2 !== "string" ||
    typeof iso_3 !== "string" ||
    typeof num_code !== "string" ||
    typeof name !== "string" ||
    typeof display_name !== "string"
  ) {
    return json({ error: "Tous les champs sont requis" }, { status: 400 });
  }

  try {
    const res = await fetch(`${process.env.PUBLIC_NEST_API_URL}/regions/create-country`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ iso_2, iso_3, num_code, name, display_name }),
    });

    if (!res.ok) {
      const errorData = await res.json();
      return json({ error: errorData.message || "Erreur lors de la création du pays" }, { status: res.status });
    }

    return json({ success: true });
  } catch (error) {
    return json({ error: "Erreur de connexion au serveur" }, { status: 500 });
  }
};

export default function CreateCountry() {
  const actionData = useActionData<ActionData>();

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">Créer un nouveau pays</h1>
      
      <Form method="post" className="space-y-6">
        {actionData?.error && (
          <div className="p-3 bg-red-100 text-red-700 rounded-md">
            {actionData.error}
          </div>
        )}
        
        {actionData?.success && (
          <div className="p-3 bg-green-100 text-green-700 rounded-md">
            Pays créé avec succès
          </div>
        )}

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Code ISO 2*</label>
          <input
            type="text"
            name="iso_2"
            required
            maxLength={2}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="FR"
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Code ISO 3*</label>
          <input
            type="text"
            name="iso_3"
            required
            maxLength={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="FRA"
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Code numérique*</label>
          <input
            type="text"
            name="num_code"
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="250"
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Nom*</label>
          <input
            type="text"
            name="name"
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="France"
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Nom affiché*</label>
          <input
            type="text"
            name="display_name"
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="République française"
          />
        </div>

        <button
          type="submit"
          className="w-full px-4 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
        >
          Créer le pays
        </button>
      </Form>
    </div>
  );
}