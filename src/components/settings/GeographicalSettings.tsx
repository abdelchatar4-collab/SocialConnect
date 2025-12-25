/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect est un logiciel libre : vous pouvez le redistribuer et/ou le modifier selon les termes de la Licence Publique Générale GNU telle que publiée par la Free Software Foundation, soit la version 3 de la licence, soit (à votre convenance) toute version ultérieure.

Ce programme est distribué dans l'espoir qu'il sera utile, mais SANS AUCUNE GARANTIE ; sans même la garantie implicite de COMMERCIALISATION ou d'ADÉQUATION À UN USAGE PARTICULIER. Voir la Licence Publique Générale GNU pour plus de détails.
*/

'use client';

/**
 * GeographicalSettings - Redesigned version
 * Manage sectors and streets configuration
 */

import React, { useState, useEffect } from 'react';
import { RefreshCw, MapPin, Building2, Loader2 } from 'lucide-react';
import { useGeographicalAPI, type GeographicalSector } from '@/hooks/useGeographicalAPI';
import { SectorsTab } from './Geographical/SectorsTab';
import { StreetsTab } from './Geographical/StreetsTab';

export default function GeographicalSettings() {
  const {
    sectors, loading, error, addSector, updateSector, deleteSector,
    addStreet, updateStreet, deleteStreet, fetchSectors
  } = useGeographicalAPI();

  const [selectedSector, setSelectedSector] = useState<GeographicalSector | null>(null);
  const [newSectorName, setNewSectorName] = useState('');
  const [newStreetName, setNewStreetName] = useState('');
  const [editingSector, setEditingSector] = useState({ index: -1, value: '' });
  const [editingStreet, setEditingStreet] = useState({ index: -1, value: '' });
  const [isAddingSector, setIsAddingSector] = useState(false);
  const [isAddingStreet, setIsAddingStreet] = useState(false);
  const [activeTab, setActiveTab] = useState<'sectors' | 'streets'>('sectors');

  useEffect(() => {
    if (sectors.length > 0 && !selectedSector) setSelectedSector(sectors[0]);
  }, [sectors, selectedSector]);

  const handleSelectSector = (sectorName: string) => {
    const sector = sectors.find(s => s.name === sectorName);
    if (sector) {
      setSelectedSector(sector);
      setIsAddingSector(false); setIsAddingStreet(false);
      setEditingSector({ index: -1, value: '' }); setEditingStreet({ index: -1, value: '' });
      setActiveTab('streets');
    }
  };

  const handleAddSector = async () => {
    if (newSectorName.trim()) {
      const success = await addSector(newSectorName.trim());
      if (success) {
        const newSector = sectors.find(s => s.name === newSectorName.trim());
        if (newSector) setSelectedSector(newSector);
        setNewSectorName(''); setIsAddingSector(false);
      } else alert("Impossible d'ajouter ce secteur.");
    }
  };

  const saveEditSector = async () => {
    if (editingSector.index >= 0) {
      const sector = sectors[editingSector.index];
      if (await updateSector(sector.id, editingSector.value.trim())) {
        const updated = sectors.find(s => s.name === editingSector.value.trim());
        if (updated) setSelectedSector(updated);
        setEditingSector({ index: -1, value: '' });
      } else alert("Impossible de mettre à jour ce secteur.");
    }
  };

  const handleDeleteSector = async (id: string, name: string) => {
    if (confirm(`Supprimer le secteur "${name}" et ses rues ?`)) {
      if (await deleteSector(id) && selectedSector?.id === id) {
        setSelectedSector(sectors.length > 1 ? sectors[0] : null);
      }
    }
  };

  const handleAddStreet = async () => {
    if (newStreetName.trim() && selectedSector) {
      if (await addStreet(selectedSector.id, newStreetName.trim())) {
        setNewStreetName(''); setIsAddingStreet(false);
      } else alert("Impossible d'ajouter cette rue.");
    }
  };

  const saveEditStreet = async () => {
    if (editingStreet.index >= 0 && selectedSector) {
      const street = selectedSector.streets[editingStreet.index];
      if (await updateStreet(street.id, editingStreet.value.trim())) setEditingStreet({ index: -1, value: '' });
      else alert("Impossible de mettre à jour cette rue.");
    }
  };

  const handleDeleteStreet = async (id: string, name: string) => {
    if (confirm(`Supprimer la rue "${name}" ?`)) await deleteStreet(id);
  };

  if (error) return (
    <div className="p-4 bg-red-50 border border-red-200 rounded-md text-center">
      <p className="text-red-800 mb-2">Erreur : {error}</p>
      <button onClick={fetchSectors} className="settings-btn settings-btn--primary"><RefreshCw className="w-4 h-4 mr-2" />Réessayer</button>
    </div>
  );

  if (loading) return (
    <div className="flex items-center justify-center py-12">
      <Loader2 className="w-6 h-6 animate-spin text-cyan-600" /><span className="ml-2 text-gray-500">Chargement...</span>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="settings-card">
        <div className="settings-card-header">
          <div className="settings-card-icon settings-card-icon--blue"><MapPin className="w-4 h-4" /></div>
          <div>
            <h3 className="settings-card-title">Gestion Géographique</h3>
            <p className="settings-card-subtitle">Gérez les secteurs et leurs rues</p>
          </div>
          <button onClick={() => alert('À implémenter')} className="p-2 text-gray-400 hover:text-red-600 rounded-lg"><RefreshCw className="w-4 h-4" /></button>
        </div>

        <div className="border-b border-gray-100 flex px-6">
          <button onClick={() => setActiveTab('sectors')} className={`py-3 px-4 text-sm font-medium border-b-2 flex items-center gap-2 ${activeTab === 'sectors' ? 'border-cyan-500 text-cyan-700' : 'text-gray-500'}`}><Building2 className="w-4 h-4" />Secteurs ({sectors.length})</button>
          <button onClick={() => setActiveTab('streets')} disabled={!selectedSector} className={`py-3 px-4 text-sm font-medium border-b-2 flex items-center gap-2 ${activeTab === 'streets' ? 'border-cyan-500 text-cyan-700' : 'text-gray-500'}`}><MapPin className="w-4 h-4" />Rues {selectedSector ? `(${selectedSector.streets.length})` : ''}</button>
        </div>

        <div className="settings-card-body">
          {activeTab === 'sectors' ? (
            <SectorsTab sectors={sectors} selectedSector={selectedSector} isAddingSector={isAddingSector} setIsAddingSector={setIsAddingSector} newSectorName={newSectorName} setNewSectorName={setNewSectorName} handleAddSector={handleAddSector} editingSector={editingSector} setEditingSector={setEditingSector} handleSelectSector={handleSelectSector} saveEditSector={saveEditSector} handleDeleteSector={handleDeleteSector} />
          ) : (
            <StreetsTab selectedSector={selectedSector} isAddingStreet={isAddingStreet} setIsAddingStreet={setIsAddingStreet} newStreetName={newStreetName} setNewStreetName={setNewStreetName} handleAddStreet={handleAddStreet} editingStreet={editingStreet} setEditingStreet={setEditingStreet} saveEditStreet={saveEditStreet} handleDeleteStreet={handleDeleteStreet} />
          )}
        </div>
      </div>
    </div>
  );
}
