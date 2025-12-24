/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect est un logiciel libre : vous pouvez le redistribuer et/ou le modifier selon les termes de la Licence Publique Générale GNU telle que publiée par la Free Software Foundation, soit la version 3 de la licence, soit (à votre convenance) toute version ultérieure.

Ce programme est distribué dans l'espoir qu'il sera utile, mais SANS AUCUNE GARANTIE ; sans même la garantie implicite de COMMERCIALISATION ou d'ADÉQUATION À UN USAGE PARTICULIER. Voir la Licence Publique Générale GNU pour plus de détails.
*/

import { useState, useEffect, useRef, useCallback } from 'react';
import { optionsClient, DropdownOption } from '@/lib/optionsClient';

export interface UseDropdownOptionsAPIResult {
  options: DropdownOption[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  addOption: (value: string) => Promise<void>;
  hasNewData?: boolean;
  markAsViewed?: () => void;
}

export function useDropdownOptionsAPI(
  optionType: string,
  pollingInterval?: number
): UseDropdownOptionsAPIResult {
  const [options, setOptions] = useState<DropdownOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasNewData, setHasNewData] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastOptionsRef = useRef<DropdownOption[]>([]);

  const fetchOptions = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const fetchedOptions = await optionsClient.getOptions(optionType);

      // Vérifier s'il y a de nouvelles données
      if (fetchedOptions.length === 0) {
        console.warn(`[useDropdownOptionsAPI] Aucune option trouvée pour le type: ${optionType}`);
      } else {
        console.log(`[useDropdownOptionsAPI] ${fetchedOptions.length} options chargées pour: ${optionType}`);
      }

      if (pollingInterval && lastOptionsRef.current.length > 0) {
        const hasChanges = JSON.stringify(fetchedOptions) !== JSON.stringify(lastOptionsRef.current);
        if (hasChanges) {
          setHasNewData(true);
        }
      }

      setOptions(fetchedOptions);
      lastOptionsRef.current = fetchedOptions;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement des options');
      console.error('Erreur useDropdownOptionsAPI:', err);
    } finally {
      setLoading(false);
    }
  }, [optionType, pollingInterval]);

  const addOption = async (value: string) => {
    try {
      setError(null);
      await optionsClient.addOption(optionType, value);
      // Recharger les options après ajout
      await fetchOptions();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de l\'ajout de l\'option');
      throw err;
    }
  };

  const markAsViewed = () => {
    setHasNewData(false);
  };

  useEffect(() => {
    fetchOptions();

    // Configurer le polling si un intervalle est fourni
    if (pollingInterval) {
      intervalRef.current = setInterval(fetchOptions, pollingInterval);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [optionType, pollingInterval, fetchOptions]);

  const result: UseDropdownOptionsAPIResult = {
    options,
    loading,
    error,
    refetch: fetchOptions,
    addOption
  };

  // Ajouter les propriétés de polling seulement si un intervalle est fourni
  if (pollingInterval) {
    result.hasNewData = hasNewData;
    result.markAsViewed = markAsViewed;
  }

  return result;
}
