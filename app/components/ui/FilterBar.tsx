import React from 'react';

interface FilterBarProps {
  filters: {
    key: string;
    label: string;
    options: { value: string; label: string }[];
  }[];
  onFilterChange: (key: string, value: string) => void;
  className?: string;
}

export const FilterBar = ({ filters, onFilterChange, className = '' }: FilterBarProps) => (
  <div className={`flex flex-wrap gap-4 mb-6 ${className}`}>
    {filters.map((filter) => (
      <div key={filter.key} className="min-w-[200px]">
        <label className="block text-sm font-medium text-gray-700 mb-1">{filter.label}</label>
        <select
          onChange={(e) => onFilterChange(filter.key, e.target.value)}
          className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
        >
          <option value="">Tous</option>
          {filter.options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
    ))}
  </div>
);