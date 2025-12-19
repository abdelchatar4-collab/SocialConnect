/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect est un logiciel libre : vous pouvez le redistribuer et/ou le modifier selon les termes de la Licence Publique Générale GNU telle que publiée par la Free Software Foundation, soit la version 3 de la licence, soit (à votre convenance) toute version ultérieure.

Ce programme est distribué dans l'espoir qu'il sera utile, mais SANS AUCUNE GARANTIE ; sans même la garantie implicite de COMMERCIALISATION ou d'ADÉQUATION À UN USAGE PARTICULIER. Voir la Licence Publique Générale GNU pour plus de détails.
*/

import React from 'react';

interface TextAreaInputProps extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, 'onChange'> {
  value: string;
  onChange: (value: string) => void;
  error?: string;
  className?: string;
  maxLength?: number;
  showCounter?: boolean;
}

export const TextAreaInput: React.FC<TextAreaInputProps> = ({
  value,
  onChange,
  error,
  className = '',
  maxLength,
  showCounter = false,
  ...props
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    if (!maxLength || newValue.length <= maxLength) {
      onChange(newValue);
    }
  };

  const getCounterColor = () => {
    if (!maxLength) return 'text-gray-500';
    const percentage = (value.length / maxLength) * 100;
    if (percentage >= 90) return 'text-red-600 font-semibold';
    if (percentage >= 75) return 'text-orange-600';
    return 'text-gray-500';
  };

  return (
    <div className="relative">
      <textarea
        value={value}
        onChange={handleChange}
        className={`
          form-textarea text-visible w-full max-w-full
          ${error ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : ''}
          ${className}
        `}
        style={{
          color: '#111827',
          backgroundColor: '#ffffff'
        }}
        maxLength={maxLength}
        {...props}
      />
      {(showCounter || maxLength) && maxLength && (
        <div className={`text-sm mt-1 text-right ${getCounterColor()}`}>
          {value.length}/{maxLength} caractères
          {value.length >= maxLength * 0.9 && (
            <span className="ml-2 text-xs">
              {value.length >= maxLength ? '⚠️ Limite atteinte' : '⚠️ Proche de la limite'}
            </span>
          )}
        </div>
      )}
    </div>
  );
};
