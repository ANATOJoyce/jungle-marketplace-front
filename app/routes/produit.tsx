import { LoaderFunctionArgs, json, redirect } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { getSession } from "~/utils/session.server";
import { Product } from "~/types/product";
import { Package } from "lucide-react";

interface LoaderData {
  product: Product | null;
  error?: string;
}

export async function loader({ request, params }: LoaderFunctionArgs) {
  const session = await getSession(request.headers.get("Cookie"));
  const token = session.get("token");
  const productId = params.productId;

  if (!token) return redirect("/login");
  if (!productId) return json({ product: null, error: "ID du produit manquant." });

  try {
    const response = await fetch(`${process.env.NEST_API_URL}/product/${productId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) throw new Error("Produit introuvable");

    const data = await response.json();
    return json({ product: data });
  } catch (err) {
    console.error(err);
    return json({ product: null, error: "Erreur lors de la récupération du produit." });
  }
}

export default function ProductDetailPage() {
  const { product, error } = useLoaderData<LoaderData>();

  if (error) return <div className="text-red-500">{error}</div>;
  if (!product) return <div>Produit introuvable</div>;

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold">{product.title}</h1>
      <p className="text-gray-700">{product.description || "Pas de description."}</p>

      <div className="flex gap-6">
        <div className="w-48 h-48 bg-gray-100 flex items-center justify-center rounded-xl overflow-hidden">
          {product.imageUrl ? (
            <img src={product.imageUrl} alt={product.title} className="w-full h-full object-cover" />
          ) : (
            <span className="text-gray-400">Pas d'image</span>
          )}
        </div>

        <div className="flex-1 space-y-2">
          <p><strong>Boutique :</strong> {product.store?.name || "Boutique inconnue"}</p>
          <p><strong>Stock total :</strong> {product.totalStock}</p>
          <td className="px-6 py-4">
            <div className="w-12 h-12 bg-gradient-to-br from-amber-100 to-amber-200 rounded-xl flex items-center justify-center overflow-hidden">
                {product.imageUrl ? (
                    <img src={product.imageUrl} className="w-full h-full object-cover rounded-xl" />
                    ) : (
                    <Package className="h-6 w-6 text-amber-600" />
                )}
            </div>
          </td>          
          <p><strong>Proprietaire:</strong> {product.owner?.phone ?? "—"}</p>
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Variantes</h2>
        {product.variants?.length ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {product.variants.map((v) => (
              <div key={v.id} className="p-3 border border-gray-200 rounded-lg">
                <p><strong>Couleur :</strong> {v.color || "—"}</p>
                <p><strong>Taille :</strong> {v.size || "—"}</p>
                <p><strong>Prix :</strong> {v.price ?? "—"}</p>
                <p><strong>Stock :</strong> {v.stock ?? 0}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 italic">Aucune variante disponible</p>
        )}
      </div>
    </div>
  );
}
