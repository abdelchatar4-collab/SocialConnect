/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect - Prestation Form with Quick & Classic Modes
*/

"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { usePrestations } from '@/contexts/PrestationContext';
import { useAdmin } from '@/contexts/AdminContext';
import { Button } from '@/components/ui/Button';
import { ClockIcon, XMarkIcon, CalendarDaysIcon, BoltIcon, AdjustmentsHorizontalIcon, SparklesIcon } from '@heroicons/react/24/outline';
import { calculatePrestationBreakdown, formatDurationHuman } from '@/utils/prestationUtils';
import { useDropdownOptionsAPI } from '@/hooks/useDropdownOptionsAPI';
import { PrestationHelpModal } from './PrestationHelpModal';
import { DROPDOWN_CATEGORIES } from '@/constants/dropdownCategories';

// Preset templates for quick registration
const QUICK_PRESETS = [
    { id: 'standard', name: 'Journée standard', start: '09:00', end: '17:00', pause: 30, motif: 'Présence' },
    { id: 'teletravail', name: 'Télétravail', start: '09:00', end: '17:00', pause: 30, motif: 'Télétravail' },
    { id: 'matin', name: 'Matin uniquement', start: '09:00', end: '12:30', pause: 0, motif: 'Présence' },
    { id: 'aprem', name: 'Après-midi', start: '13:00', end: '17:00', pause: 0, motif: 'Présence' },
    { id: 'conge_va', name: 'Congé VA', start: '09:00', end: '17:00', pause: 30, motif: 'Congé VA' },
    { id: 'conge_ch', name: 'Congé CH', start: '09:00', end: '17:00', pause: 30, motif: 'Congé CH' },
    { id: 'maladie', name: 'Maladie', start: '09:00', end: '17:00', pause: 30, motif: 'Maladie' },
    { id: 'formation', name: 'Formation', start: '09:00', end: '17:00', pause: 30, motif: 'Formation' },
];

