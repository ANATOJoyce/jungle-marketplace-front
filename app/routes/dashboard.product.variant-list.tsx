import { Link, useLoaderData, useNavigate, useParams } from "@remix-run/react";
import type { LoaderFunction, ActionFunction } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { Plus } from "lucide-react";

// Définir le type Variant
interface Variant {
  _id: string;
  sku: string;
  barcode: string;
  rank: number;
  price: number;
}

export const loader: LoaderFunction = async ({ params }) => {
  // Récupérer les variantes de l'API
  const res = await fetch(`${process.env.NEST_API_URL}/product/variants`);
  const variants = await res.json();

  console.log("variants",variants);  // Affiche les données dans la console pour vérifier leur structure

  // Vérifie si variants est bien un tableau
  if (Array.isArray(variants)) {
    return json({ variants });
  } else {
    // Gérer l'erreur si ce n'est pas un tableau
    return json({ variants: [] });
  }
};


export default function VariantsList() {
  const { productId } = useParams();
  const navigate = useNavigate();

  // Récupérer les données avec un type explicite
  const data = useLoaderData<{ variants: Variant[] }>();

  return (
    <div className="p-6 bg-white rounded shadow-md max-w-4xl mx-auto">
      {/* Bouton "Ajouter une Variante" */}
      <div className="text-right mb-6">
        <Link
          to="/dashboard/product/variant"
          className="group relative inline-flex items-center px-6 py-3 bg-[#fbb344] text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 overflow-hidden"
        >
          <div className="absolute inset-0 bg-amber-600 opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
          <Plus className="h-5 w-5 mr-2 relative z-10" />
          <span className="relative z-10">Créer un Produit</span>
        </Link>
      </div>

      <h2 className="text-2xl font-semibold mb-4 text-center">Liste des Variantes</h2>

      {/* Tableau des variantes */}
      <table className="min-w-full table-auto border-collapse">
        <thead>
          <tr>
            <th className="px-4 py-2 text-left border-b">SKU</th>
            <th className="px-4 py-2 text-left border-b">Barcode</th>
            <th className="px-4 py-2 text-left border-b">Rank</th>
            <th className="px-4 py-2 text-left border-b">Price</th>
            <th className="px-4 py-2 text-left border-b">Actions</th>
          </tr>
        </thead>
        <tbody>
          {data.variants.map((variant) => (
            <tr key={variant._id} className="border-b">
              <td className="px-4 py-2">{variant.sku}</td>
              <td className="px-4 py-2">{variant.barcode}</td>
              <td className="px-4 py-2">{variant.rank}</td>
              <td className="px-4 py-2">{variant.price}</td>
              <td className="px-4 py-2 text-center">
                <button
                  onClick={() => navigate(`/product/${productId}/variant/edit/${variant._id}`)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Modifier
                </button>
                <button
                  onClick={() => handleDelete(variant._id)}
                  className="ml-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  Supprimer
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  // Fonction pour supprimer une variante
  async function handleDelete(variantId: string) {
    if (confirm("Êtes-vous sûr de vouloir supprimer cette variante ?")) {
      await fetch(`${process.env.NEST_API_URL}/product/variant/${variantId}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      });

      // Reload pour actualiser la liste
      window.location.reload();
    }
  }
}
