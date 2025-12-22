/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect est un logiciel libre : vous pouvez le redistribuer et/ou le modifier selon les termes de la Licence Publique Générale GNU telle que publiée par la Free Software Foundation, soit la version 3 de la licence, soit (à votre convenance) toute version ultérieure.

Ce programme est distribué dans l'espoir qu'il sera utile, mais SANS AUCUNE GARANTIE ; sans même la garantie implicite de COMMERCIALISATION ou d'ADÉQUATION À UN USAGE PARTICULIER. Voir la Licence Publique Générale GNU pour plus de détails.
*/

import { useState, useCallback, useEffect } from 'react';
import { UserFormData } from '@/types/user';
import { useGeographicalAPI } from '@/hooks/useGeographicalAPI';

interface UseAddressSearchProps {
  address: UserFormData['adresse'];
  onChange: (address: UserFormData['adresse']) => void;
  onSecteurChange?: (secteur: string) => void;
  disabled?: boolean;
}

// Fonction pour normaliser les caractères accentués
const normalizeString = (str: string): string => {
  return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
};

export const useAddressSearch = ({ address, onChange, onSecteurChange, disabled }: UseAddressSearchProps) => {
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [searchQuery, setSearchQuery] = useState(address?.rue || '');
  const [isUserInteracting, setIsUserInteracting] = useState(false); // Nouveau état

  // Utiliser le hook API pour les données géographiques
  const { sectors, loading: isLoadingSectors } = useGeographicalAPI();

  // Fonction pour trouver le secteur d'une rue via l'API
  const findSectorByStreetAPI = useCallback((streetName: string): string => {
    if (!streetName || !sectors.length) return '';

    const normalizedStreetName = normalizeString(streetName.toLowerCase().trim());

    for (const sector of sectors) {
      const foundStreet = sector.streets.find(street =>
        normalizeString(street.name.toLowerCase()) === normalizedStreetName ||
        normalizeString(street.name.toLowerCase()).includes(normalizedStreetName) ||
        normalizedStreetName.includes(normalizeString(street.name.toLowerCase()))
      );

      if (foundStreet) {
        return sector.name;
      }
    }

    return '';
  }, [sectors]);

  // Générer des suggestions basées sur les données de l'API
  const generateLocalSuggestions = useCallback((query: string) => {
    if (!sectors.length) return [];

    const searchResults: Array<{
      FormattedAddress: string;
      Street: string;
      Municipality: string;
      Zipcode: string;
      Sector: string;
      id: string;
    }> = [];
    const normalizedQuery = normalizeString(query.toLowerCase());

    sectors.forEach(sector => {
      sector.streets.forEach(street => {
        const normalizedStreetName = normalizeString(street.name.toLowerCase());

        if (normalizedStreetName.includes(normalizedQuery)) {
          searchResults.push({
            FormattedAddress: `${street.name}, 1070 Anderlecht`,
            Street: street.name,
            Municipality: 'Anderlecht',
            Zipcode: '1070',
            Sector: sector.name,
            id: `api-${street.id}`
          });
        }
      });
    });

    return searchResults.slice(0, 10);
  }, [sectors]);

  const searchAddresses = useCallback(async (query: string) => {
    if (query.length < 3) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    setIsLoadingSuggestions(true);
    try {
      const localSuggestions = generateLocalSuggestions(query);
      await new Promise(resolve => setTimeout(resolve, 200));
      setSuggestions(localSuggestions);
      setShowSuggestions(localSuggestions.length > 0);
    } catch (error) {
      console.log('Erreur autocomplétion:', error);
      setSuggestions([]);
      setShowSuggestions(false);
    } finally {
      setIsLoadingSuggestions(false);
    }
  }, [generateLocalSuggestions]);

  // Gérer les changements de champs
  const handleFieldChange = useCallback((field: keyof UserFormData['adresse'], value: string) => {
    setIsUserInteracting(true); // Marquer l'interaction utilisateur

    if (field === 'rue') {
      setSearchQuery(value);

      if (value.length >= 3) {
        searchAddresses(value);
      } else {
        setShowSuggestions(false);
        setSuggestions([]);
      }

      // Calculer automatiquement le secteur quand la rue change
      if (value && value.trim().length > 0) {
        const secteurCalcule = findSectorByStreetAPI(value);

        // Notifier le composant parent du changement de secteur
        if (onSecteurChange) {
          onSecteurChange(secteurCalcule || '');
        }
      } else {
        // Rue vide, pas de secteur
        if (onSecteurChange) {
          onSecteurChange('');
        }
      }
    }

    const newAddress = { ...address, [field]: value };
    onChange(newAddress);
  }, [address, onChange, onSecteurChange, searchAddresses, findSectorByStreetAPI]);

  // Gérer le focus
  const handleFocus = useCallback((e: React.FocusEvent<HTMLInputElement>) => {
    setIsUserInteracting(true); // Marquer l'interaction utilisateur
    const value = e.target.value;
    if (value.length >= 3 && suggestions.length > 0) {
      setShowSuggestions(true);
    }
  }, [suggestions.length]);

  // Sélectionner une suggestion
  const selectSuggestion = useCallback((suggestion: any) => {
    let rue = suggestion.Street || '';
    let numero = '';

    if (!rue && suggestion.FormattedAddress) {
      const addressParts = suggestion.FormattedAddress.split(',')[0].trim();
      const match = addressParts.match(/^(.+?)\s+(\d+[a-zA-Z]*)$/);
      if (match) {
        rue = match[1].trim();
        numero = match[2];
      } else {
        rue = addressParts;
      }
    }

    const newAddress = {
      ...address,
      rue: rue,
      numero: numero || address.numero || '',
      ville: suggestion.Municipality || 'Anderlecht',
      codePostal: suggestion.Zipcode || '1070',
      boite: address.boite || ''
    };

    onChange(newAddress);
    setSearchQuery(rue);

    // Forcer la fermeture immédiate du menu
    setShowSuggestions(false);

    // Calculer automatiquement le secteur pour la rue sélectionnée
    if (rue && rue.trim().length > 0) {
      const secteurCalcule = findSectorByStreetAPI(rue);

      // Notifier le composant parent du changement de secteur
      if (onSecteurChange) {
        onSecteurChange(secteurCalcule || '');
      }
    }

    // Focus sur le champ numéro si pas de numéro dans la suggestion
    if (numero === '') {
      setTimeout(() => {
        const numeroField = document.getElementById('numero');
        if (numeroField) {
          numeroField.focus();
        }
      }, 50);
    }
  }, [address, onChange, onSecteurChange, findSectorByStreetAPI]);

  // Gérer le blur
  const handleBlur = useCallback((e: React.FocusEvent<HTMLInputElement>) => {
    // Augmenter le délai pour permettre au clic sur suggestion de s'exécuter
    setTimeout(() => {
      setShowSuggestions(false);
    }, 200); // Augmenté de 150ms à 200ms
  }, []);

  // Synchroniser searchQuery avec address.rue
  useEffect(() => {
    if (address?.rue !== searchQuery) {
      setSearchQuery(address?.rue || '');
    }
  }, [address?.rue, searchQuery]);

  // Recharger les suggestions quand les secteurs changent
  useEffect(() => {
    if (isUserInteracting && searchQuery && searchQuery.length >= 3) {
      searchAddresses(searchQuery);
    }
  }, [sectors, searchQuery, searchAddresses, isUserInteracting]);

  return {
    suggestions,
    showSuggestions,
    isLoadingSuggestions: isLoadingSuggestions || isLoadingSectors,
    isLoading: isLoadingSuggestions || isLoadingSectors,
    searchQuery,
    selectedAddress: null,
    handleFieldChange,
    selectSuggestion,
    handleFocus,
    handleBlur,
    handleSearch: handleFieldChange,
    handleSelectAddress: selectSuggestion,
    clearSuggestions: () => {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };
};
