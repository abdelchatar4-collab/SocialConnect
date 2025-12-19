/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect est un logiciel libre : vous pouvez le redistribuer et/ou le modifier selon les termes de la Licence Publique Générale GNU telle que publiée par la Free Software Foundation, soit la version 3 de la licence, soit (à votre convenance) toute version ultérieure.

Ce programme est distribué dans l'espoir qu'il sera utile, mais SANS AUCUNE GARANTIE ; sans même la garantie implicite de COMMERCIALISATION ou d'ADÉQUATION À UN USAGE PARTICULIER. Voir la Licence Publique Générale GNU pour plus de détails.
*/

import React from 'react';

interface TextInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  value: string;
  onChange: (value: string) => void;
  error?: string;
  className?: string;
}

export const TextInput: React.FC<TextInputProps> = ({
  value,
  onChange,
  error,
  className = '',
  ...props
}) => {
  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={`
        form-input text-visible
        ${error ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : ''}
        ${className}
      `}
      style={{
        color: '#111827',
        backgroundColor: '#ffffff',
        ...props.style
      }}
      {...props}
    />
  );
};
