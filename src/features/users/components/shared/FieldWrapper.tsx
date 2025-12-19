/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect est un logiciel libre : vous pouvez le redistribuer et/ou le modifier selon les termes de la Licence Publique Générale GNU telle que publiée par la Free Software Foundation, soit la version 3 de la licence, soit (à votre convenance) toute version ultérieure.

Ce programme est distribué dans l'espoir qu'il sera utile, mais SANS AUCUNE GARANTIE ; sans même la garantie implicite de COMMERCIALISATION ou d'ADÉQUATION À UN USAGE PARTICULIER. Voir la Licence Publique Générale GNU pour plus de détails.
*/

import React from 'react';

interface FieldWrapperProps {
  label: string;
  required?: boolean;
  error?: string;
  hint?: string;
  children: React.ReactNode;
  className?: string;
  htmlFor?: string;
}

export const FieldWrapper: React.FC<FieldWrapperProps> = ({
  label,
  required = false,
  error,
  hint,
  children,
  className = '',
  htmlFor
}) => {
  return (
    <div className={`space-y-1 ${className}`}>
      <label
        className="block text-sm font-semibold text-gray-900"
        style={{ color: '#111827' }}
        htmlFor={htmlFor}
      >
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      {children}
      {hint && (
        <p className="text-sm text-gray-600" style={{ color: '#4B5563' }}>{hint}</p>
      )}
      {error && (
        <p className="text-sm text-red-600 font-medium">{error}</p>
      )}
    </div>
  );
};
