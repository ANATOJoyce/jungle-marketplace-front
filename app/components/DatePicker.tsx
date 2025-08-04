import React from 'react';
import DatePickerLib from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

interface DatePickerProps {
  selected: Date | null;
  onChange: (date: Date | null) => void;
  label?: string;
  required?: boolean;
  minDate?: Date;
  maxDate?: Date;
  showTimeSelect?: boolean;
  timeFormat?: string;
  timeIntervals?: number;
  dateFormat?: string;
  className?: string;
  wrapperClassName?: string;
  error?: string;
}

export const DatePicker: React.FC<DatePickerProps> = ({
  selected,
  onChange,
  label,
  required = false,
  minDate,
  maxDate,
  showTimeSelect = false,
  timeFormat = 'HH:mm',
  timeIntervals = 15,
  dateFormat = 'Pp',
  className = '',
  wrapperClassName = '',
  error,
}) => {
  return (
    <div className={`space-y-1 ${wrapperClassName}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500"> *</span>}
        </label>
      )}
      <DatePickerLib
        selected={selected}
        onChange={onChange}
        minDate={minDate}
        maxDate={maxDate}
        showTimeSelect={showTimeSelect}
        timeFormat={timeFormat}
        timeIntervals={timeIntervals}
        dateFormat={dateFormat}
        className={`block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 p-2 border ${
          error ? 'border-red-500' : ''
        } ${className}`}
        placeholderText="Sélectionner une date"
        required={required}
      />
      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
    </div>
  );

  
};