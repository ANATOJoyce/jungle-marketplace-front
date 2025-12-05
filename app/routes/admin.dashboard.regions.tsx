import { json, redirect, type LoaderFunction, type ActionFunction } from "@remix-run/node";
import { useLoaderData, Form, useActionData, useNavigation } from "@remix-run/react";
import { getSession } from "~/utils/session.server";
import { useState } from "react";
import { Button } from "~/components/ui/Button";

/* ------------------ LOADER ------------------ */
export const loader: LoaderFunction = async ({ request }) => {
  const session = await getSession(request.headers.get("Cookie"));
  const token = session.get("token");

  if (!token) return redirect("/login");

  try {
    // Récupère la liste de tous les pays
    const res = await fetch(`${process.env.PUBLIC_NEST_API_URL || "http://localhost:3000"}/regions/countries`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) return json({ countries: [] });

    const countries = await res.json();
    return json({ countries });
  } catch (err) {
    console.error(err);
    return json({ countries: [] });
  }
};

/* ------------------ ACTION ------------------ */
export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  const name = formData.get("name") as string;
  const iso2 = formData.get("iso2") as string;
  const iso3 = formData.get("iso3") as string;
  const currency_code = formData.get("currency_code") as string;
  const tax_rate = parseFloat(formData.get("tax_rate") as string) || 0;

  if (!name || !iso2 || !iso3 || !currency_code) {
    return json({ error: "Tous les champs obligatoires doivent être remplis." }, { status: 400 });
  }

  const session = await getSession(request.headers.get("Cookie"));
  const token = session.get("token");

  const payload = { name, iso2, iso3, currency_code, tax_rate };

  const res = await fetch(`${process.env.PUBLIC_NEST_API_URL || "http://localhost:3000"}/regions/countries`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const text = await res.text();
    return json({ error: `Erreur : ${text}` }, { status: 400 });
  }

  return redirect("/admin/dashboard/countries");
};

/* ------------------ PAGE PRINCIPALE ------------------ */
export default function AdminCountriesPage() {
  const { countries } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";
  const [showModal, setShowModal] = useState(false);

  return (
    <div className="container mx-auto px-4 ">
      <div className="max-w-5xl mx-auto bg-white shadow-lg rounded-2xl p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold text-gray-800">Liste des pays</h1>
          <Button onClick={() => setShowModal(true)}>Nouveau pays</Button>
        </div>

        {countries.length === 0 ? (
          <p className="text-gray-600 text-center py-10">Aucun pays trouvé.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full border border-gray-200 text-sm">
              <thead className="bg-gray-100 text-gray-700 uppercase">
                <tr>
                  <th className="py-3 px-4 text-left border-b">Pays</th>
                  <th className="py-3 px-4 text-left border-b">ISO2</th>
                  <th className="py-3 px-4 text-left border-b">ISO3</th>
                  <th className="py-3 px-4 text-left border-b">Devise</th>
                  <th className="py-3 px-4 text-left border-b">Taux TVA (%)</th>
                  <th className="py-3 px-4 text-left border-b">Créé le</th>
                </tr>
              </thead>
              <tbody>
                {countries.map((country: any) => (
                  <tr key={country._id} className="hover:bg-gray-50 border-b transition">
                    <td className="py-2 px-4 font-medium text-gray-800">{country.name}</td>
                    <td className="py-2 px-4">{country.iso2}</td>
                    <td className="py-2 px-4">{country.iso3}</td>
                    <td className="py-2 px-4">{country.currency_code}</td>
                    <td className="py-2 px-4">{country.tax_rate ?? 0}</td>
                    <td className="py-2 px-4 text-gray-500 text-sm">
                      {new Date(country.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ------------------ MODAL DE CRÉATION D’UN PAYS ------------------ */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full relative shadow-lg">
            <button
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
              onClick={() => setShowModal(false)}
            >
              ✕
            </button>

            <h2 className="text-xl font-semibold mb-4 text-gray-800">Créer un pays</h2>

            {actionData?.error && (
              <p className="bg-red-100 text-red-700 border border-red-400 rounded-md p-2 mb-4">
                {actionData.error}
              </p>
            )}

            <Form method="post" className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Nom du pays</label>
                <input
                  type="text"
                  name="name"
                  required
                  className="w-full border rounded-lg p-2"
                  placeholder="Ex : Côte d’Ivoire"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Code ISO2</label>
                <input
                  type="text"
                  name="iso2"
                  maxLength={2}
                  required
                  className="w-full border rounded-lg p-2 uppercase"
                  placeholder="Ex : CI"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Code ISO3</label>
                <input
                  type="text"
                  name="iso3"
                  maxLength={3}
                  required
                  className="w-full border rounded-lg p-2 uppercase"
                  placeholder="Ex : CIV"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Code de la devise</label>
                <input
                  type="text"
                  name="currency_code"
                  required
                  className="w-full border rounded-lg p-2 uppercase"
                  placeholder="Ex : XOF"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Taux de TVA (%)</label>
                <input
                  type="number"
                  name="tax_rate"
                  className="w-full border rounded-lg p-2"
                  min="0"
                  max="100"
                  step="0.01"
                  placeholder="Ex : 18"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-gray-800 text-white py-2 rounded-lg disabled:opacity-50"
              >
                {isSubmitting ? "Création..." : "Créer le pays"}
              </button>
            </Form>
          </div>
        </div>
      )}
    </div>
  );
}
