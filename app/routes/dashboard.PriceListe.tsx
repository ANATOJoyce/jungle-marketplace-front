import {
  PlusCircle,
  Search,
  Store,
  Pencil,
  Trash2,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";
import { useEffect, useState } from "react";
import { json, type LoaderFunction } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import type { SalesChannel } from "~/types/sales-channel";
import { getSession } from "~/utils/session.server";

export const loader: LoaderFunction = async ({ request }) => {
  const session = await getSession(request.headers.get("Cookie"));
  const token = session.get("authToken");
  return json({ token });
};

export default function SalesChannelsPage() {
  const { token } = useLoaderData<typeof loader>();

  const [channels, setChannels] = useState<SalesChannel[]>([]);
  const [filteredChannels, setFilteredChannels] = useState<SalesChannel[]>([]);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState<Partial<SalesChannel>>({});
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };

  const fetchChannels = async () => {
    try {
      const res = await fetch(`${window.ENV.PUBLIC_NEST_API_URL}/sales-channel`, {
        headers,
      });
      if (!res.ok) throw new Error("Erreur serveur");
      const data = await res.json();
      setChannels(data);
      setFilteredChannels(data);
    } catch (err: any) {
      alert("Erreur lors du chargement");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChannels();
  }, []);

  useEffect(() => {
    setFilteredChannels(
      channels.filter(
        (c) =>
          c.name.toLowerCase().includes(search.toLowerCase()) ||
          c.description?.toLowerCase().includes(search.toLowerCase())
      )
    );
  }, [search, channels]);

  const handleSave = async () => {
    try {
      const url = editingId
        ? `${window.ENV.PUBLIC_NEST_API_URL}/sales-channel/${editingId}`
        : `${window.ENV.PUBLIC_NEST_API_URL}/sales-channel`;
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

  const toggleDisable = async (id: string, is_disabled: boolean) => {
    try {
      const res = await fetch(
        `${window.ENV.PUBLIC_NEST_API_URL}/sales-channel/${id}/toggle-disable`,
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

  const handleDelete = async (id: string) => {
    if (!confirm("Supprimer définitivement ?")) return;
    try {
      const res = await fetch(`${window.ENV.PUBLIC_NEST_API_URL}/sales-channel/${id}`, {
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
    <div className="min-h-screen bg-brand p-6">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-brand bg-clip-text text-transparent mb-2">
            Canaux de Vente
          </h1>
          <p className="text-gray-600">Gérez vos différents canaux de distribution</p>
        </div>

        {/* Formulaire */}
        <div className="bg-white rounded-2xl shadow-lg shadow-black-200/50 p-8 hover:shadow-xl hover:shadow-yellow-300/50 transition-all duration-300">
          <h2 className="text-2xl font-bold mb-6 flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-lg shadow-lg">
              <PlusCircle className="h-6 w-6 text-white" />
            </div>
            <span className="bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent">
              {editingId ? "Modifier un canal" : "Créer un canal"}
            </span>
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Nom du canal</label>
              <input
                placeholder="Ex: Site Web Principal"
                value={form.name || ""}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full px-4 py-3 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl shadow-md shadow-yellow-200/30 focus:shadow-lg focus:shadow-orange-300/40 outline-none transition-all duration-200 text-gray-800 placeholder-gray-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Code devise</label>
              <input
                placeholder="Ex: EUR, USD"
                value={form.currency_code || ""}
                onChange={(e) => setForm({ ...form, currency_code: e.target.value })}
                className="w-full px-4 py-3 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl shadow-md shadow-yellow-200/30 focus:shadow-lg focus:shadow-orange-300/40 outline-none transition-all duration-200 text-gray-800 placeholder-gray-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Région ID</label>
              <input
                placeholder="Ex: FR, EU, US"
                value={form.region_id || ""}
                onChange={(e) => setForm({ ...form, region_id: e.target.value })}
                className="w-full px-4 py-3 bg-brand rounded-xl shadow-md shadow-yellow-200/30 focus:shadow-lg focus:shadow-orange-300/40 outline-none transition-all duration-200 text-gray-800 placeholder-gray-500"
              />
            </div>
            

            
            <div className="col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
              <textarea
                placeholder="Description détaillée du canal de vente..."
                value={form.description || ""}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={3}
                className="w-full px-4 py-3 bg-brand rounded-xl shadow-md shadow-yellow-200/30 focus:shadow-lg focus:shadow-orange-300/40 outline-none transition-all duration-200 text-gray-800 placeholder-gray-500 resize-none"
              />
            </div>
          </div>
          
          <div className="mt-8 flex gap-4">
            <button 
              onClick={handleSave}
              className="px-8 py-3 bg-brand text-white font-bold rounded-xl shadow-lg shadow-yellow-300/40 hover:shadow-xl hover:shadow-orange-400/50 hover:from-yellow-500 hover:to-orange-600 transition-all duration-200 transform hover:scale-105"
            >
              {editingId ? "Mettre à jour" : "Créer le canal"}
            </button>
            {editingId && (
              <button
                onClick={() => {
                  setEditingId(null);
                  setForm({});
                }}
                className="px-6 py-3 bg-gray-100 text-gray-700 font-semibold rounded-xl shadow-md hover:shadow-lg hover:bg-gray-200 transition-all duration-200"
              >
                Annuler
              </button>
            )}
          </div>
        </div>

        {/* Barre de recherche */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            placeholder="Rechercher un canal de vente..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-4 bg-white rounded-2xl shadow-lg shadow-yellow-200/50 focus:shadow-xl focus:shadow-orange-300/50 outline-none transition-all duration-200 text-gray-800 placeholder-gray-500"
          />
        </div>

        {/* Table des canaux */}
        <div className="bg-white rounded-2xl shadow-xl shadow-yellow-200/50 overflow-hidden">
          <div className="bg-brand px-8 py-6">
            <h3 className="text-xl font-bold text-white flex items-center space-x-2">
              <Store className="h-6 w-6" />
              <span>Liste des canaux de vente</span>
            </h3>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gradient-to-r from-yellow-50 to-orange-50">
                  <th className="px-6 py-4 text-left font-bold text-gray-700">Nom</th>
                  <th className="px-6 py-4 text-left font-bold text-gray-700">Description</th>
                  <th className="px-6 py-4 text-left font-bold text-gray-700">Région</th>
                  <th className="px-6 py-4 text-left font-bold text-gray-700">Devise</th>
                  <th className="px-6 py-4 text-left font-bold text-gray-700">Statut</th>
                  <th className="px-6 py-4 text-left font-bold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={6} className="text-center p-8 text-gray-500">
                      <div className="flex items-center justify-center space-x-2">
                        <div className="w-4 h-4 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full animate-pulse"></div>
                        <span>Chargement...</span>
                      </div>
                    </td>
                  </tr>
                ) : filteredChannels.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center p-8 text-gray-500">
                      Aucun canal trouvé
                    </td>
                  </tr>
                ) : (
                  filteredChannels.map((c, index) => (
                    <tr 
                      key={c.id} 
                      className={`hover:bg-gradient-to-r hover:from-yellow-50 hover:to-orange-50 transition-all duration-200 ${
                        index % 2 === 0 ? 'bg-gray-50/30' : 'bg-white'
                      }`}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-3">
                          <div className={`w-3 h-3 rounded-full ${c.is_default ? 'bg-gradient-to-r from-yellow-400 to-orange-500 shadow-lg' : 'bg-gray-300'}`}></div>
                          <span className="font-semibold text-gray-800">{c.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-600">
                        {c.description || "—"}
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-3 py-1 bg-gradient-to-r from-yellow-100 to-orange-100 text-gray-700 rounded-lg text-sm font-medium shadow-sm">
                          {c.region_id || "—"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-3 py-1 bg-gradient-to-r from-orange-100 to-yellow-100 text-gray-700 rounded-lg text-sm font-medium shadow-sm">
                          {c.currency_code || "—"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {c.is_disabled ? (
                          <span className="px-4 py-2 bg-red-100 text-red-700 rounded-xl text-sm font-semibold shadow-sm">
                            Désactivé
                          </span>
                        ) : (
                          <span className="px-4 py-2 bg-green-100 text-green-700 rounded-xl text-sm font-semibold shadow-sm">
                            Actif
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-3">
                          <button 
                            onClick={() => toggleDisable(c.id, !c.is_disabled)}
                            className={`p-2 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 transform hover:scale-105 ${
                              c.is_disabled 
                                ? 'bg-gradient-to-r from-green-400 to-green-500 text-white hover:from-green-500 hover:to-green-600' 
                                : 'bg-gradient-to-r from-gray-400 to-gray-500 text-white hover:from-gray-500 hover:to-gray-600'
                            }`}
                            title={c.is_disabled ? 'Activer' : 'Désactiver'}
                          >
                            {c.is_disabled ? <ToggleRight className="h-4 w-4" /> : <ToggleLeft className="h-4 w-4" />}
                          </button>
                          
                          <button 
                            onClick={() => { 
                              setEditingId(c.id); 
                              setForm(c); 
                            }}
                            className="p-2 bg-gradient-to-r from-blue-400 to-blue-500 text-white rounded-lg shadow-md hover:shadow-lg hover:from-blue-500 hover:to-blue-600 transition-all duration-200 transform hover:scale-105"
                            title="Modifier"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                          
                          <button 
                            onClick={() => handleDelete(c.id)}
                            className="p-2 bg-gradient-to-r from-red-400 to-red-500 text-white rounded-lg shadow-md hover:shadow-lg hover:from-red-500 hover:to-red-600 transition-all duration-200 transform hover:scale-105"
                            title="Supprimer"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          
          {/* Statistiques en bas */}
          <div className="bg-gradient-to-r from-yellow-50 to-orange-50 px-8 py-4">
            <div className="flex items-center justify-between text-sm text-gray-600">
              <span>
                Total: <span className="font-semibold text-gray-800">{channels.length}</span> canaux
              </span>
              <span>
                Actifs: <span className="font-semibold text-green-600">{channels.filter(c => !c.is_disabled).length}</span> | 
                Désactivés: <span className="font-semibold text-red-600">{channels.filter(c => c.is_disabled).length}</span>
              </span>
            </div>
          </div>
        </div>
        
        {/* Message d'aide */}
        <div className="bg-brand rounded-2xl p-6 shadow-lg shadow-yellow-200/30">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0 mt-1">
              <svg className="h-5 w-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
            </div>
            <div>
              <h4 className="font-semibold text-gray-800 mb-1">Conseils d'utilisation</h4>
              <p className="text-gray-600 text-sm">
                • Définissez un canal par défaut pour vos ventes principales<br/>
                • Utilisez des codes région cohérents (FR, EU, US, etc.)<br/>
                • Désactivez temporairement les canaux en maintenance plutôt que de les supprimer
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}