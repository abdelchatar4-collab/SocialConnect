/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect est un logiciel libre : vous pouvez le redistribuer et/ou le modifier selon les termes de la Licence Publique Générale GNU telle que publiée par la Free Software Foundation, soit la version 3 de la licence, soit (à votre convenance) toute version ultérieure.

Ce programme est distribué dans l'espoir qu'il sera utile, mais SANS AUCUNE GARANTIE ; sans même la garantie implicite de COMMERCIALISATION ou d'ADÉQUATION À UN USAGE PARTICULIER. Voir la Licence Publique Générale GNU pour plus de détails.
*/

import React, { useState, useRef, useEffect } from 'react';
import { ChevronDownIcon } from '@heroicons/react/20/solid';

interface ComboBoxProps {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  options: Array<{ value: string; label: string }>;
  placeholder?: string;
  disabled?: boolean;
  error?: string;
  className?: string;
  allowCustom?: boolean;
}

export const ComboBox: React.FC<ComboBoxProps> = ({
  id,
  value,
  onChange,
  options = [],
  placeholder = 'Sélectionner ou taper...',
  disabled = false,
  error,
  className = '',
  allowCustom = true
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState(value);
  const [filteredOptions, setFilteredOptions] = useState(options);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setInputValue(value);
  }, [value]);

  useEffect(() => {
    if (inputValue) {
      const filtered = options.filter(option =>
        option.label.toLowerCase().includes(inputValue.toLowerCase())
      );
      setFilteredOptions(filtered);
    } else {
      setFilteredOptions(options);
    }
  }, [inputValue, options]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    onChange(newValue);
    setIsOpen(true);
  };

  const handleOptionSelect = (option: { value: string; label: string }) => {
    setInputValue(option.label);
    onChange(option.value);
    setIsOpen(false);
  };

  const handleInputFocus = () => {
    setIsOpen(true);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setIsOpen(false);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      setIsOpen(false);
    }
  };

  // AJOUT TEMPORAIRE pour déboguer
  // console.log('ComboBox options reçues:', options);
  // console.log('ComboBox filteredOptions:', filteredOptions);

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <div className="relative">
        <input
          ref={inputRef}
          id={id}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          placeholder={placeholder}
          className={`
            block w-full px-3 py-2 pr-8 text-sm
            border border-gray-300 rounded-md bg-white text-gray-900
            focus:ring-2 focus:ring-blue-500 focus:border-blue-500
            ${error ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : ''}
            ${disabled ? 'bg-gray-100 cursor-not-allowed' : ''}
          `}
        />
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          disabled={disabled}
          className="absolute inset-y-0 right-0 flex items-center px-2 text-gray-400 hover:text-gray-600"
        >
          <ChevronDownIcon className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {isOpen && !disabled && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
          {filteredOptions.length > 0 ? (
            filteredOptions.map((option, index) => (
              <button
                key={`${option.value}-${index}`}
                type="button"
                onClick={() => handleOptionSelect(option)}
                className="w-full px-3 py-2 text-left text-sm text-gray-900 hover:bg-blue-50 hover:text-blue-900 focus:bg-blue-50 focus:text-blue-900 focus:outline-none"
              >
                {option.label}
              </button>
            ))
          ) : (
            <div className="px-3 py-2 text-sm text-gray-500">
              {allowCustom ? (
                <span>Tapez pour ajouter &quot;<strong>{inputValue}</strong>&quot;</span>
              ) : (
                'Aucune option trouvée'
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
