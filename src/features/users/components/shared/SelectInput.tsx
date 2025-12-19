/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect est un logiciel libre : vous pouvez le redistribuer et/ou le modifier selon les termes de la Licence Publique Générale GNU telle que publiée par la Free Software Foundation, soit la version 3 de la licence, soit (à votre convenance) toute version ultérieure.

Ce programme est distribué dans l'espoir qu'il sera utile, mais SANS AUCUNE GARANTIE ; sans même la garantie implicite de COMMERCIALISATION ou d'ADÉQUATION À UN USAGE PARTICULIER. Voir la Licence Publique Générale GNU pour plus de détails.
*/

import React from 'react';
import { ChevronDownIcon } from '@heroicons/react/20/solid';

interface SelectInputProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'onChange'> {
  value: string;
  onChange: (value: string) => void;
  options: Array<{ value: string; label: string; disabled?: boolean }>;
  placeholder?: string;
  error?: string;
  className?: string;
}

export const SelectInput: React.FC<SelectInputProps> = ({
  id,
  value,
  onChange,
  options = [],
  placeholder,
  disabled = false,
  error,
  className = '',
  ...props
}) => {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`
          block w-full appearance-none px-3 py-2 pr-8 text-sm
          border border-gray-300 rounded-md bg-white text-gray-900
          focus:ring-2 focus:ring-blue-500 focus:border-blue-500
          ${error ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : ''}
          ${className}
        `}
        {...props}
      >
        {placeholder && (
          <option key="placeholder" value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((option, index) => (
          <option
            key={option.value || `option-${index}`} // Utiliser l'index comme fallback pour les valeurs vides
            value={option.value}
            disabled={option.disabled}
            className="text-gray-900"
          >
            {option.label}
          </option>
        ))}
      </select>
      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
        <ChevronDownIcon className="h-4 w-4" aria-hidden="true" />
      </div>
    </div>
  );
};
