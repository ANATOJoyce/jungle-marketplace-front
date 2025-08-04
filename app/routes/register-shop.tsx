import { useState } from "react";
import { FormInput } from "~/components/FormInput";
import { Button } from "~/components/ui/Button";
import { useNavigate } from "@remix-run/react";

export default function RegisterShop() {
  const navigate = useNavigate();

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const [formValues, setFormValues] = useState({
    name: "",
    default_sales_channel_id: "",
    default_region_id: "",
    metadata: "",
    owner: "", // champ manuel (plus besoin de AuthContext)
  });

  const regionOptions = [
    { value: "region1", label: "Région Paris" },
    { value: "region2", label: "Région Lyon" },
  ];

  const salesChannelOptions = [
    { value: "online", label: "Boutique en ligne" },
    { value: "physical", label: "Magasin physique" },
  ];

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    let metadata;
    try {
      metadata = formValues.metadata
        ? JSON.parse(formValues.metadata)
        : undefined;
    } catch {
      setError("Le champ métadonnées n'est pas un JSON valide.");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(
        `${process.env.PUBLIC_NEST_API_URL || "http://localhost:3000"}/store/create-shop`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: formValues.name,
            default_sales_channel_id: formValues.default_sales_channel_id,
            default_region_id: formValues.default_region_id,
            owner: formValues.owner || "anonymous", // fallback si vide
            metadata,
          }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Erreur lors de la création.");
        setLoading(false);
        return;
      }

      // ✅ Succès
      navigate("/dashboard?success=Boutique créée avec succès");
    } catch (err) {
      setError("Erreur réseau ou serveur.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Créer votre boutique</h1>

      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <FormInput
          label="Nom de la boutique"
          name="name"
          required
          placeholder="Ma Boutique"
          value={formValues.name}
          onChange={handleChange}
        />

        <FormInput
          label="Canal de vente principal"
          name="default_sales_channel_id"
          type="select"
          options={salesChannelOptions}
          value={formValues.default_sales_channel_id}
          onChange={handleChange}
        />

        <FormInput
          label="Région principale"
          name="default_region_id"
          type="select"
          options={regionOptions}
          value={formValues.default_region_id}
          onChange={handleChange}
        />

        <FormInput
          label="Métadonnées (JSON)"
          name="metadata"
          placeholder='{"theme": "clair", "currency": "EUR"}'
          value={formValues.metadata}
          onChange={handleChange}
        />

        <FormInput
          label="Identifiant du propriétaire (owner)"
          name="owner"
          required
          placeholder="ex: user-id-123"
          value={formValues.owner}
          onChange={handleChange}
        />

        <div className="flex gap-4 pt-4">
          <Button type="button" variant="secondary" onClick={() => navigate(-1)}>
            Retour
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? "Création..." : "Créer la boutique"}
          </Button>
        </div>
      </form>
    </div>
  );
}
