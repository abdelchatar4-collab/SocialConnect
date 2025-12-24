/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect est un logiciel libre : vous pouvez le redistribuer et/ou le modifier selon les termes de la Licence Publique Générale GNU telle que publiée par la Free Software Foundation, soit la version 3 de la licence, soit (à votre convenance) toute version ultérieure.

Ce programme est distribué dans l'espoir qu'il sera utile, mais SANS AUCUNE GARANTIE ; sans même la garantie implicite de COMMERCIALISATION ou d'ADÉQUATION À UN USAGE PARTICULIER. Voir la Licence Publique Générale GNU pour plus de détails.
*/

'use client';

/**
 * DropdownOptionsSettings - Master-Detail Redesign
 * Split-view layout for easier navigation between option categories
 */

import React, { useState, useEffect } from 'react';
import {
  getAllOptionSetsAPI,
  getOptionsByCategoryAPI,
  addOptionAPI,
  updateOptionAPI,
  deleteOptionAPI,
  DropdownOptionAPI,
  DropdownOptionSetAPI
} from '@/services/optionsServiceAPI';
import {
  Pencil,
  Trash2,
  Plus,
  RefreshCw,
  List,
  AlertTriangle,
  Save,
  X,
  Loader2,
  ChevronRight,
  LayoutList,
  Home,
  Shield,
  MoreHorizontal
} from 'lucide-react';

