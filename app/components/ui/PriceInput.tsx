import React from 'react';

interface PriceInputProps {
  value: number;
  onChange: (value: number) => void;
  currency?: string;
  label?: string;
  className?: string;
}

export const PriceInput = ({ value, onChange, currency = 'EUR', label, className = '' }: PriceInputProps) => (
  <div className={className}>
    {label && <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>}
    <div className="relative rounded-md shadow-sm">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <span className="text-gray-500 sm:text-sm">{currency}</span>
      </div>
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-12 pr-12 sm:text-sm border-gray-300 rounded-md"
        step="0.01"
        min="0"
      />
      <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
        <span className="text-gray-500 sm:text-sm">€</span>
      </div>
    </div>
  </div>
);