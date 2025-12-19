/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect est un logiciel libre : vous pouvez le redistribuer et/ou le modifier selon les termes de la Licence Publique Générale GNU telle que publiée par la Free Software Foundation, soit la version 3 de la licence, soit (à votre convenance) toute version ultérieure.

Ce programme est distribué dans l'espoir qu'il sera utile, mais SANS AUCUNE GARANTIE ; sans même la garantie implicite de COMMERCIALISATION ou d'ADÉQUATION À UN USAGE PARTICULIER. Voir la Licence Publique Générale GNU pour plus de détails.
*/

'use client';

/**
 * GeographicalSettings - Modern redesigned version
 * Manage sectors and streets configuration
 */

import React, { useState, useEffect } from 'react';
import { Pencil, Trash2, Plus, RefreshCw, MapPin, Building2, Save, X, Loader2 } from 'lucide-react';
import { useGeographicalAPI, type GeographicalSector } from '@/hooks/useGeographicalAPI';

export default function GeographicalSettings() {
  const {
    sectors,
    loading,
    error,
    addSector,
    updateSector,
    deleteSector,
    addStreet,
    updateStreet,
    deleteStreet,
    fetchSectors
  } = useGeographicalAPI();

  const [selectedSector, setSelectedSector] = useState<GeographicalSector | null>(null);
  const [newSectorName, setNewSectorName] = useState('');
  const [newStreetName, setNewStreetName] = useState('');
  const [editingSector, setEditingSector] = useState({ index: -1, value: '' });
  const [editingStreet, setEditingStreet] = useState({ index: -1, value: '' });
  const [isAddingSector, setIsAddingSector] = useState(false);
  const [isAddingStreet, setIsAddingStreet] = useState(false);
  const [activeTab, setActiveTab] = useState<'sectors' | 'streets'>('sectors');

  // Sélectionner le premier secteur par défaut
  useEffect(() => {
    if (sectors.length > 0 && !selectedSector) {
      setSelectedSector(sectors[0]);
    }
  }, [sectors, selectedSector]);

  // Gérer la sélection d'un secteur
  const handleSelectSector = (sectorName: string) => {
    const sector = sectors.find(s => s.name === sectorName);
    if (sector) {
      setSelectedSector(sector);
      setIsAddingSector(false);
      setIsAddingStreet(false);
      setEditingSector({ index: -1, value: '' });
      setEditingStreet({ index: -1, value: '' });
      setActiveTab('streets');
    }
  };

  // Ajouter un nouveau secteur
  const handleAddSector = async () => {
    if (newSectorName.trim()) {
      const success = await addSector(newSectorName.trim());
      if (success) {
        const newSector = sectors.find(s => s.name === newSectorName.trim());
        if (newSector) setSelectedSector(newSector);
        setNewSectorName('');
        setIsAddingSector(false);
      } else {
        alert("Impossible d'ajouter ce secteur. Il existe peut-être déjà.");
      }
    }
  };

  // Sauvegarder un secteur modifié
  const saveEditSector = async () => {
    if (editingSector.index >= 0) {
      const sector = sectors[editingSector.index];
      const success = await updateSector(sector.id, editingSector.value.trim());

      if (success) {
        const updatedSector = sectors.find(s => s.name === editingSector.value.trim());
        if (updatedSector) setSelectedSector(updatedSector);
        setEditingSector({ index: -1, value: '' });
      } else {
        alert("Impossible de mettre à jour ce secteur.");
      }
    }
  };

  // Supprimer un secteur
  const handleDeleteSector = async (sectorId: string, sectorName: string) => {
    if (confirm(`Êtes-vous sûr de vouloir supprimer le secteur "${sectorName}" et toutes ses rues ?`)) {
      const success = await deleteSector(sectorId);
      if (success) {
        if (selectedSector?.id === sectorId) {
          setSelectedSector(sectors.length > 1 ? sectors[0] : null);
        }
      } else {
        alert("Impossible de supprimer ce secteur.");
      }
    }
  };

  // Ajouter une nouvelle rue
  const handleAddStreet = async () => {
    if (newStreetName.trim() && selectedSector) {
      const success = await addStreet(selectedSector.id, newStreetName.trim());
      if (success) {
        setNewStreetName('');
        setIsAddingStreet(false);
      } else {
        alert("Impossible d'ajouter cette rue. Elle existe peut-être déjà dans ce secteur.");
      }
    }
  };

  // Modifier une rue
  const saveEditStreet = async () => {
    if (editingStreet.index >= 0 && selectedSector) {
      const street = selectedSector.streets[editingStreet.index];
      const success = await updateStreet(street.id, editingStreet.value.trim());

      if (success) {
        setEditingStreet({ index: -1, value: '' });
      } else {
        alert("Impossible de mettre à jour cette rue.");
      }
    }
  };

  // Supprimer une rue
  const handleDeleteStreet = async (streetId: string, streetName: string) => {
    if (confirm(`Êtes-vous sûr de vouloir supprimer la rue "${streetName}" ?`)) {
      const success = await deleteStreet(streetId);
      if (!success) {
        alert("Impossible de supprimer cette rue.");
      }
    }
  };

  // Réinitialiser les données
  const handleResetData = async () => {
    if (confirm('Êtes-vous sûr de vouloir réinitialiser toutes les données géographiques ?')) {
      alert('Fonctionnalité de réinitialisation à implémenter');
    }
  };

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-md text-center">
        <p className="text-red-800 mb-2">Erreur : {error}</p>
        <button
          onClick={fetchSectors}
          className="settings-btn settings-btn--primary"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Réessayer
        </button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-cyan-600" />
        <span className="ml-2 text-gray-500">Chargement des données géographiques...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header & Tabs */}
      <div className="settings-card">
        <div className="settings-card-header">
          <div className="settings-card-icon settings-card-icon--blue">
            <MapPin className="w-4 h-4" />
          </div>
          <div>
            <h3 className="settings-card-title">Gestion Géographique</h3>
            <p className="settings-card-subtitle">Gérez les secteurs (communes) et leurs rues associées</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleResetData}
              className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              title="Réinitialiser"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Custom Tabs */}
        <div className="border-b border-gray-100 flex px-6">
          <button
            onClick={() => setActiveTab('sectors')}
            className={`py-3 px-4 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'sectors'
                ? 'border-cyan-500 text-cyan-700'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-200'
              }`}
          >
            <Building2 className="w-4 h-4" />
            Secteurs ({sectors.length})
          </button>
          <button
            onClick={() => setActiveTab('streets')}
            className={`py-3 px-4 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'streets'
                ? 'border-cyan-500 text-cyan-700'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-200'
              }`}
            disabled={!selectedSector}
          >
            <MapPin className="w-4 h-4" />
            Rues {selectedSector ? `(${selectedSector.streets.length})` : ''}
          </button>
        </div>

        <div className="settings-card-body">
          {/* SECTORS TAB */}
          {activeTab === 'sectors' && (
            <div className="space-y-4 animate-in fade-in slide-in-from-left-2 duration-300">
              <div className="flex justify-between items-center mb-4">
                <h4 className="text-sm font-medium text-gray-700">Liste des secteurs</h4>
                <button
                  onClick={() => setIsAddingSector(true)}
                  className="settings-btn settings-btn--primary"
                >
                  <Plus className="w-4 h-4" />
                  Ajouter un secteur
                </button>
              </div>

              {/* Add form */}
              {isAddingSector && (
                <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 mb-4 animate-in slide-in-from-top-2">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newSectorName}
                      onChange={(e) => setNewSectorName(e.target.value)}
                      placeholder="Nom du nouveau secteur"
                      className="settings-input"
                      onKeyPress={(e) => e.key === 'Enter' && handleAddSector()}
                      autoFocus
                    />
                    <button
                      onClick={handleAddSector}
                      disabled={!newSectorName.trim()}
                      className="settings-btn settings-btn--primary"
                    >
                      Ajouter
                    </button>
                    <button
                      onClick={() => {
                        setIsAddingSector(false);
                        setNewSectorName('');
                      }}
                      className="settings-btn settings-btn--secondary"
                    >
                      Annuler
                    </button>
                  </div>
                </div>
              )}

              {/* Sectors List */}
              <div className="grid gap-2">
                {sectors.map((sector, index) => (
                  <div
                    key={sector.id}
                    className={`p-3 border rounded-lg cursor-pointer transition-all ${selectedSector?.id === sector.id
                        ? 'border-cyan-500 bg-cyan-50 ring-1 ring-cyan-200'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                    onClick={() => handleSelectSector(sector.name)}
                  >
                    <div className="flex items-center justify-between">
                      {editingSector.index === index ? (
                        <div className="flex-1 flex gap-2 items-center" onClick={(e) => e.stopPropagation()}>
                          <input
                            type="text"
                            value={editingSector.value}
                            onChange={(e) => setEditingSector({ ...editingSector, value: e.target.value })}
                            className="settings-input h-8"
                            onKeyPress={(e) => e.key === 'Enter' && saveEditSector()}
                            autoFocus
                          />
                          <button
                            onClick={saveEditSector}
                            className="p-1.5 text-green-600 hover:bg-green-100 rounded transition-colors"
                          >
                            <Save className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setEditingSector({ index: -1, value: '' })}
                            className="p-1.5 text-gray-500 hover:bg-gray-100 rounded transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <>
                          <div className="flex items-center gap-2">
                            <Building2 className={`w-4 h-4 ${selectedSector?.id === sector.id ? 'text-cyan-600' : 'text-gray-400'}`} />
                            <span className={`font-medium ${selectedSector?.id === sector.id ? 'text-cyan-900' : 'text-gray-700'}`}>
                              {sector.name}
                            </span>
                            <span className="text-xs px-2 py-0.5 rounded-full bg-white border border-gray-200 text-gray-500">
                              {sector.streets.length} rues
                            </span>
                          </div>
                          <div className="flex gap-1">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setEditingSector({ index, value: sector.name });
                              }}
                              className="p-1.5 text-gray-400 hover:text-cyan-600 hover:bg-white rounded transition-colors"
                            >
                              <Pencil className="w-4 h-4" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteSector(sector.id, sector.name);
                              }}
                              className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-white rounded transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* STREETS TAB */}
          {activeTab === 'streets' && selectedSector && (
            <div className="space-y-4 animate-in fade-in slide-in-from-right-2 duration-300">
              <div className="flex justify-between items-center mb-4">
                <h4 className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  Rues de <span className="font-bold text-cyan-700">{selectedSector.name}</span>
                </h4>
                <button
                  onClick={() => setIsAddingStreet(true)}
                  className="settings-btn settings-btn--primary"
                >
                  <Plus className="w-4 h-4" />
                  Ajouter une rue
                </button>
              </div>

              {/* Add form */}
              {isAddingStreet && (
                <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 mb-4 animate-in slide-in-from-top-2">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newStreetName}
                      onChange={(e) => setNewStreetName(e.target.value)}
                      placeholder="Nom de la nouvelle rue"
                      className="settings-input"
                      onKeyPress={(e) => e.key === 'Enter' && handleAddStreet()}
                      autoFocus
                    />
                    <button
                      onClick={handleAddStreet}
                      disabled={!newStreetName.trim()}
                      className="settings-btn settings-btn--primary"
                    >
                      Ajouter
                    </button>
                    <button
                      onClick={() => {
                        setIsAddingStreet(false);
                        setNewStreetName('');
                      }}
                      className="settings-btn settings-btn--secondary"
                    >
                      Annuler
                    </button>
                  </div>
                </div>
              )}

              {/* Streets List */}
              <div className="border border-gray-200 rounded-lg overflow-hidden bg-white divide-y divide-gray-100 max-h-[500px] overflow-y-auto">
                {selectedSector.streets.length === 0 ? (
                  <div className="p-8 text-center text-gray-500 italic bg-gray-50">
                    Aucune rue dans ce secteur. Ajoutez-en une !
                  </div>
                ) : (
                  selectedSector.streets.map((street, index) => (
                    <div
                      key={street.id}
                      className="p-3 hover:bg-gray-50 transition-colors group"
                    >
                      <div className="flex items-center justify-between">
                        {editingStreet.index === index ? (
                          <div className="flex-1 flex gap-2 items-center">
                            <input
                              type="text"
                              value={editingStreet.value}
                              onChange={(e) => setEditingStreet({ ...editingStreet, value: e.target.value })}
                              className="settings-input h-8"
                              onKeyPress={(e) => e.key === 'Enter' && saveEditStreet()}
                              autoFocus
                            />
                            <button
                              onClick={saveEditStreet}
                              className="p-1.5 text-green-600 hover:bg-green-100 rounded transition-colors"
                            >
                              <Save className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setEditingStreet({ index: -1, value: '' })}
                              className="p-1.5 text-gray-500 hover:bg-gray-100 rounded transition-colors"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <>
                            <span className="text-sm text-gray-700 ml-1">{street.name}</span>
                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                onClick={() => setEditingStreet({ index, value: street.name })}
                                className="p-1.5 text-gray-400 hover:text-cyan-600 hover:bg-cyan-50 rounded-lg transition-colors"
                              >
                                <Pencil className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteStreet(street.id, street.name)}
                                className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
