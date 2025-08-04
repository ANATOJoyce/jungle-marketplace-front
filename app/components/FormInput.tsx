import React from "react";

type Option = {
  value: string;
  label: string;
};

type BaseProps = {
  label: string;
  name: string;
  value?: string | number;
  defaultValue?: string | number;
  required?: boolean;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
  inputClassName?: string;
  error?: string;
};

type InputProps = BaseProps & {
  type?: React.HTMLInputTypeAttribute;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  options?: never;
};

type SelectProps = BaseProps & {
  type: "select";
  onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  options: Option[];
};

type TextareaProps = BaseProps & {
  type: "textarea";
  onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  options?: never;
};

type Props = InputProps | SelectProps | TextareaProps;

export function FormInput(props: Props) {
  const {
    label,
    name,
    type = "text",
    value,
    defaultValue,
    required = false,
    disabled = false,
    placeholder = "",
    className = "",
    inputClassName = "",
    error,
  } = props;

  const baseInputClasses =
    "border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-500";
  const disabledClasses = disabled ? "bg-gray-100 cursor-not-allowed" : "";
  const errorClasses = error ? "border-red-500 focus:ring-red-500" : "border-gray-300";

  if (type === "select") {
    const { options, onChange } = props as SelectProps;
    return (
      <div className={`flex flex-col ${className}`}>
        <label htmlFor={name} className="mb-1 font-semibold">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
        <select
          id={name}
          name={name}
          value={value}
          defaultValue={defaultValue}
          onChange={onChange}
          required={required}
          disabled={disabled}
          className={`${baseInputClasses} ${disabledClasses} ${errorClasses} ${inputClassName}`}
        >
          <option value="">Sélectionnez une option</option>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {error && <p className="text-sm text-red-600 mt-1">{error}</p>}
      </div>
    );
  }

  if (type === "textarea") {
    const { onChange } = props as TextareaProps;
    return (
      <div className={`flex flex-col ${className}`}>
        <label htmlFor={name} className="mb-1 font-semibold">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
        <textarea
          id={name}
          name={name}
          value={value}
          defaultValue={defaultValue}
          onChange={onChange}
          required={required}
          disabled={disabled}
          placeholder={placeholder}
          className={`${baseInputClasses} ${disabledClasses} ${errorClasses} ${inputClassName} min-h-[100px]`}
        />
        {error && <p className="text-sm text-red-600 mt-1">{error}</p>}
      </div>
    );
  }

  const { onChange } = props as InputProps;
  return (
    <div className={`flex flex-col ${className}`}>
      <label htmlFor={name} className="mb-1 font-semibold">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        value={value}
        defaultValue={defaultValue}
        onChange={onChange}
        required={required}
        disabled={disabled}
        placeholder={placeholder}
        className={`${baseInputClasses} ${disabledClasses} ${errorClasses} ${inputClassName}`}
      />
      {error && <p className="text-sm text-red-600 mt-1">{error}</p>}
    </div>
  );
}
