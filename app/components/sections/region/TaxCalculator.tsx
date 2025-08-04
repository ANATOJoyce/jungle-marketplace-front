import { useState } from 'react';
import { Region } from '~/types/country';

interface TaxCalculatorProps {
  regions: Region[];
}

export function TaxCalculator({ regions }: TaxCalculatorProps) {
  const [selectedRegionId, setSelectedRegionId] = useState('');
  const [amount, setAmount] = useState('');
  const [result, setResult] = useState<{
    tax: number;
    total: number;
    rate: number;
  } | null>(null);

  const calculateTax = () => {
    const region = regions.find(r => r.id === selectedRegionId);
    if (!region || !region.tax_rate || !amount) return;

    const numericAmount = parseFloat(amount);
    const taxAmount = numericAmount * (region.tax_rate / 100);
    
    setResult({
      tax: taxAmount,
      total: numericAmount + taxAmount,
      rate: region.tax_rate
    });
  };

  return (
    <div className="bg-white p-4 rounded shadow mt-6">
      <h2 className="text-lg font-semibold mb-4">Calculateur de Taxes</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Région</label>
          <select
            value={selectedRegionId}
            onChange={(e) => setSelectedRegionId(e.target.value)}
            className="border rounded px-3 py-2 w-full"
          >
            <option value="">Sélectionner une région</option>
            {regions.map(region => (
              <option key={region.id} value={region.id}>
                {region.name}
              </option>
            ))}
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">Montant</label>
          <input 
            type="number" 
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="border rounded px-3 py-2 w-full" 
            placeholder="100.00" 
            min="0"
            step="0.01"
          />
        </div>
        
        <div className="flex items-end">
          <button 
            onClick={calculateTax}
            className="bg-orange-500 text-white px-4 py-2 rounded w-full"
          >
            Calculer
          </button>
        </div>
      </div>
      
      {result && (
        <div className="mt-4 p-3 bg-gray-50 rounded">
          <p className="font-medium">Résultat:</p>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li>Taux de taxe: {result.rate}%</li>
            <li>Montant des taxes: {result.tax.toFixed(2)}</li>
            <li>Total TTC: {result.total.toFixed(2)}</li>
          </ul>
        </div>
      )}
    </div>
  );
}