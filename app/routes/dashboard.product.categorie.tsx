import { Form, useNavigate } from "@remix-run/react";
import { ActionFunction, redirect } from "@remix-run/node";

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  const { title, description } = Object.fromEntries(formData);

  // Poster la catégorie
  await fetch(`${process.env.NEST_API_URL}/product/category`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      title,
      description,
     // Metadata est un objet JSON
    }),
  });

  return redirect(".."); // Redirige vers la page précédente
};

export default function AddCategoryPage() {
  const navigate = useNavigate();

  return (
    <div className="p-6 bg-white rounded shadow-md max-w-xl mx-auto">
      <h2 className="text-2xl font-semibold mb-6 text-center">Ajouter une Catégorie</h2>

      <Form method="post" className="space-y-6">
        {/* Champ pour le titre de la catégorie */}
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700">
            Titre <span className="text-red-500">*</span>
          </label>
          <input
            id="title"
            name="title"
            type="text"
            required
            className="w-full border border-gray-300 rounded-lg px-4 py-2 mt-2"
            placeholder="Nom de la catégorie"
          />
        </div>

        {/* Champ pour la description */}
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700">
            Description
          </label>
          <textarea
            id="description"
            name="description"
            rows={4}
            className="w-full border border-gray-300 rounded-lg px-4 py-2 mt-2"
            placeholder="Description de la catégorie"
          />
        </div>

        {/* Champ pour les métadonnées */}


        <div className="flex justify-between">
          <button
            type="submit"
            className="px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700"
          >
            Créer la Catégorie
          </button>

          <button
            type="button"
            onClick={() => navigate("..")}
            className="px-6 py-2 bg-gray-300 rounded-lg font-semibold hover:bg-gray-400"
          >
            Annuler
          </button>
        </div>
      </Form>
    </div>
  );
}
