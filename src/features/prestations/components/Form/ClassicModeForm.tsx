/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect - Classic Mode Form for Prestations
*/

import React from 'react';
import { Button } from '@/components/ui/Button';
import { FULL_DAY_MOTIFS } from '../../constants/prestationFormConstants';

interface ClassicModeFormProps {
    motif: string;
    setMotif: (m: string) => void;
    heureDebut: string;
    setHeureDebut: (h: string) => void;
    heureFin: string;
    setHeureFin: (h: string) => void;
    pause: number;
    setPause: (p: number) => void;
    activityMotifs: any[];
    handleClassicSubmit: (e: React.FormEvent) => void;
    isSaving: boolean;
    isRangeMode: boolean;
    progressCount: number;
}

export const ClassicModeForm: React.FC<ClassicModeFormProps> = ({
    motif, setMotif, heureDebut, setHeureDebut, heureFin, setHeureFin,
    pause, setPause, activityMotifs, handleClassicSubmit, isSaving,
    isRangeMode, progressCount
}) => {
    return (
        <form onSubmit={handleClassicSubmit} className="space-y-4">
            <div>
                <label className="text-xs font-bold text-gray-400 uppercase mb-1 block">Motif</label>
                <select value={motif} onChange={(e) => setMotif(e.target.value)}
                    className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-primary-500/20 outline-none cursor-pointer">
                    <optgroup label="Présence">
                        <option value="Présence">Présence (bureau)</option>
                        <option value="Télétravail">Télétravail</option>
                    </optgroup>
                    <optgroup label="Congés & Absences">
                        <option value="Congé VA">Congé VA (vacances annuelles)</option>
                        <option value="Congé CH">Congé CH</option>
                        <option value="Maladie">Maladie</option>
                        <option value="1 jour sans certificat">1 jour sans certificat (max 3/an)</option>
                        <option value="Jour férié">Jour férié</option>
                    </optgroup>
                    <optgroup label="Autres">
                        <option value="Formation">Formation</option>
                        <option value="Réunion externe">Réunion externe</option>
                        <option value="Heures supp">Heures supp</option>
                    </optgroup>
                    {activityMotifs.length > 0 && (
                        <optgroup label="Personnalisé">
                            {activityMotifs.map(opt => (
                                <option key={opt.value} value={opt.label}>{opt.label}</option>
                            ))}
                        </optgroup>
                    )}
                </select>
            </div>

            {!FULL_DAY_MOTIFS.includes(motif) ? (
                <div className="grid grid-cols-3 gap-3">
                    <div>
                        <label className="text-xs font-bold text-gray-400 uppercase mb-1 block">Début</label>
                        <input type="time" value={heureDebut} onChange={(e) => setHeureDebut(e.target.value)}
                            className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold text-center focus:ring-2 focus:ring-primary-500/20 outline-none" required />
                    </div>
                    <div>
                        <label className="text-xs font-bold text-gray-400 uppercase mb-1 block">Fin</label>
                        <input type="time" value={heureFin} onChange={(e) => setHeureFin(e.target.value)}
                            className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold text-center focus:ring-2 focus:ring-primary-500/20 outline-none" required />
                    </div>
                    <div>
                        <label className="text-xs font-bold text-gray-400 uppercase mb-1 block">Pause</label>
                        <input type="number" value={pause} min={30} step={5} onChange={(e) => setPause(Number(e.target.value))}
                            className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold text-center focus:ring-2 focus:ring-primary-500/20 outline-none" required />
                    </div>
                </div>
            ) : (
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-center">
                    <p className="text-sm font-bold text-amber-700">📅 Jour complet</p>
                    <p className="text-xs text-amber-600 mt-1">Durée standard : 7h30 (450 min)</p>
                </div>
            )}

            <Button type="submit" loading={isSaving}
                className="w-full h-12 rounded-xl font-bold text-white shadow-lg bg-blue-600 hover:bg-blue-700">
                {isSaving && isRangeMode ? `ENCODAGE... (${progressCount})` : isRangeMode ? 'ENCODER LA PÉRIODE' : 'ENREGISTRER'}
            </Button>
        </form>
    );
};
