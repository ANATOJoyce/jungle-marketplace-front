// ~/components/FormInput.tsx

import React from "react";

interface Props {
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  type?: string;
  disabled?: boolean;
  required?: boolean;
  className?: string;
  placeholder?: string; // ✅ Ajouté ici
}

export function FormInput({
  label,
  name,
  value,
  onChange,
  type = "text",
  disabled = false,
  required = false,
  className = "",
  placeholder = "", // ✅ Ajouté ici aussi
}: Props) {
  return (
    <div className={className}>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
        {required && <span className="text-red-500">*</span>}
      </label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        disabled={disabled}
        required={required}
        placeholder={placeholder} // ✅ utilisé ici
        className="w-full border border-gray-300 rounded-md p-2 focus:ring-orange-500 focus:border-orange-500"
      />
    </div>
  );
}