export default function DropdownOptionsSettings() {
  const [optionSets, setOptionSets] = useState<DropdownOptionSetAPI[]>([]);
  const [selectedSet, setSelectedSet] = useState<DropdownOptionSetAPI | null>(null);
  const [detailedOptions, setDetailedOptions] = useState<DropdownOptionAPI[]>([]);
  const [newOption, setNewOption] = useState('');
  const [editingOption, setEditingOption] = useState({ index: -1, value: '', id: '' });
  const [isAdding, setIsAdding] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Charger toutes les options au montage
  useEffect(() => {
    loadOptionSets();
  }, []);

  const loadOptionSets = async () => {
    try {
      setLoading(true);
      setError(null);
      const options = await getAllOptionSetsAPI();
      // Filtrer 'antenne' car elle est gérée ailleurs
      const filteredOptions = options.filter(opt => opt.id !== 'antenne');
      setOptionSets(filteredOptions);

      // Auto-select first if none selected
      if (filteredOptions.length > 0 && !selectedSet) {
        await handleSelectOptionSet(filteredOptions[0].id, filteredOptions);
      }
    } catch (err) {
      setError('Erreur lors du chargement des options');
      console.error('Erreur:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectOptionSet = async (id: string, sets = optionSets) => {
    try {
      // Don't trigger if already selected
      if (selectedSet?.id === id) return;

      const set = sets.find(s => s.id === id);
      if (set) {
        setSelectedSet(set);
        setLoading(true);
        const detailedOpts = await getOptionsByCategoryAPI(id);
        setDetailedOptions(detailedOpts);
        setIsAdding(false);
        setEditingOption({ index: -1, value: '', id: '' });
      }
    } catch (err) {
      setError('Erreur lors du chargement des options détaillées');
      console.error('Erreur:', err);
    } finally {
      setLoading(false);
    }
  };

  const reloadCurrentOptions = async () => {
    if (selectedSet) {
      const detailedOpts = await getOptionsByCategoryAPI(selectedSet.id);
      setDetailedOptions(detailedOpts);
    }
  };

  // Ajout
  const handleAddOption = async () => {
    if (selectedSet && newOption.trim()) {
      try {
        await addOptionAPI(selectedSet.id, newOption);
        await reloadCurrentOptions();
        setNewOption('');
        setIsAdding(false);
      } catch (err) {
        alert('Impossible d\'ajouter cette option.');
      }
    }
  };

  // Édition
  const startEditOption = (index: number) => {
    if (detailedOptions[index]) {
      setEditingOption({
        index,
        value: detailedOptions[index].label,
        id: detailedOptions[index].id
      });
    }
  };

  const saveEditOption = async () => {
    if (selectedSet && editingOption.index >= 0 && editingOption.id) {
      try {
        await updateOptionAPI(selectedSet.id, editingOption.id, editingOption.value);
        await reloadCurrentOptions();
        setEditingOption({ index: -1, value: '', id: '' });
      } catch (err) {
        alert('Impossible de mettre à jour cette option.');
      }
    }
  };

  // Suppression
  const handleDeleteOption = async (optionId: string, optionLabel: string) => {
    if (selectedSet && confirm(`Supprimer "${optionLabel}" ?`)) {
      try {
        await deleteOptionAPI(selectedSet.id, optionId);
        await reloadCurrentOptions();
      } catch (err) {
        alert('Impossible de supprimer cette option.');
      }
    }
  };

  // Réinitialisation
  const handleResetOptions = async () => {
    if (selectedSet && confirm(`Réinitialiser TOUTES les options de "${selectedSet.name}" ?`)) {
      try {
        setLoading(true);
        for (const option of detailedOptions) {
          await deleteOptionAPI(selectedSet.id, option.id);
        }
        await reloadCurrentOptions();
      } catch (err) {
        alert('Erreur lors de la réinitialisation.');
      } finally {
        setLoading(false);
      }
    }
  };

  // Group helpers
  const prevExpOptions = optionSets.filter(s => s.id.startsWith('prevExp'));
  const housingIds = ['typeLogement', 'statutOccupation', 'statutGarantie', 'bailEnregistre', 'dureeContrat', 'typeLitige', 'dureePreavis', 'preavisPour'];
  const housingOptions = optionSets.filter(s => !s.id.startsWith('prevExp') && housingIds.includes(s.id));
  const prestationIds = ['prestation_motifs'];
  const prestationOptions = optionSets.filter(s => prestationIds.includes(s.id));
  const otherOptions = optionSets.filter(s => !s.id.startsWith('prevExp') && !housingIds.includes(s.id) && !prestationIds.includes(s.id));

  // Render Category Item
  const CategoryItem = ({ set }: { set: DropdownOptionSetAPI }) => (
    <button
      onClick={() => handleSelectOptionSet(set.id)}
      className={`w-full flex items-center justify-between p-2.5 rounded-lg text-sm transition-all ${selectedSet?.id === set.id
        ? 'bg-blue-50 text-blue-700 font-medium'
        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
        }`}
    >
      <span className="truncate">{set.name}</span>
      {selectedSet?.id === set.id && <ChevronRight className="w-4 h-4 text-blue-500" />}
    </button>
  );

  return (
    <div className="flex flex-col md:flex-row h-full gap-6 md:h-[600px]">
      {/* LEFT PANE: Master List */}
      <div className="md:w-1/3 flex flex-col border border-gray-200 rounded-xl overflow-hidden bg-white shadow-sm">
        <div className="p-4 bg-gray-50 border-b border-gray-200">
          <h3 className="font-semibold text-gray-800 flex items-center gap-2">
            <LayoutList className="w-4 h-4" />
            Catégories
          </h3>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-6">
          {/* Groupe Prévention */}
          <div>
            <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1.5 px-2">
              <Shield className="w-3 h-3" />
              Prévention Expulsion
            </div>
            <div className="space-y-0.5">
              {prevExpOptions.map(set => <CategoryItem key={set.id} set={set} />)}
            </div>
          </div>

          {/* Groupe Logement */}
          <div>
            <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1.5 px-2">
              <Home className="w-3 h-3" />
              Logement
            </div>
            <div className="space-y-0.5">
              {housingOptions.map(set => <CategoryItem key={set.id} set={set} />)}
            </div>
          </div>

          {/* Groupe Prestations */}
          {prestationOptions.length > 0 && (
            <div>
              <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1.5 px-2">
                <List className="w-3 h-3" />
                Prestations
              </div>
              <div className="space-y-0.5">
                {prestationOptions.map(set => <CategoryItem key={set.id} set={set} />)}
              </div>
            </div>
          )}

          {/* Autres */}
          <div>
            <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1.5 px-2">
              <MoreHorizontal className="w-3 h-3" />
              Autres
            </div>
            <div className="space-y-0.5">
              {otherOptions.map(set => <CategoryItem key={set.id} set={set} />)}
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT PANE: Detail View */}
      <div className="md:w-2/3 flex flex-col border border-gray-200 rounded-xl overflow-hidden bg-white shadow-sm">
        {selectedSet ? (
          <>
            {/* Header */}
            <div className="p-4 border-b border-gray-200 flex justify-between items-start bg-gray-50/50">
              <div>
                <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                  {selectedSet.name}
                  {selectedSet.isSystem && (
                    <span className="bg-blue-100 text-blue-700 text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wide">
                      Système
                    </span>
                  )}
                </h3>
                <p className="text-sm text-gray-500 mt-1">{selectedSet.description}</p>
              </div>
              <button
                onClick={() => setIsAdding(true)}
                className="btn btn-sm bg-blue-600 text-white hover:bg-blue-700 px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Ajouter
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4 bg-gray-50/30">
              {loading && detailedOptions.length === 0 ? (
                <div className="flex justify-center items-center h-40">
                  <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Add Form */}
                  {isAdding && (
                    <div className="p-3 bg-white rounded-lg border border-blue-200 shadow-sm animate-in fade-in slide-in-from-top-2">
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={newOption}
                          onChange={(e) => setNewOption(e.target.value)}
                          placeholder="Nouvelle option..."
                          className="flex-1 px-3 py-2 border border-blue-300 rounded-md focus:ring-2 focus:ring-blue-200 outline-none text-sm"
                          autoFocus
                          onKeyPress={(e) => e.key === 'Enter' && handleAddOption()}
                        />
                        <button onClick={handleAddOption} className="p-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                          <Plus className="w-4 h-4" />
                        </button>
                        <button onClick={() => setIsAdding(false)} className="p-2 text-gray-500 hover:bg-gray-100 rounded-md">
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Options List */}
                  <div className="bg-white rounded-lg border border-gray-200 divide-y divide-gray-100 shadow-sm">
                    {detailedOptions.length === 0 ? (
                      <div className="p-8 text-center text-gray-400 italic">
                        Aucune option disponible
                      </div>
                    ) : (
                      detailedOptions.map((option, index) => (
                        <div key={option.id} className="p-3 flex items-center justify-between hover:bg-blue-50/50 group transition-colors">
                          {editingOption.index === index ? (
                            <div className="flex-1 flex gap-2">
                              <input
                                type="text"
                                value={editingOption.value}
                                onChange={(e) => setEditingOption({ ...editingOption, value: e.target.value })}
                                className="flex-1 px-2 py-1 border rounded text-sm"
                                autoFocus
                                onKeyPress={(e) => e.key === 'Enter' && saveEditOption()}
                              />
                              <button onClick={saveEditOption} className="text-green-600 p-1 hover:bg-green-50 rounded">
                                <Save className="w-4 h-4" />
                              </button>
                              <button onClick={() => setEditingOption({ index: -1, value: '', id: '' })} className="text-gray-400 p-1 hover:bg-gray-100 rounded">
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          ) : (
                            <>
                              <span className="text-sm text-gray-700 font-medium ml-2">{option.label}</span>
                              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                  onClick={() => startEditOption(index)}
                                  className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded"
                                >
                                  <Pencil className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => handleDeleteOption(option.id, option.label)}
                                  className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-3 bg-gray-50 border-t border-gray-200 flex justify-end">
              <button
                onClick={handleResetOptions}
                className="text-xs text-red-500 hover:text-red-700 hover:underline flex items-center gap-1"
              >
                <RefreshCw className="w-3 h-3" />
                Réinitialiser par défaut
              </button>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-gray-400">
            <LayoutList className="w-12 h-12 mb-3 opacity-20" />
            <p>Sélectionnez une catégorie à gauche</p>
          </div>
        )}
      </div>
    </div>
  );
}
