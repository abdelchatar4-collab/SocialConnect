/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect est un logiciel libre : vous pouvez le redistribuer et/ou le modifier selon les termes de la Licence Publique Générale GNU telle que publiée par la Free Software Foundation, soit la version 3 de la licence, soit (à votre convenance) toute version ultérieure.

Ce programme est distribué dans l'espoir qu'il sera utile, mais SANS AUCUNE GARANTIE ; sans même la garantie implicite de COMMERCIALISATION ou d'ADÉQUATION À UN USAGE PARTICULIER. Voir la Licence Publique Générale GNU pour plus de détails.
*/

import React, { useState, useMemo } from 'react';
import { ComboBox } from './ComboBox';
import { useDropdownOptionsAPI } from '../../hooks/useDropdownOptionsAPI';
import { DROPDOWN_CATEGORIES } from '../../constants/dropdownCategories';

interface PartenairesManagerProps {
  value: Array<{ id: string; nom: string }> | string;
  onChange: (value: Array<{ id: string; nom: string }>) => void;
  label?: string;
  placeholder?: string;
  className?: string;
}

export const PartenairesManager: React.FC<PartenairesManagerProps> = ({
  value,
  onChange,
  label = "Partenaires",
  placeholder = "Sélectionner ou ajouter des partenaires...",
  className = ""
}) => {
  const { options: optionsPartenaire, loading, error } = useDropdownOptionsAPI(DROPDOWN_CATEGORIES.PARTENAIRES, 30000);

  // AJOUTER CES LOGS DE DÉBOGAGE
  // console.log('🔍 PartenairesManager - État partenaires:');
  // console.log('- Loading:', loading);
  // console.log('- Error:', error);
  // console.log('- Options count:', optionsPartenaire.length);
  // console.log('- Options:', optionsPartenaire);

  const [currentInput, setCurrentInput] = useState('');

  // Normaliser la valeur pour gérer à la fois les tableaux et les chaînes JSON
  const normalizedValue = useMemo(() => {
    if (Array.isArray(value)) {
      return value;
    }
    if (typeof value === 'string') {
      try {
        // Tenter de parser la chaîne JSON
        const parsed = JSON.parse(value);
        return Array.isArray(parsed) ? parsed : [];
      } catch {
        // Si ce n'est pas du JSON valide, traiter comme une chaîne simple
        return value.trim() ? [{ id: `legacy-${Date.now()}`, nom: value }] : [];
      }
    }
    return [];
  }, [value]);

  const addPartner = (partnerName: string) => {
    if (partnerName && partnerName.trim()) {
      // Vérifier si le partenaire existe déjà
      const exists = normalizedValue.some(p => p.nom.toLowerCase() === partnerName.toLowerCase());
      if (!exists) {
        const newPartner = {
          id: `partner-${Date.now()}`,
          nom: partnerName.trim()
        };
        // Continuer à envoyer un tableau d'objets
        onChange([...normalizedValue, newPartner]);
        setCurrentInput(''); // Réinitialiser l'input
      }
    }
  };

  const handleComboBoxChange = (selectedValue: string) => {
    // Seulement pour les sélections depuis la liste déroulante
    const selectedOption = optionsPartenaire.find(opt => opt.value === selectedValue || opt.label === selectedValue);
    if (selectedOption) {
      addPartner(selectedOption.label);
    }
  };

  const handleInputChange = (inputValue: string) => {
    // Mettre à jour seulement l'état local
    setCurrentInput(inputValue);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && currentInput.trim()) {
      e.preventDefault();
      addPartner(currentInput);
    }
  };

  const handleAddClick = (e: React.MouseEvent) => {
    e.preventDefault(); // Empêcher la soumission du formulaire
    e.stopPropagation(); // Empêcher la propagation de l'événement
    addPartner(currentInput);
  };

  const handleRemove = (partnerId: string) => {
    const updatedValues = normalizedValue.filter(p => p.id !== partnerId);
    onChange(updatedValues);
  };

  return (
    <div className={className}>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
      </label>

      {/* Liste des partenaires sélectionnés */}
      {normalizedValue.length > 0 ? (
        <div className="mb-3 flex flex-wrap gap-2">
          {normalizedValue.map((partner) => (
            <span
              key={partner.id}
              className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
            >
              {partner.nom}
              <button
                type="button"
                onClick={() => handleRemove(partner.id)}
                className="ml-2 text-blue-600 hover:text-blue-800 focus:outline-none"
              >
                ×
              </button>
            </span>
          ))}
        </div>
      ) : (
        <p className="text-sm text-gray-500 mb-3">Aucun partenaire ajouté. Utilisez le bouton &quot;Ajouter un partenaire&quot;.</p>
      )}

      {/* ComboBox pour ajouter de nouveaux partenaires */}
      <div onKeyDown={handleKeyDown}>
        <ComboBox
          value={currentInput}
          onChange={handleInputChange}
          options={optionsPartenaire}
          placeholder={placeholder}
          allowCustom={true}
        />
      </div>

      {/* Bouton pour ajouter manuellement */}
      {currentInput.trim() && (
        <button
          type="button"
          onClick={handleAddClick}
          className="mt-2 px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Ajouter &quot;{currentInput}&quot;
        </button>
      )}
    </div>
  );
};
