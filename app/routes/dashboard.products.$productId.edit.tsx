// -------------------------
// IMPORTS
// -------------------------
import {
  json,
  redirect,
  type LoaderFunction,
  type ActionFunction,
} from "@remix-run/node";

import {
  useLoaderData,
  useActionData,
  useNavigation,
  Form,
  useNavigate,
} from "@remix-run/react";

import { getSession } from "~/utils/session.server";
import { useEffect, useState } from "react";
import UploadWidget from "~/components/uploadWidget";


// -------------------------
// TYPES
// -------------------------
type Product = {
  _id: string;
  title: string;
  description: string;
  price: number;
  totalStock: number;
  status: string;
  imageUrl?: string;
};

type LoaderData = {
  product: Product;
};

type ActionData = {
  error?: string;
  success?: boolean;
};


// -------------------------
// LOADER
// -------------------------
export const loader: LoaderFunction = async ({ request, params }) => {
  const session = await getSession(request.headers.get("Cookie"));
  const token = session.get("token");

  if (!token) return redirect("/login");

  const productId = params.productId;
  if (!productId) throw new Response("ID manquant", { status: 400 });

  const res = await fetch(
    `${process.env.NEST_API_URL}/product/${productId}`,
    { headers: { Authorization: `Bearer ${token}` } }
  );

  if (!res.ok) {
    console.log(" ERREUR PRODUCT:", await res.text());
    throw new Response("Produit introuvable", { status: 404 });
  }

  const product = await res.json();

  //  Important : toujours retourner un fallback éviter SSR undefined
  return json<LoaderData>({
    product: {
      _id: product._id || "",
      title: product.title || "",
      description: product.description || "",
      price: product.price ?? 0,
      totalStock: product.totalStock ?? 0,
      status: product.status || "draft",
      imageUrl: product.imageUrl || "",
    },
  });
};


// -------------------------
// ACTION
// -------------------------
export const action: ActionFunction = async ({ request, params }) => {
  const session = await getSession(request.headers.get("Cookie"));
  const token = session.get("token");

  if (!token) return redirect("/login");

  const productId = params.productId;
  if (!productId) return json({ error: "ID manquant" }, { status: 400 });

  const form = await request.formData();

  const data = {
    title: form.get("title"),
    description: form.get("description"),
    price: Number(form.get("price")),
    totalStock: Number(form.get("totalStock")),
    status: form.get("status"),
    imageUrl: form.get("imageUrl"),
  };

  try {
    const res = await fetch(`${process.env.NEST_API_URL}/product/${productId}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const errorData = await res.json();
      return json({ error: errorData.message || "Erreur lors de la mise à jour" }, { status: res.status });
    }

    // Si tu veux rediriger vers la page du produit après update
    return redirect(`/dashboard/product/${productId}`);
    
  } catch (error) {
    console.error("Erreur lors de la mise à jour du produit :", error);
    return json({ error: "Erreur serveur" }, { status: 500 });
  }
};

// -------------------------
// COMPONENT (MODAL)
// -------------------------
export default function EditProductModal() {
  const { product } = useLoaderData<LoaderData>();
  const actionData = useActionData<ActionData>();
  const navigation = useNavigation();
  const navigate = useNavigate();

  const isSubmitting = navigation.state === "submitting";

  // Form state comme ton SettingsModal
  const [form, setForm] = useState({
    title: product.title,
    description: product.description,
    price: product.price,
    totalStock: product.totalStock,
    status: product.status,
    imageUrl: product.imageUrl || "",
  });

  const [hasChanges, setHasChanges] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    if (actionData?.success) {
      setShowSuccess(true);
      setHasChanges(false);
      setTimeout(() => setShowSuccess(false), 3000);
    }
  }, [actionData]);

  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setHasChanges(true);
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-6 w-full max-w-2xl relative">

        <button
          onClick={() => navigate(-1)}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
        >
          ✕
        </button>

        <h1 className="text-2xl font-bold mb-4 text-orange-600">
          Modifier un produit
        </h1>

        {actionData?.error && (
          <div className="bg-red-50 border border-red-200 p-3 rounded mb-4 text-red-700">
            {actionData.error}
          </div>
        )}

        {showSuccess && (
          <div className="bg-green-50 border border-green-200 p-3 rounded mb-4 text-green-700">
            Produit mis à jour 
          </div>
        )}

            <Form method="post" className="space-y-4">
        {/* --- Ligne 1 : Nom, Prix, Stock, Statut --- */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium">Nom</label>
            <input
              name="title"
              value={form.title}
              onChange={handleChange}
              required
              className="w-full border px-3 py-2 rounded"
            />
          </div>

          <div>
            <label className="block text-sm font-medium">Prix</label>
            <input
              type="number"
              name="price"
              value={form.price}
              onChange={handleChange}
              required
              className="w-full border px-3 py-2 rounded"
            />
          </div>

          <div>
            <label className="block text-sm font-medium">Stock</label>
            <input
              type="number"
              name="totalStock"
              value={form.totalStock}
              onChange={handleChange}
              required
              className="w-full border px-3 py-2 rounded"
            />
          </div>

          <div>
            <label className="block text-sm font-medium">Statut</label>
            <select
              name="status"
              value={form.status}
              onChange={handleChange}
              className="w-full border px-3 py-2 rounded"
            >
              <option value="draft">Brouillon</option>
              <option value="published">Publié</option>
            </select>
          </div>
        </div>

        {/* --- Ligne 2 : Description --- */}
        <div>
          <label className="block text-sm font-medium">Description</label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded"
            rows={4}
          />
        </div>

        {/* --- Ligne 3 : Image --- */}
        <div className="flex flex-col md:flex-row items-start gap-4">
          <div className="flex-shrink-0">
            {form.imageUrl && (
              <img
                src={form.imageUrl}
                className="w-40 h-40 object-cover rounded mb-2"
              />
            )}
          </div>

          <div className="flex-1">
            <label className="block text-sm font-medium">Image</label>
            <UploadWidget
              onUpload={(url) => {
                setForm((prev) => ({ ...prev, imageUrl: url }));
                setHasChanges(true);
              }}
            />
            <input type="hidden" name="imageUrl" value={form.imageUrl} />
          </div>
        </div>

        {/* --- Actions --- */}
        <div className="flex justify-end gap-3 pt-4">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="px-4 py-2 bg-gray-300 rounded"
          >
            Annuler
          </button>

          <button
            type="submit"
            disabled={isSubmitting || !hasChanges}
            className="px-4 py-2 bg-orange-500 text-white rounded"
          >
            {isSubmitting ? "Enregistrement..." : "Enregistrer"}
          </button>
        </div>
      </Form>

      </div>
    </div>
  );
}
