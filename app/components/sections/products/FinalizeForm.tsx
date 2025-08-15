'use client';

import { useState } from 'react';
import { useNavigate } from '@remix-run/react'; // Remix-specific

type Props = {
  formData: any;
  onBack: () => void;
};

export default function FinalizeForm({ formData, onBack }: Props) {
  const navigate = useNavigate(); // Remix hook
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/products/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (data.ok) {
        navigate(`/dashboard/products/${data.productId}/edit`); //  Remix navigation
      } else {
        setError(data.error || 'Erreur lors de la création du produit');
        setLoading(false);
      }
    } catch (err) {
      setError('Erreur réseau');
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Finaliser la création</h2>

      <div className="bg-gray-100 p-4 rounded text-sm space-y-2">
        <p><strong>Nom :</strong> {formData.title}</p>
        <p><strong>Type :</strong> {formData.type || '—'}</p>
        <p><strong>Tags :</strong> {formData.tags?.length ? formData.tags.length : '—'}</p>
        <p><strong>Catégories :</strong> {formData.categories?.length ? formData.categories.length : '—'}</p>
        <p><strong>Variantes :</strong> {formData.variants?.length || 0}</p>
        <p><strong>Images :</strong> {formData.images?.length || 0}</p>
        <p><strong>Status :</strong> {formData.status}</p>
      </div>

      {error && <p className="text-red-600">{error}</p>}

      <div className="flex justify-between mt-6">
        <button
          type="button"
          onClick={onBack}
          className="bg-gray-300 text-gray-700 px-4 py-2 rounded"
          disabled={loading}
        >
          Retour
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          disabled={loading}
        >
          {loading ? 'Création...' : 'Créer le produit'}
        </button>
      </div>
    </div>
  );
}
