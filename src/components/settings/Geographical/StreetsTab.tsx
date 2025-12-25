/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect - Streets Management Tab
*/

import React from 'react';
import { Plus, Pencil, Trash2, Save, X } from 'lucide-react';
import { GeographicalSector } from '@/hooks/useGeographicalAPI';

interface StreetsTabProps {
    selectedSector: GeographicalSector | null;
    isAddingStreet: boolean;
    setIsAddingStreet: (val: boolean) => void;
    newStreetName: string;
    setNewStreetName: (val: string) => void;
    handleAddStreet: () => void;
    editingStreet: { index: number; value: string };
    setEditingStreet: (val: { index: number; value: string }) => void;
    saveEditStreet: () => void;
    handleDeleteStreet: (id: string, name: string) => void;
}

export const StreetsTab: React.FC<StreetsTabProps> = ({
    selectedSector,
    isAddingStreet,
    setIsAddingStreet,
    newStreetName,
    setNewStreetName,
    handleAddStreet,
    editingStreet,
    setEditingStreet,
    saveEditStreet,
    handleDeleteStreet
}) => {
    if (!selectedSector) return null;

    return (
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
    );
};
