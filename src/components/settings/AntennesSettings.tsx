/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect est un logiciel libre : vous pouvez le redistribuer et/ou le modifier selon les termes de la Licence Publique Générale GNU telle que publiée par la Free Software Foundation, soit la version 3 de la licence, soit (à votre convenance) toute version ultérieure.

Ce programme est distribué dans l'espoir qu'il sera utile, mais SANS AUCUNE GARANTIE ; sans même la garantie implicite de COMMERCIALISATION ou d'ADÉQUATION À UN USAGE PARTICULIER. Voir la Licence Publique Générale GNU pour plus de détails.
*/

'use client';

/**
 * AntennesSettings - Modern redesigned version
 * Manage antenna locations
 */

import React, { useState, useEffect } from 'react';
import { useDropdownOptionsAPI } from '@/hooks/useDropdownOptionsAPI';
import { addOptionAPI, updateOptionAPI, deleteOptionAPI } from '@/services/optionsServiceAPI';
import { Pencil, Trash2, Plus, RefreshCw, MapPin, Save, X, Loader2 } from 'lucide-react';
import { DROPDOWN_CATEGORIES } from '@/constants/dropdownCategories';

export default function AntennesSettings() {
  const { options: antennesOptions, loading, error, refetch } = useDropdownOptionsAPI(DROPDOWN_CATEGORIES.ANTENNE);
  const [antennes, setAntennes] = useState<string[]>([]);
  const [newAntenne, setNewAntenne] = useState('');
  const [editingAntenne, setEditingAntenne] = useState({ index: -1, value: '' });
  const [isAdding, setIsAdding] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Mettre à jour les antennes quand les options changent
  useEffect(() => {
    setAntennes(antennesOptions.map(opt => opt.value));
  }, [antennesOptions]);

  // Fonction pour afficher un message temporaire
  const showMessage = (message: string, isError: boolean = false) => {
    if (isError) {
      setErrorMessage(message);
      setSuccessMessage('');
    } else {
      setSuccessMessage(message);
      setErrorMessage('');
    }

    setTimeout(() => {
      setSuccessMessage('');
      setErrorMessage('');
    }, 3000);
  };

  // Ajouter une nouvelle antenne
  const handleAddAntenne = async () => {
    if (newAntenne.trim()) {
      try {
        await addOptionAPI('antenne', newAntenne.trim());
        setNewAntenne('');
        setIsAdding(false);
        await refetch();
        showMessage('Antenne ajoutée avec succès');
      } catch (error: any) {
        console.error('Erreur lors de l\'ajout de l\'antenne:', error);
        const errorMessage = error.message || 'Erreur lors de l\'ajout de l\'antenne';
        showMessage(errorMessage, true);
      }
    }
  };

  // Modifier une antenne
  const handleUpdateAntenne = async () => {
    if (editingAntenne.value.trim() && editingAntenne.index >= 0) {
      try {
        const optionToUpdate = antennesOptions[editingAntenne.index];
        await updateOptionAPI('antenne', optionToUpdate.id, editingAntenne.value.trim());
        setEditingAntenne({ index: -1, value: '' });
        await refetch();
        showMessage('Antenne modifiée avec succès');
      } catch (error) {
        showMessage('Erreur lors de la modification de l\'antenne', true);
      }
    }
  };

  // Supprimer une antenne
  const handleDeleteAntenne = async (index: number) => {
    if (window.confirm(`Êtes-vous sûr de vouloir supprimer l'antenne "${antennesOptions[index]?.value}" ?`)) {
      try {
        const optionToDelete = antennesOptions[index];
        await deleteOptionAPI('antenne', optionToDelete.id);
        await refetch();
        showMessage('Antenne supprimée avec succès');
      } catch (error) {
        showMessage('Erreur lors de la suppression de l\'antenne', true);
      }
    }
  };

  // Commencer l'édition d'une antenne
  const startEditAntenne = (index: number, value: string) => {
    setEditingAntenne({ index, value });
  };

  // Annuler l'édition
  const cancelEdit = () => {
    setEditingAntenne({ index: -1, value: '' });
  };

  // Réinitialiser les antennes aux valeurs par défaut
  const handleResetAntennes = async () => {
    if (window.confirm('Êtes-vous sûr de vouloir réinitialiser les antennes aux valeurs par défaut ?')) {
      try {
        // Supprimer toutes les antennes actuelles
        for (const option of antennesOptions) {
          await deleteOptionAPI('antenne', option.id);
        }

        // Ajouter les antennes par défaut
        const defaultAntennes = ['Antenne Centre', 'Antenne Cureghem', 'Antenne Bizet', 'Antenne Ouest', 'PILDA'];
        for (const antenne of defaultAntennes) {
          await addOptionAPI('antenne', antenne);
        }

        await refetch();
        showMessage('Antennes réinitialisées avec succès');
      } catch (error) {
        showMessage('Erreur lors de la réinitialisation des antennes', true);
      }
    }
  };

  if (loading && antennes.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-cyan-600" />
        <span className="ml-2 text-gray-500">Chargement...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="settings-card">
        <div className="settings-card-header">
          <div className="settings-card-icon settings-card-icon--blue">
            <MapPin className="w-4 h-4" />
          </div>
          <div>
            <h3 className="settings-card-title">Gestion des antennes</h3>
            <p className="settings-card-subtitle">Localisations disponibles pour les dossiers usagers</p>
          </div>
          <button
            onClick={handleResetAntennes}
            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
            title="Réinitialiser par défaut"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        <div className="settings-card-body space-y-4">
          {/* Messages de succès/erreur */}
          {successMessage && (
            <div className="p-3 bg-green-50 text-green-700 rounded-lg border border-green-100 text-sm animate-in fade-in slide-in-from-top-2">
              {successMessage}
            </div>
          )}

          {errorMessage && (
            <div className="p-3 bg-red-50 text-red-700 rounded-lg border border-red-100 text-sm animate-in fade-in slide-in-from-top-2">
              {errorMessage}
            </div>
          )}

          {/* Formulaire d'ajout */}
          <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
            <h4 className="text-xs uppercase text-gray-500 font-semibold mb-3">Ajouter une antenne</h4>
            <div className="flex gap-2">
              <input
                type="text"
                value={newAntenne}
                onChange={(e) => setNewAntenne(e.target.value)}
                placeholder="Nom de l'antenne"
                className="settings-input flex-1"
                onKeyPress={(e) => e.key === 'Enter' && handleAddAntenne()}
              />
              <button
                onClick={handleAddAntenne}
                disabled={!newAntenne.trim()}
                className="settings-btn settings-btn--primary"
              >
                <Plus className="w-4 h-4" />
                Ajouter
              </button>
            </div>
          </div>

          {/* Liste des antennes */}
          <div className="border border-gray-200 rounded-lg overflow-hidden bg-white divide-y divide-gray-100">
            {antennes.filter(a => a !== '').length === 0 ? (
              <div className="p-8 text-center text-gray-500 italic">
                Aucune antenne configurée
              </div>
            ) : (
              antennes.filter(a => a !== '').map((antenne, index) => (
                <div key={`${antenne}-${index}`} className="p-3 hover:bg-gray-50 transition-colors group">
                  <div className="flex items-center justify-between">
                    {editingAntenne.index === index ? (
                      <div className="flex-1 flex gap-2 items-center">
                        <input
                          type="text"
                          value={editingAntenne.value}
                          onChange={(e) => setEditingAntenne({ ...editingAntenne, value: e.target.value })}
                          className="settings-input h-8"
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') handleUpdateAntenne();
                            if (e.key === 'Escape') cancelEdit();
                          }}
                          autoFocus
                        />
                        <button
                          onClick={handleUpdateAntenne}
                          className="p-1.5 text-green-600 hover:bg-green-100 rounded transition-colors"
                        >
                          <Save className="w-4 h-4" />
                        </button>
                        <button
                          onClick={cancelEdit}
                          className="p-1.5 text-gray-500 hover:bg-gray-100 rounded transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded bg-blue-50 text-blue-600 flex items-center justify-center">
                            <MapPin className="w-4 h-4" />
                          </div>
                          <span className="text-sm font-medium text-gray-900">{antenne}</span>
                        </div>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => startEditAntenne(index, antenne)}
                            className="p-2 text-gray-400 hover:text-cyan-600 hover:bg-cyan-50 rounded-lg transition-colors"
                            title="Modifier"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteAntenne(index)}
                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Supprimer"
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
      </div>
    </div>
  );
}
