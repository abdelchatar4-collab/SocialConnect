/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect est un logiciel libre : vous pouvez le redistribuer et/ou le modifier selon les termes de la Licence Publique Générale GNU telle que publiée par la Free Software Foundation, soit la version 3 de la licence, soit (à votre convenance) toute version ultérieure.

Ce programme est distribué dans l'espoir qu'il sera utile, mais SANS AUCUNE GARANTIE ; sans même la garantie implicite de COMMERCIALISATION ou d'ADÉQUATION À UN USAGE PARTICULIER. Voir la Licence Publique Générale GNU pour plus de détails.
*/

/**
 * Hook pour la gestion du localStorage
 */

import { useState, useEffect, useCallback } from 'react';

export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((prev: T) => T)) => void, () => void] {
  // État pour stocker la valeur
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      if (typeof window === 'undefined') {
        return initialValue;
      }

      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.warn(`Erreur lecture localStorage pour la clé "${key}":`, error);
      return initialValue;
    }
  });

  // Fonction pour mettre à jour la valeur
  const setValue = useCallback((value: T | ((prev: T) => T)) => {
    try {
      // Permettre la fonction de callback pour la valeur
      const valueToStore = value instanceof Function ? value(storedValue) : value;

      // Sauvegarder dans l'état
      setStoredValue(valueToStore);

      // Sauvegarder dans localStorage
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      }
    } catch (error) {
      console.error(`Erreur sauvegarde localStorage pour la clé "${key}":`, error);
    }
  }, [key, storedValue]);

  // Fonction pour supprimer la valeur
  const removeValue = useCallback(() => {
    try {
      setStoredValue(initialValue);
      if (typeof window !== 'undefined') {
        window.localStorage.removeItem(key);
      }
    } catch (error) {
      console.error(`Erreur suppression localStorage pour la clé "${key}":`, error);
    }
  }, [key, initialValue]);

  return [storedValue, setValue, removeValue];
}

/**
 * Hook pour vérifier si une clé existe dans localStorage
 */
export function useLocalStorageExists(key: string): boolean {
  const [exists, setExists] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return window.localStorage.getItem(key) !== null;
  });

  useEffect(() => {
    const checkExists = () => {
      if (typeof window !== 'undefined') {
        setExists(window.localStorage.getItem(key) !== null);
      }
    };

    // Vérifier initialement
    checkExists();

    // Écouter les changements de storage
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === key) {
        checkExists();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [key]);

  return exists;
}

/**
 * Hook pour obtenir la taille utilisée du localStorage
 */
export function useLocalStorageSize(): number {
  const [size, setSize] = useState<number>(0);

  useEffect(() => {
    const calculateSize = () => {
      if (typeof window === 'undefined') return 0;

      let total = 0;
      for (let key in localStorage) {
        if (localStorage.hasOwnProperty(key)) {
          total += localStorage[key].length + key.length;
        }
      }
      return total;
    };

    setSize(calculateSize());

    // Recalculer périodiquement
    const interval = setInterval(() => {
      setSize(calculateSize());
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return size;
}
