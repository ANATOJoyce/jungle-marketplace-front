/* loader.ts */
import { Form, Link, useLoaderData } from "@remix-run/react";
import { useState } from "react";
import { json, redirect } from "@remix-run/node"; 
import { ProductStatus } from "~/types/product";
import { getSession } from "~/utils/session.server";
import { Edit, Trash } from "lucide-react";

interface Variant {
  _id: string;
  size: string;
  color: string;
  price: number;
  stock: number;
}

interface Product {
  _id: string;
  title: string;
  description?: string;
  imageUrl: string;
  price: number;
  status: ProductStatus;
  totalStock: number;
  storeId: { _id: string; name: string };
  variants: Variant[];
}

interface LoaderData {
  product: Product | null;
  error?: string;
}

export async function loader({ request, params }: any) {
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

export async function action({ request, params }: any) {
  const session = await getSession(request.headers.get("Cookie"));
  const token = session.get("token");
  const productId = params.productId;

  if (!token) return redirect("/login");

  const formData = await request.formData();

  try {
    if (formData.has("status")) {
      const status = formData.get("status");
      await fetch(`${process.env.NEST_API_URL}/product/${productId}/status`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
    } else if (formData.has("size") && formData.has("color") && formData.has("price") && formData.has("stock")) {
      const variantData = {
        size: formData.get("size"),
        color: formData.get("color"),
        price: Number(formData.get("price")),
        stock: Number(formData.get("stock")),
      };
      await fetch(`${process.env.NEST_API_URL}/product/${productId}/variant`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ ...variantData, productId }),
      });
    } else {
      return json({ success: false, error: "Formulaire non reconnu" });
    }

    return redirect(`/dashboard/product/${productId}`);
  } catch (err) {
    console.error(err);
    return json({ success: false, error: "Erreur lors de la mise à jour" });
  }
}

export default function ProductPage() {
  const { product } = useLoaderData<LoaderData>();
  const [showVariantPopup, setShowVariantPopup] = useState(false);

  if (!product) return <p>Produit introuvable</p>;

  return (
    <div className="p-6 space-y-6">
      {/* --- Section titre, image et description --- */}
     {/* --- Section titre, image et description --- */}
<div className="flex flex-col md:flex-row items-start md:items-center gap-6 shadow-lg p-6 rounded-lg bg-white border border-gray-200">
  <img src={product.imageUrl} alt={product.title} className="w-full md:w-1/3 rounded-lg object-cover" />
  <div className="flex-1">
    <h1 className="text-3xl font-bold mb-2">{product.title}</h1>
    <p className="text-gray-700 mb-4">{product.description}</p>
    <p className="text-lg font-semibold">Prix: {product.price} CFA</p>
  </div>
</div>

{/* --- Section status --- */}
<div className="shadow-lg p-6 rounded-lg bg-white border border-gray-200">
  <h2 className="text-xl font-bold mb-2">Status</h2>
  <Form method="post" className="flex items-center gap-4">
    <select name="status" defaultValue={product.status} className="border p-2 rounded">
      <option value="draft">Brouillons</option>
      <option value="published">Publié</option>
    </select>
    <button type="submit" className="px-4 py-2 rounded font-bold text-white" style={{ backgroundColor: "#ee9f3c" }}>
      Mettre à jour
    </button>
  </Form>
</div>
{/* --- Section variantes --- */}
<div className="shadow-lg p-6 rounded-lg bg-white border border-gray-200">
  <h2 className="text-xl font-bold mb-2">Variantes</h2>

 {Array.isArray(product.variants) && product.variants.length > 0 ? (
  <ul className="space-y-2">
    {product.variants.map((v) => (
      <li
        key={v._id}
        className="p-2 rounded flex justify-between items-center bg-gray-50 shadow-sm border border-gray-100"
      >
        <div>
          <span>
            {v.size ?? 'N/A'} / {v.color ?? 'N/A'}
          </span>
          <span className="ml-4">
            Prix: {v.price ?? 0} CFA | Stock: {v.stock ?? 0}
          </span>
        </div>
  <div className="grid grid-cols-2 gap-2">
  {/* Lien pour modifier la variante */}
  <Link
    to={`/dashboard/products/${product._id}/variants/${v._id}/edit`}
    className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
  >
    <Edit className="h-4 w-4" />
    Modifier
  </Link>

  {/* Lien pour "supprimer" la variante (redirige vers page de confirmation / suppression) */}
  <Link
    to={`/dashboard/products/${product._id}/variants/${v._id}/delete`}
    className="flex items-center justify-center gap-2 px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors text-sm font-medium"
  >
    <Trash className="h-4 w-4" />
    Supprimer
  </Link>
</div>

      </li>
    ))}
  </ul>
) : (
  <p>Aucune variante pour ce produit.</p>
)}


  <button
    className="mt-4 px-4 py-2 rounded font-bold text-white"
    style={{ backgroundColor: '#ee9f3c' }}
    onClick={() => setShowVariantPopup(true)}
  >
    Ajouter une variante
  </button>
</div>



      {/* --- Popup Formulaire Nouvelle Variante --- */}
      {showVariantPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-md relative shadow-lg">
            <button className="absolute top-2 right-2 text-black font-bold text-xl" onClick={() => setShowVariantPopup(false)}>
              &times;
            </button>
            <h3 className="text-2xl font-bold mb-4">Nouvelle variante</h3>
            <Form method="post" className="space-y-2">
              <input type="text" name="size" placeholder="Taille" className="w-full border p-2 rounded" />
              <input type="text" name="color" placeholder="Couleur" className="w-full border p-2 rounded" />
              <input type="number" name="price" placeholder="Prix" className="w-full border p-2 rounded" />
              <input type="number" name="stock" placeholder="Stock" className="w-full border p-2 rounded" />
              <button type="submit" className="w-full py-2 rounded font-bold text-white" style={{ backgroundColor: "#ee9f3c" }}>
                Ajouter
              </button>
            </Form>
          </div>
        </div>
      )}
    </div>
  );
}
