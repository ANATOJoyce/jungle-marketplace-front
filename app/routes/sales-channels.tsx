import { useEffect, useState } from "react";
import type { LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";

type SalesChannel = {
  id: string;
  name: string;
  description?: string;
  is_disabled: boolean;
  metadata?: Record<string, unknown>;
};

export const loader: LoaderFunction = async () => {
  return json([]);
};

export default function SalesChannelsPage() {
  const [channels, setChannels] = useState<SalesChannel[]>([]);
  const [filteredChannels, setFilteredChannels] = useState<SalesChannel[]>([]);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState<Partial<SalesChannel>>({});
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const token = typeof window !== "undefined" ? localStorage.getItem("authToken") : null;
  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };

  // --- FETCH CHANNELS ---
  const fetchChannels = async () => {
    try {
      const res = await fetch(`${window.ENV.PUBLIC_NEST_API_URL}/sales-channels`, { headers });
      if (!res.ok) throw new Error("Erreur serveur");
      const data = await res.json();
      setChannels(data);
      setFilteredChannels(data);
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
    fetchChannels();
  }, []);

  // --- FILTRE ---
  useEffect(() => {
    setFilteredChannels(
      channels.filter(
        (c) =>
          c.name.toLowerCase().includes(search.toLowerCase()) ||
          c.description?.toLowerCase().includes(search.toLowerCase())
      )
    );
  }, [search, channels]);

  // --- CREATE / UPDATE ---
  const handleSave = async () => {
    try {
      const url = editingId
        ? `${window.ENV.PUBLIC_NEST_API_URL}/sales-channels/${editingId}`
        : `${window.ENV.PUBLIC_NEST_API_URL}/sales-channels`;
      const method = editingId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers,
        body: JSON.stringify(form),
      });

      if (!res.ok) throw new Error("Erreur sauvegarde");

      await fetchChannels();
      setForm({});
      setEditingId(null);
    } catch (err: any) {
      alert(err.message);
    }
  };

  // --- TOGGLE DISABLE ---
  const toggleDisable = async (id: string, is_disabled: boolean) => {
    try {
      const res = await fetch(
        `${window.ENV.PUBLIC_NEST_API_URL}/sales-channels/${id}/toggle-disable`,
        {
          method: "PATCH",
          headers,
          body: JSON.stringify({ is_disabled }),
        }
      );
      if (!res.ok) throw new Error("Erreur mise à jour");
      await fetchChannels();
    } catch (err: any) {
      alert(err.message);
    }
  };

  // --- DELETE ---
  const handleDelete = async (id: string) => {
    if (!confirm("Supprimer définitivement ?")) return;
    try {
      const res = await fetch(`${window.ENV.PUBLIC_NEST_API_URL}/sales-channels/${id}`, {
        method: "DELETE",
        headers,
      });
      if (!res.ok) throw new Error("Erreur suppression");
      await fetchChannels();
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Canaux de vente</h1>

      {/* Formulaire */}
      <div className="bg-white p-4 rounded shadow mb-6">
        <h2 className="text-lg font-semibold mb-2">
          {editingId ? "Modifier le canal" : "Créer un canal"}
        </h2>
        <div className="space-y-4">
          <input
            type="text"
            placeholder="Nom"
            value={form.name || ""}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full border rounded px-3 py-2"
            required
          />
          <textarea
            placeholder="Description (optionnel)"
            value={form.description || ""}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="w-full border rounded px-3 py-2"
            rows={3}
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
        placeholder="Rechercher..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="mb-4 border rounded px-3 py-2 w-full md:w-1/3"
      />

      {/* Tableau */}
      {loading ? (
        <p>Chargement...</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white rounded shadow">
            <thead>
              <tr>
                <th className="px-4 py-2">Nom</th>
                <th className="px-4 py-2">Description</th>
                <th className="px-4 py-2">Statut</th>
                <th className="px-4 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredChannels.map((c) => (
                <tr key={c.id} className={c.is_disabled ? "bg-gray-200" : ""}>
                  <td className="px-4 py-2">{c.name}</td>
                  <td className="px-4 py-2">{c.description}</td>
                  <td className="px-4 py-2">
                    {c.is_disabled ? "Désactivé" : "Actif"}
                  </td>
                  <td className="px-4 py-2 space-x-2">
                    <button
                      onClick={() => toggleDisable(c.id, !c.is_disabled)}
                      className={`underline ${c.is_disabled ? "text-green-600" : "text-yellow-600"}`}
                    >
                      {c.is_disabled ? "Activer" : "Désactiver"}
                    </button>
                    <button
                      onClick={() => {
                        setEditingId(c.id);
                        setForm(c);
                      }}
                      className="text-blue-600 underline"
                    >
                      Modifier
                    </button>
                    <button
                      onClick={() => handleDelete(c.id)}
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