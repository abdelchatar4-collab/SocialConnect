/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect est un logiciel libre : vous pouvez le redistribuer et/ou le modifier selon les termes de la Licence Publique Générale GNU telle que publiée par la Free Software Foundation, soit la version 3 de la licence, soit (à votre convenance) toute version ultérieure.

Ce programme est distribué dans l'espoir qu'il sera utile, mais SANS AUCUNE GARANTIE ; sans même la garantie implicite de COMMERCIALISATION ou d'ADÉQUATION À UN USAGE PARTICULIER. Voir la Licence Publique Générale GNU pour plus de détails.
*/

import { useState, useEffect, useCallback } from 'react';

export interface GeographicalSector {
  id: string;
  name: string;
  streets: Street[];
  createdAt: string;
  updatedAt: string;
}

export interface Street {
  id: string;
  name: string;
  sectorId: string;
  createdAt: string;
  updatedAt: string;
}

export function useGeographicalAPI() {
  const [sectors, setSectors] = useState<GeographicalSector[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSectors = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/geographical');
      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des secteurs');
      }
      const data = await response.json();
      setSectors(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
    } finally {
      setLoading(false);
    }
  }, []);

  const addSector = useCallback(async (name: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/geographical', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'addSector', sectorName: name })
      });
      if (!response.ok) {
        throw new Error('Erreur lors de l\'ajout du secteur');
      }
      await fetchSectors(); // Rafraîchir la liste
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
      return false;
    } finally {
      setLoading(false);
    }
  }, [fetchSectors]);

  const updateSector = useCallback(async (sectorId: string, newName: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/geographical', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'updateSector', sectorId, newName })
      });
      if (!response.ok) {
        throw new Error('Erreur lors de la mise à jour du secteur');
      }
      await fetchSectors();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
      return false;
    } finally {
      setLoading(false);
    }
  }, [fetchSectors]);

  const deleteSector = useCallback(async (sectorId: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/geographical', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'deleteSector', sectorId })
      });
      if (!response.ok) {
        throw new Error('Erreur lors de la suppression du secteur');
      }
      await fetchSectors();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
      return false;
    } finally {
      setLoading(false);
    }
  }, [fetchSectors]);

  const addStreet = useCallback(async (sectorId: string, streetName: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/geographical', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'addStreet', sectorId, streetName })
      });
      if (!response.ok) {
        throw new Error('Erreur lors de l\'ajout de la rue');
      }
      await fetchSectors();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
      return false;
    } finally {
      setLoading(false);
    }
  }, [fetchSectors]);

  const updateStreet = useCallback(async (streetId: string, newName: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/geographical', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'updateStreet', streetId, newName })
      });
      if (!response.ok) {
        throw new Error('Erreur lors de la mise à jour de la rue');
      }
      await fetchSectors();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
      return false;
    } finally {
      setLoading(false);
    }
  }, [fetchSectors]);

  const deleteStreet = useCallback(async (streetId: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/geographical', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'deleteStreet', streetId })
      });
      if (!response.ok) {
        throw new Error('Erreur lors de la suppression de la rue');
      }
      await fetchSectors();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
      return false;
    } finally {
      setLoading(false);
    }
  }, [fetchSectors]);

  useEffect(() => {
    fetchSectors();
  }, [fetchSectors]);

  return {
    sectors,
    loading,
    error,
    fetchSectors,
    addSector,
    updateSector,
    deleteSector,
    addStreet,
    updateStreet,
    deleteStreet
  };
}
