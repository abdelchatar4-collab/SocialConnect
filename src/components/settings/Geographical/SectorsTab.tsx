/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect - Sectors Management Tab
*/

import React from 'react';
import { Plus, Building2, Pencil, Trash2, Save, X } from 'lucide-react';
import { GeographicalSector } from '@/hooks/useGeographicalAPI';

interface SectorsTabProps {
    sectors: GeographicalSector[];
    selectedSector: GeographicalSector | null;
    isAddingSector: boolean;
    setIsAddingSector: (val: boolean) => void;
    newSectorName: string;
    setNewSectorName: (val: string) => void;
    handleAddSector: () => void;
    editingSector: { index: number; value: string };
    setEditingSector: (val: { index: number; value: string }) => void;
    handleSelectSector: (name: string) => void;
    saveEditSector: () => void;
    handleDeleteSector: (id: string, name: string) => void;
}

export const SectorsTab: React.FC<SectorsTabProps> = ({
    sectors,
    selectedSector,
    isAddingSector,
    setIsAddingSector,
    newSectorName,
    setNewSectorName,
    handleAddSector,
    editingSector,
    setEditingSector,
    handleSelectSector,
    saveEditSector,
    handleDeleteSector
}) => {
    return (
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
    );
};
