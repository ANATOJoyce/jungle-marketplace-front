import { useState } from "react";



export type Variant = {
  _id: string;
  size: string;
  color: string;
  price: number;
  stock: number;
  productId: string;
};

export type ActionData = {
  error?: string;
};

type DeleteVariantPageProps = {
  loaderData: Variant;
  actionData?: ActionData;
  onDelete: (id: string) => void;
  onCancel?: () => void;
};

export async function loader(variantId: string, token: string): Promise<Variant> {
  const res = await fetch(`${process.env.NEST_API_URL}/variants/${variantId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Échec récupération variante");
  return res.json();
}

export async function action(variantId: string, token: string): Promise<ActionData | null> {
  const res = await fetch(`${process.env.NEST_API_URL}/variants/${variantId}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) return { error: "Échec de la suppression" };
  return null;
}


export default function DeleteVariantPage({ loaderData, actionData, onDelete, onCancel }: DeleteVariantPageProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(actionData?.error || null);

  const handleDelete = async () => {
    if (!confirm(`Voulez-vous supprimer ${loaderData.size} / ${loaderData.color} ?`)) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/products/${loaderData.productId}/variants/${loaderData._id}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Échec de la suppression");
      onDelete(loaderData._id);
    } catch (err: any) {
      setError(err.message || "Erreur inconnue");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-6 p-6 border rounded shadow bg-white">
      <h2 className="text-xl font-bold mb-4 text-red-600">Supprimer la variante</h2>
      {error && <p className="text-red-500 mb-2">{error}</p>}

      <p className="mb-4">Êtes-vous sûr de vouloir supprimer la variante <strong>{loaderData.size} / {loaderData.color}</strong> ?</p>

      <div className="flex gap-2">
        <button onClick={handleDelete} disabled={loading} className="flex-1 py-2 px-4 bg-red-500 text-white rounded hover:bg-red-600">
          {loading ? "Suppression..." : "Supprimer"}
        </button>
        {onCancel && <button onClick={onCancel} className="flex-1 py-2 px-4 border rounded">Annuler</button>}
      </div>
    </div>
  );
}
