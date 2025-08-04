import { useState } from 'react';
import { Country, Region } from "~/types/country";

interface CountryFormProps {
  initialData?: Partial<Country>;
  regions: Region[];
  onSubmit: (data: Partial<Country>) => Promise<void>;
  onCancel?: () => void;
}

export function CountryForm({ 
  initialData = {}, 
  regions,
  onSubmit,
  onCancel
}: CountryFormProps) {
  const [form, setForm] = useState<Partial<Country>>(initialData);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(form);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-4 rounded shadow mb-6">
      <h2 className="text-lg font-semibold mb-2">
        {initialData?.id ? "Modifier le pays" : "Créer un pays"}
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Nom</label>
          <input
            type="text"
            value={form.name || ''}
            onChange={(e) => setForm({...form, name: e.target.value})}
            className="border rounded px-3 py-2 w-full"
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">ISO 2</label>
          <input
            type="text"
            value={form.iso_2 || ''}
            onChange={(e) => setForm({...form, iso_2: e.target.value})}
            className="border rounded px-3 py-2 w-full"
            required
            maxLength={2}
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">ISO 3</label>
          <input
            type="text"
            value={form.iso_3 || ''}
            onChange={(e) => setForm({...form, iso_3: e.target.value})}
            className="border rounded px-3 py-2 w-full"
            required
            maxLength={3}
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">Code numérique</label>
          <input
            type="text"
            value={form.num_code || ''}
            onChange={(e) => setForm({...form, num_code: e.target.value})}
            className="border rounded px-3 py-2 w-full"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">Nom affiché</label>
          <input
            type="text"
            value={form.display_name || ''}
            onChange={(e) => setForm({...form, display_name: e.target.value})}
            className="border rounded px-3 py-2 w-full"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">Région</label>
          <select
            value={form.region?.id || ''}
            onChange={(e) => {
              const region = regions.find(r => r.id === e.target.value);
              setForm({
                ...form,
                region: region ? { id: region.id, name: region.name } : undefined
              });
            }}
            className="border rounded px-3 py-2 w-full"
          >
            <option value="">-- Sélectionner --</option>
            {regions.map(region => (
              <option key={region.id} value={region.id}>
                {region.name}
              </option>
            ))}
          </select>
        </div>
      </div>
      
      <div className="flex mt-4">
        <button
          type="submit"
          className="bg-orange-500 text-white px-4 py-2 rounded"
        >
          {initialData?.id ? "Mettre à jour" : "Créer"}
        </button>
        
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="ml-2 bg-gray-300 px-4 py-2 rounded"
          >
            Annuler
          </button>
        )}
      </div>
    </form>
  );
}