/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect - Quick Mode Form for Prestations
*/

import React from 'react';
import { Button } from '@/components/ui/Button';
import { QUICK_PRESETS } from '../../constants/prestationFormConstants';
import { formatDurationHuman } from '@/utils/prestationUtils';

interface QuickModeFormProps {
    selectedPreset: string;
    setSelectedPreset: (id: string) => void;
    breakdown: any;
    handleQuickSubmit: () => void;
    isSaving: boolean;
    isRangeMode: boolean;
    progressCount: number;
}

export const QuickModeForm: React.FC<QuickModeFormProps> = ({
    selectedPreset, setSelectedPreset, breakdown, handleQuickSubmit,
    isSaving, isRangeMode, progressCount
}) => {
    const currentPreset = QUICK_PRESETS.find(p => p.id === selectedPreset) || QUICK_PRESETS[0];

    return (
        <div className="space-y-4">
            <div>
                <label className="text-xs font-bold text-gray-400 uppercase mb-1 block">Modèle</label>
                <select
                    value={selectedPreset}
                    onChange={(e) => setSelectedPreset(e.target.value)}
                    className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-primary-500/20 outline-none cursor-pointer"
                >
                    {QUICK_PRESETS.map(p => (
                        <option key={p.id} value={p.id}>{p.name} ({p.start} - {p.end})</option>
                    ))}
                </select>
            </div>

            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
                <div className="flex justify-between text-sm text-emerald-700 mb-2">
                    <span>Horaire</span>
                    <span className="font-bold">{currentPreset.start} - {currentPreset.end}</span>
                </div>
                <div className="flex justify-between text-sm text-emerald-700 mb-2">
                    <span>Pause</span>
                    <span className="font-bold">{currentPreset.pause} min</span>
                </div>
                <div className="flex justify-between text-sm text-emerald-700">
                    <span>Motif</span>
                    <span className="font-bold">{currentPreset.motif}</span>
                </div>
                <div className="mt-3 pt-3 border-t border-emerald-200 flex justify-between">
                    <span className="text-emerald-700 font-bold">Durée nette</span>
                    <span className="text-xl font-black text-emerald-800">{formatDurationHuman(breakdown.totalMinutes)}</span>
                </div>
            </div>

            <Button
                onClick={handleQuickSubmit}
                loading={isSaving}
                className="w-full h-12 rounded-xl font-bold text-white shadow-lg bg-emerald-600 hover:bg-emerald-700"
            >
                {isSaving && isRangeMode ? `ENCODAGE... (${progressCount})` : isRangeMode ? '⚡ ENCODER LA PÉRIODE' : '⚡ ENREGISTRER'}
            </Button>
        </div>
    );
};
