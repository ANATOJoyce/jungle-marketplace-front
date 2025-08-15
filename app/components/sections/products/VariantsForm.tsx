'use client';

import { useState } from 'react';

type Props = {
  defaultValues: any;
  onNext: (data: any) => void;
  onBack: () => void;
};

type Option = {
  title: string;
  values: string[];
};

type Variant = {
  title: string;
  options: string[];
  sku?: string;
  price?: number;
  quantity?: number;
};

function cartesianProduct(arrays: string[][]): string[][] {
  return arrays.reduce(
    (acc, curr) =>
      acc
        .map((x) => curr.map((y) => [...x, y]))
        .reduce((a, b) => a.concat(b), []),
    [[]] as string[][]
  );
}

export default function VariantsForm({ defaultValues, onNext, onBack }: Props) {
  const [options, setOptions] = useState<Option[]>(defaultValues.options || []);
  const [variants, setVariants] = useState<Variant[]>(defaultValues.variants || []);

  const [newOptionName, setNewOptionName] = useState('');
  const [newOptionValues, setNewOptionValues] = useState('');

  const addOption = () => {
    if (!newOptionName || !newOptionValues) return;

    const values = newOptionValues.split(',').map((v) => v.trim()).filter(Boolean);
    const updatedOptions = [...options, { title: newOptionName, values }];
    setOptions(updatedOptions);
    setNewOptionName('');
    setNewOptionValues('');

    // Génère automatiquement les variantes
    const combos = cartesianProduct(updatedOptions.map((opt) => opt.values));
    const newVariants = combos.map((combo) => ({
      title: combo.join(' / '),
      options: combo,
    }));

    setVariants(newVariants);
  };

  const updateVariant = (index: number, field: string, value: any) => {
    const updated = [...variants];
    (updated[index] as any)[field] = value;
    setVariants(updated);
  };

  const handleSubmit = () => {
    onNext({ options, variants });
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Options & Variantes</h2>

      {/* Création d'une option */}
      <div className="flex gap-2">
        <input
          type="text"
          placeholder="Nom de l'option (ex: Taille)"
          value={newOptionName}
          onChange={(e) => setNewOptionName(e.target.value)}
          className="flex-1 border p-2 rounded"
        />
        <input
          type="text"
          placeholder="Valeurs séparées par des virgules (ex: S,M,L)"
          value={newOptionValues}
          onChange={(e) => setNewOptionValues(e.target.value)}
          className="flex-1 border p-2 rounded"
        />
        <button
          type="button"
          onClick={addOption}
          className="bg-green-600 text-white px-4 py-2 rounded"
        >
          Ajouter option
        </button>
      </div>

      {/* Liste des variantes */}
      {variants.length > 0 && (
        <div className="overflow-auto border rounded mt-4">
          <table className="w-full text-sm">
            <thead className="bg-gray-100 text-left">
              <tr>
                <th className="p-2">Variante</th>
                <th className="p-2">SKU</th>
                <th className="p-2">Prix (€)</th>
                <th className="p-2">Quantité</th>
              </tr>
            </thead>
            <tbody>
              {variants.map((variant, idx) => (
                <tr key={idx} className="border-t">
                  <td className="p-2">{variant.title}</td>
                  <td className="p-2">
                    <input
                      type="text"
                      className="border p-1 rounded w-full"
                      value={variant.sku || ''}
                      onChange={(e) => updateVariant(idx, 'sku', e.target.value)}
                    />
                  </td>
                  <td className="p-2">
                    <input
                      type="number"
                      className="border p-1 rounded w-full"
                      value={variant.price || ''}
                      onChange={(e) => updateVariant(idx, 'price', parseFloat(e.target.value))}
                    />
                  </td>
                  <td className="p-2">
                    <input
                      type="number"
                      className="border p-1 rounded w-full"
                      value={variant.quantity || ''}
                      onChange={(e) => updateVariant(idx, 'quantity', parseInt(e.target.value))}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

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
