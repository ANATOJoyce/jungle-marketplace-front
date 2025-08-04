import { useEffect, useState } from "react";
import { json, LoaderFunction } from "@remix-run/node";
import { useLoaderData, useFetcher } from "@remix-run/react";

type Region = {
  id: string;
  name: string;
  currency_code: string;
  automatic_taxes: boolean;
  metadata?: any;
  deleted?: boolean;
};

// --- LOADER (serveur) ---
export const loader: LoaderFunction = async () => {
  // Pas d'appel API ici, on le fait côté client avec localStorage
  return json([]);
};

// --- COMPOSANT PRINCIPAL ---
export default function RegionPage() {
  const [regions, setRegions] = useState<Region[]>([]);
  const [filteredRegions, setFilteredRegions] = useState<Region[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState<Partial<Region>>({});
  const [editingId, setEditingId] = useState<string | null>(null);

  const token = typeof window !== "undefined" ? localStorage.getItem("authToken") : null;

  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };

  // --- FETCH REGIONS ---
  const fetchRegions = async () => {
    try {
      const res = await fetch(`${window.ENV.PUBLIC_NEST_API_URL}/regions`, { headers });
      if (!res.ok) throw new Error("Erreur serveur");
      const data = await res.json();
      setRegions(data);
      setFilteredRegions(data);
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
    fetchRegions();
  }, []);

  // --- FILTRE ---
  useEffect(() => {
    setFilteredRegions(
      regions.filter((r) =>
        r.name.toLowerCase().includes(search.toLowerCase())
      )
    );
  }, [search, regions]);

  // --- CREATE / UPDATE ---
  const handleSave = async () => {
    try {
      const url = editingId
        ? `${window.ENV.PUBLIC_NEST_API_URL}/regions/${editingId}`
        : `${window.ENV.PUBLIC_NEST_API_URL}/regions`;
      const method = editingId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers,
        body: JSON.stringify(form),
      });

      if (!res.ok) throw new Error("Erreur lors de la sauvegarde");

      await fetchRegions();
      setForm({});
      setEditingId(null);
    } catch (err: any) {
      alert(err.message);
    }
  };

  // --- DELETE / RESTORE ---
  const handleDelete = async (id: string, soft = true) => {
    try {
      const url = soft
        ? `${window.ENV.PUBLIC_NEST_API_URL}/regions/${id}/soft-delete`
        : `${window.ENV.PUBLIC_NEST_API_URL}/regions/${id}`;
      const method = soft ? "PATCH" : "DELETE";

      const res = await fetch(url, { method, headers });
      if (!res.ok) throw new Error("Erreur suppression");

      await fetchRegions();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleRestore = async (id: string) => {
    try {
      const res = await fetch(
        `${window.ENV.PUBLIC_NEST_API_URL}/regions/${id}/restore`,
        { method: "PATCH", headers }
      );
      if (!res.ok) throw new Error("Erreur restauration");
      await fetchRegions();
    } catch (err: any) {
      alert(err.message);
    }
  };

  // --- RENDER ---
  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Gestion des Régions</h1>

      {/* Formulaire */}
      <div className="bg-white p-4 rounded shadow mb-6">
        <h2 className="text-lg font-semibold mb-2">
          {editingId ? "Modifier la région" : "Créer une région"}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            type="text"
            placeholder="Nom"
            value={form.name || ""}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="border rounded px-3 py-2"
          />
          <input
            type="text"
            placeholder="Code devise (ex: EUR)"
            value={form.currency_code || ""}
            onChange={(e) => setForm({ ...form, currency_code: e.target.value })}
            className="border rounded px-3 py-2"
          />
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={form.automatic_taxes || false}
              onChange={(e) =>
                setForm({ ...form, automatic_taxes: e.target.checked })
              }
            />
            Taxes automatiques
          </label>
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
        placeholder="Rechercher une région..."
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
                <th className="px-4 py-2">Nom</th>
                <th className="px-4 py-2">Devise</th>
                <th className="px-4 py-2">Taxes auto</th>
                <th className="px-4 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredRegions.map((r) => (
                <tr key={r.id} className={r.deleted ? "bg-gray-200" : ""}>
                  <td className="px-4 py-2">{r.name}</td>
                  <td className="px-4 py-2">{r.currency_code}</td>
                  <td className="px-4 py-2">{r.automatic_taxes ? "Oui" : "Non"}</td>
                  <td className="px-4 py-2 space-x-2">
                    {!r.deleted && (
                      <>
                        <button
                          onClick={() => {
                            setEditingId(r.id);
                            setForm(r);
                          }}
                          className="text-blue-600 underline"
                        >
                          Modifier
                        </button>
                        <button
                          onClick={() => handleDelete(r.id)}
                          className="text-red-600 underline"
                        >
                          Supprimer
                        </button>
                      </>
                    )}
                    {r.deleted && (
                      <button
                        onClick={() => handleRestore(r.id)}
                        className="text-green-600 underline"
                      >
                        Restaurer
                      </button>
                    )}
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