export const PrestationForm: React.FC = () => {
    const { isPrestationOpening, setIsPrestationOpening, addPrestation, horaireHabituel, prestations } = usePrestations();
    const { primaryColor } = useAdmin();
    const { options: activityMotifs } = useDropdownOptionsAPI(DROPDOWN_CATEGORIES.PRESTATION_MOTIFS);

    // Mode: 'quick' or 'classic'
    const [mode, setMode] = useState<'quick' | 'classic'>('quick');
    const [selectedPreset, setSelectedPreset] = useState('standard');

    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [dateEnd, setDateEnd] = useState(new Date().toISOString().split('T')[0]);
    const [isRangeMode, setIsRangeMode] = useState(false);
    const [heureDebut, setHeureDebut] = useState(horaireHabituel.start);
    const [heureFin, setHeureFin] = useState(horaireHabituel.end);
    const [pause, setPause] = useState(horaireHabituel.pause);
    const [motif, setMotif] = useState("Présence");
    const [isSaving, setIsSaving] = useState(false);
    const [progressCount, setProgressCount] = useState(0);
    const [isHelpOpen, setIsHelpOpen] = useState(false);

    // Get selected preset details
    const currentPreset = QUICK_PRESETS.find(p => p.id === selectedPreset) || QUICK_PRESETS[0];

    // Get recent prestations (last 5)
    const recentPrestations = useMemo(() => {
        return [...prestations]
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
            .slice(0, 5);
    }, [prestations]);

    useEffect(() => {
        if (isPrestationOpening) {
            setHeureDebut(horaireHabituel.start);
            setHeureFin(horaireHabituel.end);
            setPause(Math.max(30, horaireHabituel.pause));
        }
    }, [isPrestationOpening, horaireHabituel]);

    // Holidays 2026
    const HOLIDAYS_2026 = [
        '2026-01-01', '2026-01-02', '2026-04-06', '2026-05-01',
        '2026-05-14', '2026-05-15', '2026-05-25', '2026-07-20',
        '2026-07-21', '2026-08-17', '2026-09-15', '2026-11-02',
        '2026-11-11', '2026-12-24', '2026-12-25', '2026-12-31',
    ];
    const isHoliday = (dateStr: string): boolean => HOLIDAYS_2026.includes(dateStr);

    const handleQuickSubmit = async () => {
        setIsSaving(true);

        if (isRangeMode) {
            const startDate = new Date(date);
            const endDate = new Date(dateEnd);
            const dates: string[] = [];

            const current = new Date(startDate);
            while (current <= endDate) {
                const dayOfWeek = current.getDay();
                const dateStr = current.toISOString().split('T')[0];
                if (dayOfWeek !== 0 && dayOfWeek !== 6 && !isHoliday(dateStr)) {
                    dates.push(dateStr);
                }
                current.setDate(current.getDate() + 1);
            }

            setProgressCount(0);
            let successCount = 0;
            for (let i = 0; i < dates.length; i++) {
                const success = await addPrestation({
                    date: dates[i],
                    heureDebut: currentPreset.start,
                    heureFin: currentPreset.end,
                    pause: currentPreset.pause,
                    motif: currentPreset.motif,
                    commentaire: ''
                });
                if (success) successCount++;
                setProgressCount(i + 1);
            }
            if (successCount > 0) setIsPrestationOpening(false);
        } else {
            const success = await addPrestation({
                date,
                heureDebut: currentPreset.start,
                heureFin: currentPreset.end,
                pause: currentPreset.pause,
                motif: currentPreset.motif,
                commentaire: ''
            });
            if (success) setIsPrestationOpening(false);
        }
        setIsSaving(false);
    };

    const handleClassicSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);

        if (isRangeMode) {
            const startDate = new Date(date);
            const endDate = new Date(dateEnd);
            const dates: string[] = [];

            const current = new Date(startDate);
            while (current <= endDate) {
                const dayOfWeek = current.getDay();
                const dateStr = current.toISOString().split('T')[0];
                if (dayOfWeek !== 0 && dayOfWeek !== 6 && !isHoliday(dateStr)) {
                    dates.push(dateStr);
                }
                current.setDate(current.getDate() + 1);
            }

            setProgressCount(0);
            let successCount = 0;
            for (let i = 0; i < dates.length; i++) {
                const success = await addPrestation({
                    date: dates[i],
                    heureDebut,
                    heureFin,
                    pause: Math.max(30, pause),
                    motif,
                    commentaire: ''
                });
                if (success) successCount++;
                setProgressCount(i + 1);
            }
            if (successCount > 0) setIsPrestationOpening(false);
        } else {
            const success = await addPrestation({
                date,
                heureDebut,
                heureFin,
                pause: Math.max(30, pause),
                motif,
                commentaire: ''
            });
            if (success) setIsPrestationOpening(false);
        }
        setIsSaving(false);
    };

    if (!isPrestationOpening) return null;

    const breakdown = calculatePrestationBreakdown(
        mode === 'quick' ? currentPreset.start : heureDebut,
        mode === 'quick' ? currentPreset.end : heureFin,
        mode === 'quick' ? currentPreset.pause : pause,
        horaireHabituel.standardDuration
    );

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-gray-900/60 backdrop-blur-sm animate-fade-in p-4">
            <div className="w-full max-w-2xl bg-white rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.2)] overflow-hidden animate-scale-up">
                {/* Header with Mode Toggle */}
                <div className="px-6 py-4 flex items-center justify-between border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-xl" style={{ backgroundColor: `${primaryColor}15`, color: primaryColor }}>
                            <ClockIcon className="w-5 h-5" />
                        </div>
                        <h3 className="font-bold text-gray-900">Nouvelle Prestation</h3>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setIsHelpOpen(true)}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 text-white text-xs font-semibold shadow-md hover:shadow-lg hover:scale-105 transition-all"
                            title="Mode d'emploi"
                        >
                            <SparklesIcon className="w-4 h-4" />
                            Aide
                        </button>
                        <button onClick={() => setIsPrestationOpening(false)} className="p-2 hover:bg-gray-100 rounded-full transition-all">
                            <XMarkIcon className="w-5 h-5 text-gray-400" />
                        </button>
                    </div>
                </div>

                {/* Help Modal */}
                <PrestationHelpModal isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} primaryColor={primaryColor} />

                {/* Mode Toggle - More Prominent */}
                <div className="px-6 py-3 bg-gray-50 border-b border-gray-100 flex gap-2">
                    <button
                        onClick={() => setMode('quick')}
                        className={`flex-1 py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 font-bold transition-all ${mode === 'quick'
                            ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-200'
                            : 'bg-white text-gray-500 border border-gray-200 hover:bg-gray-50'
                            }`}
                    >
                        <BoltIcon className="w-4 h-4" /> Rapide
                    </button>
                    <button
                        onClick={() => setMode('classic')}
                        className={`flex-1 py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 font-bold transition-all ${mode === 'classic'
                            ? 'bg-blue-500 text-white shadow-lg shadow-blue-200'
                            : 'bg-white text-gray-500 border border-gray-200 hover:bg-gray-50'
                            }`}
                    >
                        <AdjustmentsHorizontalIcon className="w-4 h-4" /> Classique
                    </button>
                </div>

                <div className="flex flex-col lg:flex-row">
                    {/* Left: Form */}
                    <div className="flex-1 p-6 border-r border-gray-100">
                        {/* Range Mode Toggle */}
                        <div className="flex items-center justify-between p-2 bg-gray-50 rounded-xl text-sm mb-4">
                            <span className="font-medium text-gray-600 ml-2">Mode période</span>
                            <button
                                type="button"
                                onClick={() => setIsRangeMode(!isRangeMode)}
                                className={`w-10 h-5 rounded-full transition-colors ${isRangeMode ? 'bg-emerald-500' : 'bg-gray-300'}`}
                            >
                                <span className={`block w-4 h-4 bg-white rounded-full shadow transition-transform ${isRangeMode ? 'translate-x-5' : 'translate-x-0.5'}`} />
                            </button>
                        </div>

                        {/* Date(s) */}
                        <div className={`grid ${isRangeMode ? 'grid-cols-2' : 'grid-cols-1'} gap-3 mb-4`}>
                            <div>
                                <label className="text-xs font-bold text-gray-400 uppercase mb-1 block">{isRangeMode ? 'Du' : 'Date'}</label>
                                <input
                                    type="date"
                                    value={date}
                                    onChange={(e) => {
                                        setDate(e.target.value);
                                        if (!isRangeMode || e.target.value > dateEnd) setDateEnd(e.target.value);
                                    }}
                                    className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-primary-500/20 focus:border-primary-300 outline-none transition-all"
                                    required
                                />
                            </div>
                            {isRangeMode && (
                                <div>
                                    <label className="text-xs font-bold text-gray-400 uppercase mb-1 block">Au</label>
                                    <input
                                        type="date"
                                        value={dateEnd}
                                        min={date}
                                        onChange={(e) => setDateEnd(e.target.value)}
                                        className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-primary-500/20 focus:border-primary-300 outline-none transition-all"
                                        required
                                    />
                                </div>
                            )}
                        </div>

                        {isRangeMode && (
                            <p className="text-xs text-blue-600 bg-blue-50 px-3 py-2 rounded-lg mb-4">
                                ℹ️ Weekends et jours fériés exclus automatiquement
                            </p>
                        )}

                        {/* QUICK MODE */}
                        {mode === 'quick' && (
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
                        )}

                        {/* CLASSIC MODE */}
                        {mode === 'classic' && (
                            <form onSubmit={handleClassicSubmit} className="space-y-4">
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

                                <div className="flex items-center justify-between p-3 rounded-xl bg-blue-50 border-2 border-blue-200">
                                    <span className="text-sm font-bold text-blue-700">Durée nette</span>
                                    <span className="text-xl font-black text-blue-700">{formatDurationHuman(breakdown.totalMinutes)}</span>
                                </div>

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

                                <Button type="submit" loading={isSaving}
                                    className="w-full h-12 rounded-xl font-bold text-white shadow-lg bg-blue-600 hover:bg-blue-700">
                                    {isSaving && isRangeMode ? `ENCODAGE... (${progressCount})` : isRangeMode ? 'ENCODER LA PÉRIODE' : 'ENREGISTRER'}
                                </Button>
                            </form>
                        )}
                    </div>

                    {/* Right: Recent History */}
                    <div className="w-full lg:w-64 p-4 bg-gray-50/50">
                        <h4 className="text-xs font-bold text-gray-400 uppercase mb-3">Historique récent</h4>
                        {recentPrestations.length === 0 ? (
                            <div className="text-center py-8 text-gray-400 text-sm">Aucune prestation</div>
                        ) : (
                            <div className="space-y-2">
                                {recentPrestations.map(p => (
                                    <div key={p.id} className="p-2.5 bg-white rounded-xl border border-gray-100 hover:shadow-sm transition-shadow">
                                        <div className="flex items-center justify-between mb-1">
                                            <span className="text-xs font-bold text-gray-700">
                                                {new Date(p.date).toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' })}
                                            </span>
                                            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-gray-100 text-gray-600">{p.motif}</span>
                                        </div>
                                        <div className="flex items-center justify-between text-xs text-gray-500">
                                            <span>{p.heureDebut} - {p.heureFin}</span>
                                            <span className="font-bold text-gray-900">{formatDurationHuman(p.dureeNet)}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
