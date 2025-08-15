'use client';

import { useState } from 'react';
import { useLoaderData } from '@remix-run/react';
import type { loader as pageLoader } from '~/routes/loader'; // chemin correct du loader

type Props = {
  defaultValues: any;
  onNext: (data: any) => void;
  onBack: () => void;
};

export default function OrganizationForm({ defaultValues, onNext, onBack }: Props) {
  const { types, tags: allTags, categories: allCategories, collections } = useLoaderData<typeof pageLoader>();

  // Utilisation des valeurs par défaut si présentes, sinon une chaîne vide ou tableau vide
  const [type, setType] = useState(defaultValues.type || '');
  const [tags, setTags] = useState<string[]>(defaultValues.tags || []);
  const [categories, setCategories] = useState<string[]>(defaultValues.categories || []);
  const [collection, setCollection] = useState(defaultValues.collection || '');

  // Toggle pour ajouter/retirer un tag
  const toggleTag = (id: string) => {
    setTags((prev) => 
      prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]
    );
  };

  // Toggle pour ajouter/retirer une catégorie
  const toggleCategory = (id: string) => {
    setCategories((prev) => 
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  };

  // Soumettre le formulaire
  const handleSubmit = () => {
    onNext({ type, tags, categories, collection });
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Organisation du produit</h2>

      {/* Type */}
      <div>
        <label className="block text-sm font-medium mb-1">Type</label>
        <select
          value={type}
          onChange={(e) => setType(e.target.value)}
          className="w-full border p-2 rounded"
        >
          <option value="">Sélectionnez un type</option>
          {types.map((t: any) => (
            <option key={t._id} value={t._id}>
              {t.name}
            </option>
          ))}
        </select>
      </div>

      {/* Collection */}
      <div>
        <label className="block text-sm font-medium mb-1">Collection</label>
        <select
          value={collection}
          onChange={(e) => setCollection(e.target.value)}
          className="w-full border p-2 rounded"
        >
          <option value="">Sélectionnez une collection</option>
          {collections.map((c: any) => (
            <option key={c._id} value={c._id}>
              {c.title}
            </option>
          ))}
        </select>
      </div>

      {/* Tags */}
      <div>
        <label className="block text-sm font-medium mb-1">Tags</label>
        <div className="flex flex-wrap gap-2">
          {allTags.map((tag: any) => (
            <button
              key={tag._id}
              type="button"
              onClick={() => toggleTag(tag._id)}
              className={`px-3 py-1 border rounded-full text-sm ${
                tags.includes(tag._id) ? 'bg-blue-600 text-white' : 'bg-gray-100'
              }`}
            >
              {tag.name}
            </button>
          ))}
        </div>
      </div>

      {/* Catégories */}
      <div>
        <label className="block text-sm font-medium mb-1">Catégories</label>
        <div className="flex flex-wrap gap-2">
          {allCategories.map((cat: any) => (
            <button
              key={cat._id}
              type="button"
              onClick={() => toggleCategory(cat._id)}
              className={`px-3 py-1 border rounded-full text-sm ${
                categories.includes(cat._id) ? 'bg-green-600 text-white' : 'bg-gray-100'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Boutons de navigation */}
      <div className="flex justify-between mt-6">
        <button
          type="button"
          onClick={onBack}
          className="bg-gray-300 text-gray-700 px-4 py-2 rounded"
        >
          Retour
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Suivant
        </button>
      </div>
    </div>
  );
}
