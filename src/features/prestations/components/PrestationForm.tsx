/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect - Prestation Form
*/

"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { usePrestations } from '@/contexts/PrestationContext';
import { useAdmin } from '@/contexts/AdminContext';
import { ClockIcon, XMarkIcon, BoltIcon, AdjustmentsHorizontalIcon, SparklesIcon } from '@heroicons/react/24/outline';
import { calculatePrestationBreakdown } from '@/utils/prestationUtils';
import { useDropdownOptionsAPI } from '@/hooks/useDropdownOptionsAPI';
import { PrestationHelpModal } from './PrestationHelpModal';
import { DROPDOWN_CATEGORIES } from '@/constants/dropdownCategories';
import { QUICK_PRESETS, HOLIDAYS_2026 } from '../constants/prestationFormConstants';
import { RecentPrestationsList } from './Form/RecentPrestationsList';
import { QuickModeForm } from './Form/QuickModeForm';
import { ClassicModeForm } from './Form/ClassicModeForm';

export const PrestationForm: React.FC = () => {
    const { isPrestationOpening, setIsPrestationOpening, addPrestation, horaireHabituel, prestations } = usePrestations();
    const { primaryColor } = useAdmin();
    const { options: activityMotifs } = useDropdownOptionsAPI(DROPDOWN_CATEGORIES.PRESTATION_MOTIFS);

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

    useEffect(() => {
        if (isPrestationOpening) {
            setHeureDebut(horaireHabituel.start); setHeureFin(horaireHabituel.end); setPause(Math.max(30, horaireHabituel.pause));
        }
    }, [isPrestationOpening, horaireHabituel]);

    const recentPrestations = useMemo(() => [...prestations].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5), [prestations]);

    const handleSave = async (data: any) => {
        setIsSaving(true);
        if (isRangeMode) {
            let current = new Date(date), end = new Date(dateEnd), count = 0;
            while (current <= end) {
                const ds = current.toISOString().split('T')[0];
                if (current.getDay() !== 0 && current.getDay() !== 6 && !HOLIDAYS_2026.includes(ds)) {
                    if (await addPrestation({ ...data, date: ds })) count++;
                }
                current.setDate(current.getDate() + 1); setProgressCount(prev => prev + 1);
            }
            if (count > 0) setIsPrestationOpening(false);
        } else if (await addPrestation({ ...data, date })) setIsPrestationOpening(false);
        setIsSaving(false);
    };

    if (!isPrestationOpening) return null;
    const currentPreset = QUICK_PRESETS.find(p => p.id === selectedPreset) || QUICK_PRESETS[0];
    const breakdown = calculatePrestationBreakdown(mode === 'quick' ? currentPreset.start : heureDebut, mode === 'quick' ? currentPreset.end : heureFin, mode === 'quick' ? currentPreset.pause : pause, horaireHabituel.standardDuration);

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-gray-900/60 backdrop-blur-sm animate-fade-in p-4">
            <div className="w-full max-w-2xl bg-white rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.2)] overflow-hidden animate-scale-up">
                <div className="px-6 py-4 flex items-center justify-between border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
                    <div className="flex items-center gap-3"><div className="p-2 rounded-xl" style={{ backgroundColor: `${primaryColor}15`, color: primaryColor }}><ClockIcon className="w-5 h-5" /></div><h3 className="font-bold text-gray-900">Nouvelle Prestation</h3></div>
                    <div className="flex items-center gap-2">
                        <button onClick={() => setIsHelpOpen(true)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 text-white text-xs font-semibold shadow-md hover:shadow-lg hover:scale-105 transition-all"><SparklesIcon className="w-4 h-4" />Aide</button>
                        <button onClick={() => setIsPrestationOpening(false)} className="p-2 hover:bg-gray-100 rounded-full transition-all"><XMarkIcon className="w-5 h-5 text-gray-400" /></button>
                    </div>
                </div>
                <PrestationHelpModal isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} primaryColor={primaryColor} />
                <div className="px-6 py-3 bg-gray-50 border-b border-gray-100 flex gap-2">
                    <button onClick={() => setMode('quick')} className={`flex-1 py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 font-bold transition-all ${mode === 'quick' ? 'bg-emerald-500 text-white shadow-lg' : 'bg-white text-gray-500 border border-gray-200 hover:bg-gray-50'}`}><BoltIcon className="w-4 h-4" /> Rapide</button>
                    <button onClick={() => setMode('classic')} className={`flex-1 py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 font-bold transition-all ${mode === 'classic' ? 'bg-blue-500 text-white shadow-lg' : 'bg-white text-gray-500 border border-gray-200 hover:bg-gray-50'}`}><AdjustmentsHorizontalIcon className="w-4 h-4" /> Classique</button>
                </div>
                <div className="flex flex-col lg:flex-row">
                    <div className="flex-1 p-6 border-r border-gray-100">
                        <div className="flex items-center justify-between p-2 bg-gray-50 rounded-xl text-sm mb-4"><span className="font-medium text-gray-600 ml-2">Mode période</span><button type="button" onClick={() => setIsRangeMode(!isRangeMode)} className={`w-10 h-5 rounded-full transition-colors ${isRangeMode ? 'bg-emerald-500' : 'bg-gray-300'}`}><span className={`block w-4 h-4 bg-white rounded-full transition-transform ${isRangeMode ? 'translate-x-5' : 'translate-x-0.5'}`} /></button></div>
                        <div className={`grid ${isRangeMode ? 'grid-cols-2' : 'grid-cols-1'} gap-3 mb-4`}>
                            <div><label className="text-xs font-bold text-gray-400 uppercase mb-1 block">{isRangeMode ? 'Du' : 'Date'}</label><input type="date" value={date} onChange={(e) => { setDate(e.target.value); if (!isRangeMode || e.target.value > dateEnd) setDateEnd(e.target.value); }} className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none" required /></div>
                            {isRangeMode && <div><label className="text-xs font-bold text-gray-400 uppercase mb-1 block">Au</label><input type="date" value={dateEnd} min={date} onChange={(e) => setDateEnd(e.target.value)} className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none" required /></div>}
                        </div>
                        {mode === 'quick' ? <QuickModeForm selectedPreset={selectedPreset} setSelectedPreset={setSelectedPreset} breakdown={breakdown} handleQuickSubmit={() => handleSave({ heureDebut: currentPreset.start, heureFin: currentPreset.end, pause: currentPreset.pause, motif: currentPreset.motif, commentaire: '' })} isSaving={isSaving} isRangeMode={isRangeMode} progressCount={progressCount} />
                            : <ClassicModeForm motif={motif} setMotif={setMotif} heureDebut={heureDebut} setHeureDebut={setHeureDebut} heureFin={heureFin} setHeureFin={setHeureFin} pause={pause} setPause={setPause} activityMotifs={activityMotifs} handleClassicSubmit={(e) => { e.preventDefault(); handleSave({ heureDebut, heureFin, pause: Math.max(30, pause), motif, commentaire: '' }); }} isSaving={isSaving} isRangeMode={isRangeMode} progressCount={progressCount} />}
                    </div>
                    <div className="w-full lg:w-64 p-4 bg-gray-50/50"><h4 className="text-xs font-bold text-gray-400 uppercase mb-3">Historique récent</h4><RecentPrestationsList prestations={recentPrestations} /></div>
                </div>
            </div>
        </div>
    );
};
