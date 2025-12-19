/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect est un logiciel libre : vous pouvez le redistribuer et/ou le modifier selon les termes de la Licence Publique Générale GNU telle que publiée par la Free Software Foundation, soit la version 3 de la licence, soit (à votre convenance) toute version ultérieure.

Ce programme est distribué dans l'espoir qu'il sera utile, mais SANS AUCUNE GARANTIE ; sans même la garantie implicite de COMMERCIALISATION ou d'ADÉQUATION À UN USAGE PARTICULIER. Voir la Licence Publique Générale GNU pour plus de détails.
*/

/**
 * Select Component - Dropdown select with consistent styling
 */

import React from 'react';

interface SelectOption {
    value: string;
    label: string;
}

interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'onChange'> {
    options: SelectOption[];
    label?: string;
    error?: string;
    onChange?: (value: string) => void;
}

export const Select: React.FC<SelectProps> = ({
    options,
    label,
    error,
    onChange,
    className = '',
    ...props
}) => {
    return (
        <div className="w-full">
            {label && (
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    {label}
                </label>
            )}
            <select
                className={`
          block w-full rounded-md border-0 py-2 pl-3 pr-10
          text-gray-900 ring-1 ring-inset ring-gray-300
          focus:ring-2 focus:ring-primary-600
          sm:text-sm sm:leading-6
          ${error ? 'ring-red-500' : ''}
          ${className}
        `}
                onChange={(e) => onChange?.(e.target.value)}
                {...props}
            >
                {options.map((option) => (
                    <option key={option.value} value={option.value}>
                        {option.label}
                    </option>
                ))}
            </select>
            {error && (
                <p className="mt-1 text-sm text-red-600">{error}</p>
            )}
        </div>
    );
};
