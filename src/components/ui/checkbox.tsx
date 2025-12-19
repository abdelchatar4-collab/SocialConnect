/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect est un logiciel libre : vous pouvez le redistribuer et/ou le modifier selon les termes de la Licence Publique Générale GNU telle que publiée par la Free Software Foundation, soit la version 3 de la licence, soit (à votre convenance) toute version ultérieure.

Ce programme est distribué dans l'espoir qu'il sera utile, mais SANS AUCUNE GARANTIE ; sans même la garantie implicite de COMMERCIALISATION ou d'ADÉQUATION À UN USAGE PARTICULIER. Voir la Licence Publique Générale GNU pour plus de détails.
*/

import React from 'react';
import { CheckIcon } from '@heroicons/react/24/outline';
import { useCheckboxClasses } from '@/hooks/useStyleClasses';
import { cn } from '@/lib/utils';

interface CheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string | React.ReactNode; // Modifier cette ligne
  disabled?: boolean;
  className?: string;
  id?: string;
}

export const Checkbox: React.FC<CheckboxProps> = ({
  checked,
  onChange,
  label,
  disabled = false,
  className = "",
  id
}) => {
  const checkboxClasses = useCheckboxClasses(checked, disabled);

  const handleClick = () => {
    if (!disabled) {
      onChange(!checked);
    }
  };

  return (
    <label
      className={cn(
        'flex items-center space-x-2 cursor-pointer select-none',
        disabled && 'cursor-not-allowed opacity-50',
        className
      )}
      htmlFor={id}
    >
      <div
        className={checkboxClasses}
        onClick={handleClick}
        role="checkbox"
        aria-checked={checked}
        aria-disabled={disabled}
        tabIndex={disabled ? -1 : 0}
        onKeyDown={(e) => {
          if ((e.key === ' ' || e.key === 'Enter') && !disabled) {
            e.preventDefault();
            handleClick();
          }
        }}
      >
        {checked && (
          <CheckIcon className="w-3 h-3 text-white stroke-[3]" />
        )}
      </div>
      <span className="text-sm font-medium text-gray-700">
        {typeof label === 'string' ? label : label}
      </span>
    </label>
  );
};
