import { useEffect, useState } from "react";
import type { LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";

type ProductTag = {
  id: string;
  value: string;
  metadata?: Record<string, any>;
  products?: string[]; // IDs
};

export const loader: LoaderFunction = async () => {
  return json([]);
};

export default function ProductTagsPage() {
  const [tags, setTags] = useState<ProductTag[]>([]);
  const [filteredTags, setFilteredTags] = useState<ProductTag[]>([]);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState<Partial<ProductTag>>({});
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const token = typeof window !== "undefined" ? localStorage.getItem("authToken") : null;
  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };

  // --- FETCH ---
  const fetchTags = async () => {
    try {
      const res = await fetch(`${window.ENV.PUBLIC_NEST_API_URL}/products/product-tags`, { headers });
      if (!res.ok) throw new Error("Erreur serveur");
      const data = await res.json();
      setTags(data);
      setFilteredTags(data);
    } catch (err: any) {
      if (err.message.includes("401")) {
        localStorage.clear();
        alert("Session expirée");
        window.location.href = "/login";
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTags();
  }, []);

  // --- FILTRE ---
  useEffect(() => {
    setFilteredTags(
      tags.filter((t) =>
        t.value.toLowerCase().includes(search.toLowerCase())
      )
    );
  }, [search, tags]);

  // --- SAVE ---
  const handleSave = async () => {
    try {
      const url = editingId
        ? `${window.ENV.PUBLIC_NEST_API_URL}/product-tags/${editingId}`
        : `${window.ENV.PUBLIC_NEST_API_URL}/product-tags`;
      const method = editingId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers,
        body: JSON.stringify(form),
      });

      if (!res.ok) throw new Error("Erreur sauvegarde");

      await fetchTags();
      setForm({});
      setEditingId(null);
    } catch (err: any) {
      alert(err.message);
    }
  };

  // --- DELETE ---
  const handleDelete = async (id: string) => {
    if (!confirm("Supprimer ce tag ?")) return;
    try {
      const res = await fetch(`${window.ENV.PUBLIC_NEST_API_URL}/product-tags/${id}`, {
        method: "DELETE",
        headers,
      });
      if (!res.ok) throw new Error("Erreur suppression");
      await fetchTags();
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Tags de produits</h1>

      {/* Formulaire */}
      <div className="bg-white p-4 rounded shadow mb-6">
        <h2 className="text-lg font-semibold mb-2">
          {editingId ? "Modifier le tag" : "Créer un tag"}
        </h2>
        <div className="space-y-4">
          <input
            type="text"
            placeholder="Valeur (unique)"
            value={form.value || ""}
            onChange={(e) => setForm({ ...form, value: e.target.value })}
            className="w-full border rounded px-3 py-2"
            required
          />
       
        </div>
        <button
          onClick={handleSave}
          className="mt-4 bg-orange-500 text-white px-4 py-2 rounded"
        >
          {editingId ? "Mettre à jour" : "Créer"}
        </button>
        {editingId && (
          <button
            onClick={() => {
              setForm({});
              setEditingId(null);
            }}
            className="ml-2 bg-gray-300 px-4 py-2 rounded"
          >
            Annuler
          </button>
        )}
      </div>

      {/* Recherche */}
      <input
        type="text"
        placeholder="Rechercher un tag..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="mb-4 border rounded px-3 py-2 w-full md:w-1/3"
      />

      {/* Liste */}
      {loading ? (
        <p>Chargement...</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white rounded shadow">
            <thead>
              <tr>
                <th className="px-4 py-2">Valeur</th>
                <th className="px-4 py-2">Produits</th>
                <th className="px-4 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredTags.map((t) => (
                <tr key={t.id}>
                  <td className="px-4 py-2">{t.value}</td>
                  <td className="px-4 py-2">{t.products?.length || 0}</td>
                  <td className="px-4 py-2 space-x-2">
                    <button
                      onClick={() => {
                        setEditingId(t.id);
                        setForm({
                          value: t.value,
                          metadata: t.metadata,
                        });
                      }}
                      className="text-blue-600 underline"
                    >
                      Modifier
                    </button>
                    <button
                      onClick={() => handleDelete(t.id)}
                      className="text-red-600 underline"
                    >
                      Supprimer
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}