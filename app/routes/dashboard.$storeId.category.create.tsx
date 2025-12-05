import { json, LoaderFunctionArgs, ActionFunctionArgs, redirect } from "@remix-run/node";
import { useLoaderData, Form, useNavigation } from "@remix-run/react";
import { getSession } from "~/utils/session.server";
import { Plus, Package, ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";

interface Product { 
  _id: string;
  title: string;
  imageUrl: string;
}

interface Category {
  _id: string;
  name: string;
  handle: string;
  description?: string;
  visibility: "public" | "private";
  products?: Product[];
}

interface LoaderData {
  categories: Category[];
  products: Product[];
  storeId: string;
  page: number;
  totalPages: number;
  total: number;
  error?: string;
}

/* ------------------ LOADER ------------------ */
export async function loader({ request, params }: LoaderFunctionArgs) {
  const session = await getSession(request.headers.get("Cookie"));
  const token = session.get("token");
  const storeId = params.storeId;

  if (!token) return redirect("/login");
  if (!storeId) throw new Response("Boutique introuvable", { status: 404 });

  const url = new URL(request.url);
  const page = Number(url.searchParams.get("page")) || 1;

  try {
    const [categoriesRes, productsRes] = await Promise.all([
      fetch(`${process.env.NEST_API_URL}/product/category/store/${storeId}?page=${page}`, {
        headers: { Authorization: `Bearer ${token}` },
      }),
      fetch(`${process.env.NEST_API_URL}/product/store/${storeId}`, {
        headers: { Authorization: `Bearer ${token}` },
      }),
    ]);

    if (!categoriesRes.ok || !productsRes.ok) throw new Error("Erreur de chargement");

    const catData = await categoriesRes.json();
    const prodData = await productsRes.json();

    return json<LoaderData>({
      categories: catData.data || [],
      products: prodData.data || [],
      storeId,
      page: catData.meta?.page || 1,
      totalPages: catData.meta?.totalPages || 1,
      total: catData.meta?.total || 0,
    });
  } catch (err) {
    console.error(err);
    return json({
      categories: [],
      products: [],
      storeId,
      page: 1,
      totalPages: 1,
      total: 0,
      error: "Erreur lors du chargement des données.",
    });
  }
}

/* ------------------ ACTION ------------------ */
export async function action({ request, params }: ActionFunctionArgs) {
  const session = await getSession(request.headers.get("Cookie"));
  const token = session.get("token");
  const storeId = params.storeId;

  if (!token) return redirect("/login");
  if (!storeId) throw new Response("Boutique introuvable", { status: 404 });

  const formData = await request.formData();
  const body = {
    name: formData.get("name"),
    description: formData.get("description"),
    visibility: formData.get("visibility"),
    products: formData.getAll("products"),
  };

  try {
    const res = await fetch(`${process.env.NEST_API_URL}/product/${storeId}/category`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const err = await res.json();
      return json({ error: err.message || "Erreur lors de la création" });
    }

    return redirect(`/dashboard/stores/${storeId}/categories`);
  } catch (error) {
    console.error(error);
    return json({ error: "Erreur interne du serveur" });
  }
}

/* ------------------ COMPOSANT ------------------ */
export default function StoreCategoriesPage() {
  const { products, categories, storeId, page, totalPages, total, error } =
    useLoaderData<LoaderData>();
  const navigation = useNavigation();
  const [selected, setSelected] = useState<string[]>([]);

  const handleSelect = (id: string) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
  };

  return (
    <div className="min-h-screen bg-white p-6">
      <div className="max-w-6xl mx-auto space-y-10">

        {/* TITRE */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-[#fbb344] rounded-xl shadow-md">
              <Package className="h-7 w-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Catégories du magasin</h1>
              <p className="text-gray-600">{total} catégorie(s)</p>
            </div>
          </div>
        </div>

        {/* FORMULAIRE DE CRÉATION */}
        <div className="bg-white border border-amber-200 rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Plus className="w-5 h-5 text-amber-600" /> Créer une nouvelle catégorie
          </h2>

          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 mb-4">
              <strong>Erreur:</strong> {error}
            </div>
          )}

          <Form method="post" className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Nom</label>
              <input
                type="text"
                name="name"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Description</label>
              <textarea
                name="description"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Visibilité</label>
              <select name="visibility" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm">
                <option value="private">Privée</option>
                <option value="public">Publique</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Produits à inclure
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-h-80 overflow-y-auto border rounded-md p-2">
                {products.map((p) => (
                  <label
                    key={p._id}
                    className={`flex flex-col items-center border p-2 rounded-md cursor-pointer ${
                      selected.includes(p._id)
                        ? "border-[#fbb344] bg-amber-50"
                        : "border-gray-200"
                    }`}
                    onClick={() => handleSelect(p._id)}
                  >
                    {p.imageUrl && (
                      <img
                        src={p.imageUrl}
                        alt={p.title}
                        className="w-20 h-20 object-cover mb-2 rounded"
                      />
                    )}
                    <span className="text-sm text-center">{p.title}</span>
                    <input
                      type="checkbox"
                      name="products"
                      value={p._id}
                      checked={selected.includes(p._id)}
                      readOnly
                      className="mt-1"
                    />
                  </label>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={navigation.state === "submitting"}
              className="px-6 py-3 bg-[#fbb344] text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-transform transform hover:scale-105"
            >
              {navigation.state === "submitting" ? "Création..." : "Créer la Catégorie"}
            </button>
          </Form>
        </div>

        {/* LISTE DES CATÉGORIES */}
        <div className="bg-white rounded-xl border border-amber-100 shadow-sm">
          {categories.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-amber-50">
                  <tr>
                    <th className="px-6 py-3 text-left font-semibold text-gray-700 border-b">Nom</th>
                    <th className="px-6 py-3 text-left font-semibold text-gray-700 border-b">Description</th>
                    <th className="px-6 py-3 text-left font-semibold text-gray-700 border-b">Produits</th>
                    <th className="px-6 py-3 text-left font-semibold text-gray-700 border-b">Visibilité</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-amber-100">
                  {categories.map((c) => (
                    <tr key={c._id} className="hover:bg-amber-50">
                      <td className="px-6 py-4">{c.name}</td>
                      <td className="px-6 py-4">{c.description || "-"}</td>
                      <td className="px-6 py-4">{c.products?.length || 0}</td>
                      <td className="px-6 py-4 capitalize">{c.visibility}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-600">
              Aucune catégorie pour cette boutique.
            </div>
          )}

          {/* Pagination */}
          <div className="flex justify-between items-center p-4 border-t bg-amber-50">
            <button
              disabled={page === 1}
              onClick={() => (window.location.href = `?page=${page - 1}`)}
              className="flex items-center px-4 py-2 border rounded-lg bg-white hover:bg-amber-100 disabled:opacity-50"
            >
              <ChevronLeft className="h-4 w-4 mr-1" /> Précédent
            </button>
            <span>Page {page} / {totalPages}</span>
            <button
              disabled={page === totalPages}
              onClick={() => (window.location.href = `?page=${page + 1}`)}
              className="flex items-center px-4 py-2 border rounded-lg bg-white hover:bg-amber-100 disabled:opacity-50"
            >
              Suivant <ChevronRight className="h-4 w-4 ml-1" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
