import React, { useState } from 'react';
import { 
  FiPackage, FiDollarSign, FiGlobe, FiLayers, FiCodesandbox, FiPlus, FiSave 
} from 'react-icons/fi';
import { Button } from '~/components/ui/Button';
import { Input } from '~/components/ui/Input';
import { Select } from '~/components/ui/Select';
import { Switch } from '~/components/ui/Switch';
import { Tabs } from '~/components/ui/Tabs';

interface Price {
  amount: string | number;
  currency: string;
  region: string | null;
}

interface Variant {
  title?: string;
  sku?: string;
  barcode?: string;
  ean?: string;
  upc?: string;
  allow_backorder?: boolean;
  manage_inventory?: boolean;
  hs_code?: string;
  origin_country?: string;
  mid_code?: string;
  material?: string;
  weight?: string | number;
  length?: string | number;
  height?: string | number;
  width?: string | number;
  variant_rank?: number;
  prices?: Price[];
  options?: unknown[];
  metadata?: Record<string, unknown>;
}

interface Currency {
  code: string;
  name?: string;
}

interface Region {
  id: string;
  name: string;
}

interface ProductVariantFormProps {
  variant?: Variant;
  currencies: Currency[];
  regions: Region[];
  onSave: (formData: Variant) => void;
  onCancel: () => void;
}

const ProductVariantForm: React.FC<ProductVariantFormProps> = ({ 
  variant = {}, 
  currencies, 
  regions, 
  onSave, 
  onCancel 
}) => {
  const [activeTab, setActiveTab] = useState<string>('general');
  const [formData, setFormData] = useState<Variant>({
    title: variant?.title || '',
    sku: variant?.sku || '',
    barcode: variant?.barcode || '',
    ean: variant?.ean || '',
    upc: variant?.upc || '',
    allow_backorder: variant?.allow_backorder || false,
    manage_inventory: variant?.manage_inventory ?? true,
    hs_code: variant?.hs_code || '',
    origin_country: variant?.origin_country || '',
    mid_code: variant?.mid_code || '',
    material: variant?.material || '',
    weight: variant?.weight || '',
    length: variant?.length || '',
    height: variant?.height || '',
    width: variant?.width || '',
    variant_rank: variant?.variant_rank || 0,
    prices: variant?.prices || [],
    options: variant?.options || [],
    metadata: variant?.metadata || {}
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handlePriceChange = (
    index: number, 
    field: keyof Price, 
    value: string | number | null
  ) => {
    const newPrices = [...(formData.prices || [])];
    if (newPrices[index]) {
      newPrices[index] = { ...newPrices[index], [field]: value };
      setFormData(prev => ({ ...prev, prices: newPrices }));
    }
  };

  const addNewPrice = () => {
    setFormData(prev => ({
      ...prev,
      prices: [...(prev.prices || []), { 
        amount: '', 
        currency: currencies[0]?.code || '', 
        region: null 
      }]
    }));
  };

  const tabs = [
    { id: 'general', label: 'Général', icon: <FiPackage size={16} /> },
    { id: 'pricing', label: 'Prix', icon: <FiDollarSign size={16} /> },
    { id: 'shipping', label: 'Livraison', icon: <FiGlobe size={16} /> },
    { id: 'options', label: 'Options', icon: <FiLayers size={16} /> },
    { id: 'advanced', label: 'Avancé', icon: <FiCodesandbox size={16} /> }
  ];

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      <Tabs tabs={tabs} defaultTab="general">
        {(activeTab) => (
          <div className="p-6">
            {activeTab === 'general' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  label="Titre de la variante*"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  required
                />
                {/* Autres champs généraux */}
              </div>
            )}

            {activeTab === 'pricing' && (
              <div className="space-y-6">
                {formData.prices?.map((price, index) => (
                  <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
                    <Input
                      label="Montant*"
                      type="number"
                      value={price.amount}
                      onChange={(e) => handlePriceChange(index, 'amount', e.target.value)}
                      prefix={price.currency}
                    />
                    <Select
                      label="Devise*"
                      options={currencies.map(c => ({ value: c.code, label: c.code }))}
                      value={price.currency}
                      onChange={(e) => handlePriceChange(index, 'currency', e.target.value)}
                    />
                    <Select
                      label="Région"
                      options={regions.map(r => ({ value: r.id, label: r.name }))}
                      value={price.region}
                      onChange={(e) => handlePriceChange(index, 'region', e.target.value)}
                      clearable
                    />
                  </div>
                ))}
                <Button variant="secondary" onClick={addNewPrice}>
                  <FiPlus size={16} className="mr-2" />
                  Ajouter un prix
                </Button>
              </div>
            )}

            {/* Autres onglets */}

            <div className="flex justify-end space-x-3 mt-8 pt-6 border-t border-gray-200">
              <Button variant="secondary" onClick={onCancel}>
                Annuler
              </Button>
              <Button 
                variant="primary" 
                onClick={() => onSave(formData)}
                disabled={!formData.title || !formData.sku}>
                <FiSave size={16} className="mr-2" />
                Enregistrer
              </Button>
            </div>
          </div>
        )}
      </Tabs>
    </div>
  );
};

export default ProductVariantForm;