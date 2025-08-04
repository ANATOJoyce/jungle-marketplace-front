import { useEffect, useState } from "react";
import { useAuth } from "~/hooks/useAuth";
import { useNavigate } from "@remix-run/react";

export default function SettingsPage() {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
  });

  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    const fetchUser = async () => {
      const token = localStorage.getItem("access_token");
      try {
        const res = await fetch(`${window.ENV.PUBLIC_NEST_API_URL}/auth/profile`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) throw new Error("Erreur lors de la récupération du profil");

        const data = await res.json();
        setFormData({
          first_name: data.first_name || "",
          last_name: data.last_name || "",
          email: data.email || "",
          phone: data.phone || "",
        });
      } catch (err) {
        setError("Erreur de chargement.");
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [isAuthenticated, navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem("access_token");

    try {
      const res = await fetch(`${window.ENV.PUBLIC_NEST_API_URL}/auth/profile`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error("Échec de la mise à jour");

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError("Impossible de sauvegarder les modifications.");
    }
  };

  if (loading) return <p className="p-4 text-yellow-600">Chargement des informations...</p>;

  return (
    <div className="max-w-2xl space-y-6">
      <h2 className="text-2xl font-semibold text-orange-600">Mon profil</h2>

      {error && <p className="text-red-500 font-medium">{error}</p>}
      {success && <p className="text-green-600 font-medium">✔️ Modifications enregistrées</p>}

      <form
        onSubmit={handleSubmit}
        className="bg-white border border-yellow-300 p-6 rounded-xl shadow space-y-6"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Prénom</label>
            <input
              name="first_name"
              value={formData.first_name}
              onChange={handleChange}
              className="w-full border border-yellow-400 rounded px-3 py-2"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Nom</label>
            <input
              name="last_name"
              value={formData.last_name}
              onChange={handleChange}
              className="w-full border border-yellow-400 rounded px-3 py-2"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Email</label>
          <input
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            className="w-full border border-yellow-400 rounded px-3 py-2"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Téléphone</label>
          <input
            name="phone"
            type="tel"
            value={formData.phone}
            onChange={handleChange}
            className="w-full border border-yellow-400 rounded px-3 py-2"
          />
        </div>

        <div className="pt-4">
          <button
            type="submit"
            className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded font-semibold shadow"
          >
            Enregistrer les modifications
          </button>
        </div>
      </form>
    </div>
  );
}
