/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect est un logiciel libre : vous pouvez le redistribuer et/ou le modifier selon les termes de la Licence Publique Générale GNU telle que publiée par la Free Software Foundation, soit la version 3 de la licence, soit (à votre convenance) toute version ultérieure.

Ce programme est distribué dans l'espoir qu'il sera utile, mais SANS AUCUNE GARANTIE ; sans même la garantie implicite de COMMERCIALISATION ou d'ADÉQUATION À UN USAGE PARTICULIER. Voir la Licence Publique Générale GNU pour plus de détails.
*/

"use client";
import React, { useState, useEffect, useRef } from 'react';
import mappingData from '@/config/mapping.json';
import { MappingData } from '@/types/user'; // Import MappingData from types

interface AddressAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  onSectorChange?: (sector: string) => void;
  onPostalCodeChange?: (postalCode: string) => void; // New prop
  onCommuneChange?: (commune: string) => void; // New prop
  className?: string;
  placeholder?: string;
}

interface AddressDetails {
  codePostal: string;
  commune: string;
}

const AddressAutocomplete: React.FC<AddressAutocompleteProps> = ({
  value, // La valeur initiale/actuelle de la rue
  onChange,
  onSectorChange,
  onPostalCodeChange,
  onCommuneChange,
  className,
  placeholder
}) => {
  const [inputValue, setInputValue] = useState(value); // État local pour l'input
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [allAddresses, setAllAddresses] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Synchroniser l'état local inputValue avec la prop value externe
  useEffect(() => {
    setInputValue(value);
  }, [value]);

  // Extraire toutes les adresses du fichier mapping.json
  useEffect(() => {
    try {
      const addresses: string[] = [];
      const data = mappingData as MappingData;

      // Collecte toutes les rues de tous les secteurs, excluant rueVersCodePostalEtCommune
      Object.entries(data).forEach(([key, value]) => {
        if (key !== 'rueVersCodePostalEtCommune' && Array.isArray(value)) {
           addresses.push(...value);
        }
      });

      setAllAddresses(addresses);
    } catch (error) {
      console.error("Erreur lors du chargement des adresses:", error);
    }
  }, []); // Empty dependency array means this effect runs once on mount

  // Filtrer les suggestions en fonction de la saisie
  const updateSuggestions = (input: string) => {
    if (!input || input.length < 2) {
      setSuggestions([]);
      return;
    }

    // Normaliser l'entrée pour la recherche (minuscules, sans accents)
    const normalizedInput = input.toLowerCase()
      .normalize("NFD").replace(/[\u0300-\u036f]/g, "");

    const filteredSuggestions = allAddresses.filter(address => {
      const normalizedAddress = address.toLowerCase()
        .normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      return normalizedAddress.includes(normalizedInput);
    });

    setSuggestions(filteredSuggestions.slice(0, 5)); // Limiter à 5 suggestions
  };

  // Fonction pour déterminer le secteur à partir d'une adresse
  const determineSector = (address: string): string => {
    if (!address) return '';

    // Normaliser l'adresse (enlever les accents, mettre en minuscules)
    const normalizedAddress = address.toLowerCase()
      .normalize("NFD").replace(/[\u0300-\u036f]/g, "");

    const data = mappingData as MappingData;

    // Parcourir les secteurs (excluant rueVersCodePostalEtCommune) pour trouver la rue correspondante
    for (const [sector, streets] of Object.entries(data)) {
       if (sector !== 'rueVersCodePostalEtCommune' && Array.isArray(streets)) {
          for (const street of streets) {
            // Normaliser la rue pour la comparaison
            const normalizedStreet = street.toLowerCase()
              .normalize("NFD").replace(/[\u0300-\u036f]/g, "");

            // Vérifier si l'adresse contient la rue
            if (normalizedAddress.includes(normalizedStreet)) {
              return sector;
            }
          }
       }
    }

    return '';
  };

  // Gérer les changements d'entrée
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newInput = e.target.value;
    setInputValue(newInput); // Mettre à jour l'état local
    onChange(newInput);     // Propager le changement vers UserForm
    updateSuggestions(newInput);
    setShowSuggestions(true);
  };

  // Gérer la sélection d'une suggestion
  const handleSelectSuggestion = (suggestion: string) => {
    setInputValue(suggestion); // Mettre à jour l'état local avec la suggestion complète
    onChange(suggestion);    // Propager la suggestion complète vers UserForm

    // If callbacks are provided, find and call them with postal code and commune
    const data = mappingData as any; // Cast to any to bypass TypeScript error
    const rueVersCodePostalEtCommune = data.rueVersCodePostalEtCommune as { [street: string]: AddressDetails } | undefined;

    if (rueVersCodePostalEtCommune) {
      const addressDetails = rueVersCodePostalEtCommune[suggestion];

      if (addressDetails) {
        if (onPostalCodeChange) onPostalCodeChange(addressDetails.codePostal);
        if (onCommuneChange) onCommuneChange(addressDetails.commune);
      } else {
         if (onPostalCodeChange) onPostalCodeChange('');
         if (onCommuneChange) onCommuneChange('');
      }
    } else {
       if (onPostalCodeChange) onPostalCodeChange('');
       if (onCommuneChange) onCommuneChange('');
    }

    if (onSectorChange) {
      const sector = determineSector(suggestion);
      onSectorChange(sector);
    }

    setShowSuggestions(false);
    setSuggestions([]);
  };

  // Gérer la navigation au clavier
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown' && suggestions.length > 0) {
      e.preventDefault();
      const nextElement = suggestionsRef.current?.querySelector('div') as HTMLElement;
      if (nextElement) nextElement.focus();
    }
  };

  const handleSuggestionKeyDown = (e: React.KeyboardEvent<HTMLDivElement>, suggestion: string) => {
    switch (e.key) {
      case 'Enter':
        handleSelectSuggestion(suggestion);
        inputRef.current?.focus();
        break;
      case 'ArrowDown':
        e.preventDefault();
        const nextElement = e.currentTarget.nextElementSibling as HTMLElement;
        if (nextElement) nextElement.focus();
        break;
      case 'ArrowUp':
        e.preventDefault();
        const prevElement = e.currentTarget.previousElementSibling as HTMLElement;
        if (prevElement) prevElement.focus();
        else inputRef.current?.focus();
        break;
    }
  };

  // Fermer les suggestions lorsque l'utilisateur clique ailleurs
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target as Node) &&
          inputRef.current && !inputRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="relative w-full">
      <input
        ref={inputRef}
        type="text"
        value={inputValue} // Utiliser l'état local inputValue
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        className={className} // Appliquer la classe passée en prop
        placeholder={placeholder || "Entrez une adresse"}
        autoComplete="off"
      />
      
      {showSuggestions && suggestions.length > 0 && (
        <div 
          ref={suggestionsRef}
          className="absolute z-10 w-full bg-white border border-gray-300 mt-1 rounded-md shadow-lg"
        >
          {suggestions.map((suggestion, index) => (
            <div
              key={index}
              tabIndex={0}
              className="px-4 py-2 hover:bg-gray-100 focus:bg-gray-100 focus:outline-none cursor-pointer"
              onClick={() => handleSelectSuggestion(suggestion)}
              onKeyDown={(e) => handleSuggestionKeyDown(e, suggestion)}
            >
              {suggestion}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AddressAutocomplete;
