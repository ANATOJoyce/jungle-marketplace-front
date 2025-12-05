import { json, LoaderFunctionArgs, ActionFunctionArgs, redirect } from "@remix-run/node";
import { useLoaderData, Form, useNavigation, Link } from "@remix-run/react";
import { getSession } from "~/utils/session.server";
import { Plus, Package, ChevronLeft, ChevronRight, Trash2, Pencil, Search, Eye, EyeOff, Grid3x3, List } from "lucide-react";
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
  const _action = formData.get("_action");

  try {
    if (_action === "delete") {
      const categoryId = formData.get("categoryId");
      await fetch(`${process.env.NEST_API_URL}/product/category/${categoryId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      return redirect(`/dashboard/stores/${storeId}/categories`);
    }

    const body = {
      name: formData.get("name"),
      handle: formData.get("handle"),
      description: formData.get("description"),
      visibility: formData.get("visibility"),
      products: formData.getAll("products"),
    };

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
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("list");
  const [productSearch, setProductSearch] = useState("");

  const handleSelect = (id: string) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
  };

  const filteredCategories = categories.filter(
    (c) =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.handle.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredProducts = products.filter((p) =>
    p.title.toLowerCase().includes(productSearch.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to- p-6">
      <div className="max-w-7xl mx-auto space-y-8">

        {/* TITRE ET ACTIONS */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="p-4 bg-gradient-to-br from-gray-600 via-gray-700 to-gray-900 rounded-2xl shadow-lg">
              <Package className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-gray-800">Catégories</h1>
              <p className="text-gray-600 mt-1">
                {total} catégorie{total > 1 ? "s" : ""} au total
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowForm(!showForm)}
            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-gray-700 to-gray-900 text-white font-semibold rounded-xl hover:shadow-lg transition-all"
          >
            <Plus className="w-5 h-5 mr-2" />
            {showForm ? "Masquer le formulaire" : "Nouvelle catégorie"}
          </button>
        </div>

        {/* FORMULAIRE DE CRÉATION */}
        {showForm && (
          <div className="bg-white border-2 border-gray-300 rounded-2xl shadow-xl p-8 animate-in slide-in-from-top duration-300">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-3 text-gray-800">
              <div className="p-2 bg-gray-100 rounded-lg">
                <Plus className="w-6 h-6 text-gray-700" />
              </div>
              Créer une nouvelle catégorie
            </h2>

            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded-lg">
                <strong className="font-semibold">Erreur:</strong> {error}
              </div>
            )}

            <Form method="post" className="space-y-6">
              <input type="hidden" name="_action" value="create" />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Nom de la catégorie
                  </label>
                  <input
                    type="text"
                    name="name"
                    placeholder="Ex: Vêtements homme"
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-gray-700 focus:ring-2 focus:ring-gray-100 transition-all outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Handle (slug)
                  </label>
                  <input
                    type="text"
                    name="handle"
                    placeholder="ex: vetements-homme"
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-gray-700 focus:ring-2 focus:ring-gray-100 transition-all outline-none"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  name="description"
                  rows={4}
                  placeholder="Décrivez votre catégorie..."
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-gray-700 focus:ring-2 focus:ring-gray-100 transition-all outline-none resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Visibilité
                </label>
                <select
                  name="visibility"
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-gray-700 focus:ring-2 focus:ring-gray-100 transition-all outline-none"
                >
                  <option value="private"> Privée</option>
                  <option value="public"> Publique</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Produits à inclure ({selected.length} sélectionné{selected.length > 1 ? "s" : ""})
                </label>
                
                {/* Recherche de produits */}
                <div className="mb-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      placeholder="Rechercher un produit..."
                      value={productSearch}
                      onChange={(e) => setProductSearch(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 rounded-lg border-2 border-gray-200 focus:border-gray-700 focus:ring-2 focus:ring-gray-100 transition-all outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-h-96 overflow-y-auto border-2 border-gray-200 rounded-xl p-4 bg-gray-50">
                  {filteredProducts.map((p) => (
                    <label
                      key={p._id}
                      className={`flex flex-col items-center border-2 p-3 rounded-xl cursor-pointer transition-all transform hover:scale-105 ${
                        selected.includes(p._id)
                          ? "border-gray-700 bg-gray-100 shadow-md"
                          : "border-gray-200 bg-white hover:border-gray-400"
                      }`}
                      onClick={() => handleSelect(p._id)}
                    >
                      {p.imageUrl ? (
                        <img
                          src={p.imageUrl}
                          alt={p.title}
                          className="w-full h-24 object-cover mb-2 rounded-lg"
                        />
                      ) : (
                        <div className="w-full h-24 bg-gray-200 rounded-lg flex items-center justify-center mb-2">
                          <Package className="w-8 h-8 text-gray-400" />
                        </div>
                      )}
                      <span className="text-xs text-center font-medium line-clamp-2">
                        {p.title}
                      </span>
                      <input
                        type="checkbox"
                        name="products"
                        value={p._id}
                        checked={selected.includes(p._id)}
                        readOnly
                        className="mt-2 w-4 h-4 accent-gray-700"
                      />
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  disabled={navigation.state === "submitting"}
                  className="flex-1 px-6 py-4 bg-gradient-to-r from-gray-700 to-gray-900 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {navigation.state === "submitting" ? "Création en cours..." : "✓ Créer la Catégorie"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-6 py-4 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-all"
                >
                  Annuler
                </button>
              </div>
            </Form>
          </div>
        )}

        {/* BARRE DE RECHERCHE ET FILTRES */}
        <div className="mt-6 p-4 bg-gray-50 rounded-xl border border-gray-200">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Rechercher une catégorie..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-xl border-2 border-gray-200 focus:border-gray-700 focus:ring-2 focus:ring-gray-100 transition-all outline-none"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setViewMode("list")}
                className={`p-3 rounded-lg transition-all ${
                  viewMode === "list"
                    ? "bg-gray-700 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                <List className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode("grid")}
                className={`p-3 rounded-lg transition-all ${
                  viewMode === "grid"
                    ? "bg-gray-700 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                <Grid3x3 className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* LISTE DES CATÉGORIES */}
        <div className="mt-6 p-4 bg-gray-50 rounded-xl border border-gray-200">
          {filteredCategories.length > 0 ? (
            viewMode === "list" ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-100 rounded-xl">
                    <tr>
                      <th className="px-6 py-4 text-left font-bold text-gray-700 border-b-2 border-gray-300">
                        Nom
                      </th>
                      <th className="px-6 py-4 text-left font-bold text-gray-700 border-b-2 border-gray-300">
                        Handle
                      </th>
                      <th className="px-6 py-4 text-left font-bold text-gray-700 border-b-2 border-gray-300">
                        Produits
                      </th>
                      <th className="px-6 py-4 text-left font-bold text-gray-700 border-b-2 border-gray-300">
                        Visibilité
                      </th>
                      <th className="px-6 py-4 text-left font-bold text-gray-700 border-b-2 border-gray-300">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredCategories.map((c) => (
                      <tr key={c._id} className="hover:bg-gray-100 transition-colors">
                        <td className="px-6 py-4 font-semibold text-gray-800">{c.name}</td>
                        <td className="px-6 py-4">
                          <code className="px-2 py-1 bg-gray-100 rounded text-sm text-gray-600">
                            {c.handle}
                          </code>
                        </td>
                        <td className="px-6 py-4">
                          <span className="px-3 py-1 bg-gray-200 text-gray-700 rounded-full text-sm font-semibold">
                            {c.products?.length || 0}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-1 w-fit ${
                              c.visibility === "public"
                                ? "bg-green-100 text-green-700"
                                : "bg-gray-100 text-gray-700"
                            }`}
                          >
                            {c.visibility === "public" ? (
                              <>
                                <Eye className="w-4 h-4" /> Publique
                              </>
                            ) : (
                              <>
                                <EyeOff className="w-4 h-4" /> Privée
                              </>
                            )}
                          </span>
                        </td>
                        <td className="px-6 py-4 flex gap-2">
                          <button className="px-3 py-2 text-blue-600 hover:bg-blue-50 rounded-lg flex items-center gap-1 transition-all font-medium">
                            <Pencil className="w-4 h-4" /> Modifier
                          </button>
                          <Form method="post">
                            <input type="hidden" name="_action" value="delete" />
                            <input type="hidden" name="categoryId" value={c._id} />
                            <button
                              type="submit"
                              onClick={(e) => {
                                if (!confirm("Êtes-vous sûr de vouloir supprimer cette catégorie ?")) {
                                  e.preventDefault();
                                }
                              }}
                              className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg flex items-center gap-1 transition-all font-medium"
                            >
                              <Trash2 className="w-4 h-4" /> Supprimer
                            </button>
                          </Form>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
                {filteredCategories.map((c) => (
                  <div
                    key={c._id}
                    className="bg-white border-2 border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all hover:border-gray-700 group"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="font-bold text-lg text-gray-800 group-hover:text-gray-700 transition-colors">
                          {c.name}
                        </h3>
                        <code className="text-xs text-gray-500">{c.handle}</code>
                      </div>
                      <span
                        className={`px-2 py-1 rounded-lg text-xs font-semibold ${
                          c.visibility === "public"
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {c.visibility === "public" ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                      </span>
                    </div>
                    
                    {c.description && (
                      <p className="text-sm text-gray-600 mb-4 line-clamp-2">{c.description}</p>
                    )}
                    
                    <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                      <span className="text-sm font-semibold text-gray-600">
                        {c.products?.length || 0} produit{(c.products?.length || 0) > 1 ? "s" : ""}
                      </span>
                      <div className="flex gap-2">
                        <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-all">
                          <Pencil className="w-4 h-4" />
                        </button>
                        <Form method="post">
                          <input type="hidden" name="_action" value="delete" />
                          <input type="hidden" name="categoryId" value={c._id} />
                          <button
                            type="submit"
                            onClick={(e) => {
                              if (!confirm("Êtes-vous sûr de vouloir supprimer cette catégorie ?")) {
                                e.preventDefault();
                              }
                            }}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-all"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </Form>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )
          ) : (
            <div className="text-center py-16">
              <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600 font-medium text-lg">
                {searchTerm ? "Aucune catégorie trouvée" : "Aucune catégorie pour cette boutique"}
              </p>
              <p className="text-gray-400 text-sm mt-2">
                {searchTerm ? "Essayez un autre terme de recherche" : "Créez votre première catégorie"}
              </p>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-between items-center p-6 border-t-2 border-gray-300 bg-gradient-to-r from-gray-50 to-gray-100">
              <button
                disabled={page === 1}
                onClick={() => (window.location.href = `?page=${page - 1}`)}
                className="flex items-center px-5 py-3 border-2 border-gray-300 rounded-xl bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-semibold text-gray-700"
              >
                <ChevronLeft className="h-5 w-5 mr-2" /> Précédent
              </button>
              <span className="font-semibold text-gray-700">
                Page <span className="text-gray-900">{page}</span> / {totalPages}
              </span>
              <button
                disabled={page === totalPages}
                onClick={() => (window.location.href = `?page=${page + 1}`)}
                className="flex items-center px-5 py-3 border-2 border-gray-300 rounded-xl bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-semibold text-gray-700"
              >
                Suivant <ChevronRight className="h-5 w-5 ml-2" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}