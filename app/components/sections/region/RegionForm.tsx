// src/components/regions/RegionForm.tsx
import { useState } from 'react';
import { Currency, Region } from '~/types/country';

interface RegionFormProps {
  initialData?: Partial<Region>;
  currencies: Currency[];
  onSubmit: (data: Partial<Region>) => Promise<void>;
  onCancel?: () => void;
  isLoading?: boolean;
}
export const RegionForm = ({
  initialData = {},
  currencies = [],
  onSubmit,
  onCancel,
  isLoading = false
}: RegionFormProps) => {
  const [formData, setFormData] = useState<Partial<Region>>(initialData);
  const [localErrors, setLocalErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const errors: Record<string, string> = {};
    if (!formData.name) errors.name = 'Le nom est requis';
    if (!formData.currency_code) errors.currencyCode = 'La devise est requise';
    setLocalErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      await onSubmit(formData);
    } catch (err) {
      setLocalErrors({
        form: err instanceof Error ? err.message : 'Erreur inconnue'
      });
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold mb-4">
        {initialData?.id ? 'Modifier la région' : 'Créer une région'}
      </h2>

      {localErrors.form && (
        <div className="mb-4 text-red-500">{localErrors.form}</div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nom de la région *
          </label>
          <input
            type="text"
            value={formData.name || ''}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
            className={`w-full p-2 border rounded ${localErrors.name ? 'border-red-500' : 'border-gray-300'}`}
            disabled={isLoading}
          />
          {localErrors.name && <p className="mt-1 text-sm text-red-500">{localErrors.name}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Taux de taxe (%)
          </label>
          <input
            type="number"
            value={formData.tax_rate || ''}
            onChange={(e) => setFormData({...formData, tax_rate: Number(e.target.value)})}
            className="w-full p-2 border border-gray-300 rounded"
            min="0"
            max="100"
            step="0.1"
            disabled={isLoading}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Devise *
          </label>
          <select
            value={formData.currency_code || ''}
            onChange={(e) => setFormData({...formData, currency_code: e.target.value})}
            className={`w-full p-2 border rounded ${localErrors.currencyCode ? 'border-red-500' : 'border-gray-300'}`}
            disabled={isLoading}
          >
            <option value="">Sélectionnez une devise</option>
            {currencies.map((currency) => (
              <option key={currency.code} value={currency.code}>
                {currency.name} ({currency.symbol})
              </option>
            ))}
          </select>
          {localErrors.currencyCode && <p className="mt-1 text-sm text-red-500">{localErrors.currencyCode}</p>}
        </div>

        <div className="flex justify-end space-x-3 pt-4">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              disabled={isLoading}
              className="px-4 py-2 border rounded-md text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              Annuler
            </button>
          )}
          <button
            type="submit"
            disabled={isLoading}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {isLoading ? 'Envoi en cours...' : initialData?.id ? 'Mettre à jour' : 'Créer'}
          </button>
        </div>
      </form>
    </div>
  );
};