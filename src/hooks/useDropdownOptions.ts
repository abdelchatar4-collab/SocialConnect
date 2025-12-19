/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect est un logiciel libre : vous pouvez le redistribuer et/ou le modifier selon les termes de la Licence Publique Générale GNU telle que publiée par la Free Software Foundation, soit la version 3 de la licence, soit (à votre convenance) toute version ultérieure.

Ce programme est distribué dans l'espoir qu'il sera utile, mais SANS AUCUNE GARANTIE ; sans même la garantie implicite de COMMERCIALISATION ou d'ADÉQUATION À UN USAGE PARTICULIER. Voir la Licence Publique Générale GNU pour plus de détails.
*/

import { useState, useEffect, useCallback } from 'react';
import { optionsClient, DropdownOption } from '../lib/optionsClient';

export const useDropdownOptions = (category: string = 'ALL') => {
  const [options, setOptions] = useState<DropdownOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOptions = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const fetchedOptions = await optionsClient.getOptions(category);
      setOptions(fetchedOptions);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement des options');
    } finally {
      setLoading(false);
    }
  }, [category]);

  const addOption = async (optionCategory: string, value: string) => {
    try {
      setError(null);
      const newOption = await optionsClient.addOption(optionCategory, value);
      setOptions(prev => [...prev, newOption]);
      return newOption;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de l\'ajout de l\'option');
      throw err;
    }
  };

  useEffect(() => {
    fetchOptions();
  }, [category, fetchOptions]);

  return {
    options,
    loading,
    error,
    addOption,
    refetch: fetchOptions
  };
};
