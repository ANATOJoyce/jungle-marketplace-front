import React, { useState, useEffect } from 'react';
import { Country } from '~/types/country';
import { Currency } from '~/types/currency';
import { Region } from '~/types/region';

interface RegionFormProps {
  initialData?: Partial<Region>;
  currencies: Currency[];
  onSubmit: (data: Partial<Region>) => void;
  onCancel: () => void;
}

export const RegionForm: React.FC<RegionFormProps> = ({ initialData, currencies, onSubmit, onCancel }) => {
  const [name, setName] = useState(initialData?.name || '');
  const [currencyCode, setCurrencyCode] = useState(initialData?.currency_code || '');
  const [automaticTaxes, setAutomaticTaxes] = useState(initialData?.automatic_taxes ?? true);

const [selectedCountries, setSelectedCountries] = useState<string[]>(
  initialData?.countries || [] // c’est un tableau d’IDs
);

  const [allCountries, setAllCountries] = useState<Country[]>([]);

  useEffect(() => {
    const fetchCountries = async () => {
      try {
        const res = await fetch('http://localhost:3000/regions/countries');
        const data = await res.json();
        console.log('Countries fetched:', data);
        setAllCountries(data);
      } catch (error) {
        console.error('Erreur lors du chargement des pays :', error);
      }
    };

    fetchCountries();
  }, []);
const handleSubmit = (e: React.FormEvent) => {
  e.preventDefault();

  const data: Partial<Region> = {
    id: initialData?.id,
    name,
    currency_code: currencyCode,
    automatic_taxes: automaticTaxes,
    countries: selectedCountries, //  envoyer un tableau d'IDs
  };

  onSubmit(data);
};


  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">Nom de la région</label>
        <input
          type="text"
          className="w-full border rounded px-3 py-2"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Devise</label>
        <select
          value={currencyCode}
          onChange={(e) => setCurrencyCode(e.target.value)}
          required
        >
          <option value="">-- Sélectionner une devise --</option>
          {currencies.map((cur) => (
            <option key={cur.code} value={cur.code}>
              {cur.name} ({cur.symbol})
            </option>
          ))}
        </select>
      </div>

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={automaticTaxes}
          onChange={(e) => setAutomaticTaxes(e.target.checked)}
          className="h-4 w-4"
        />
        <label>Appliquer automatiquement les taxes</label>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Pays associés</label>
        <select
          multiple
          value={selectedCountries}
          onChange={(e) =>
            setSelectedCountries(Array.from(e.target.selectedOptions, (option) => option.value))
          }
        >
          {allCountries.map((country) => (
            <option key={country.id} value={country.id}>
              {country.name}
            </option>
          ))}
        </select>
        <p className="text-sm text-gray-500 mt-1">
          Maintenez Ctrl (Windows) ou Cmd (Mac) pour sélectionner plusieurs pays
        </p>
      </div>

      <div className="flex justify-end gap-2">
        <button type="button" onClick={onCancel} className="px-4 py-2 bg-gray-300 rounded">
          Annuler
        </button>
        <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded">
          {initialData ? 'Mettre à jour' : 'Créer'}
        </button>
      </div>
    </form>
  );
};
