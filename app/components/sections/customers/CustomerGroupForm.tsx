import { useState } from "react";
import { Button } from "~/components/ui/Button";

interface CustomerGroupFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
  initialValues?: {
    name?: string;
    metadata?: string;
  };
}

export default function CustomerGroupForm({ 
  onSuccess, 
  onCancel,
  initialValues 
}: CustomerGroupFormProps) {
  const [name, setName] = useState(initialValues?.name || "");
  const [metadata, setMetadata] = useState(
    initialValues?.metadata 
      ? JSON.stringify(initialValues.metadata, null, 2) 
      : ""
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    let parsedMetadata: Record<string, unknown> | undefined;
    
    if (metadata.trim()) {
      try {
        parsedMetadata = JSON.parse(metadata);
      } catch (err) {
        setError("Format JSON invalide pour les métadonnées");
        setLoading(false);
        return;
      }
    }

    try {
      const res = await fetch(`${process.env.NEST_API_URL}/customer/customer-groups`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem('access_token')}`
        },
        body: JSON.stringify({ 
          name, 
          metadata: parsedMetadata 
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Échec de la création du groupe");
      }

      onSuccess?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur inconnue est survenue");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Nom du groupe *
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={loading}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Métadonnées (JSON optionnel)
        </label>
        <textarea
          rows={4}
          value={metadata}
          onChange={(e) => setMetadata(e.target.value)}
          placeholder='{ "type": "VIP" }'
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
          disabled={loading}
        />
        <p className="text-xs text-gray-500 mt-1">
          Format JSON valide. Laissez vide si non nécessaire.
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      <div className="flex justify-end gap-3 pt-2">
        {onCancel && (
          <Button
            type="reset"
            variant="secondary"
            onClick={onCancel}
            disabled={loading}
          >
            Annuler
          </Button>
        )}
        <Button
          type="submit"
          variant="primary"
          disabled={loading}
        >
          {loading ? (
            <span className="flex items-center">
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              En cours...
            </span>
          ) : (
            "Créer le groupe"
          )}
        </Button>
      </div>
    </form>
  );
}