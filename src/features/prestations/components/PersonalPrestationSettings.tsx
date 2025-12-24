/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect est un logiciel libre : vous pouvez le redistribuer et/ou le modifier selon les termes de la Licence Publique Générale GNU telle que publiée par la Free Software Foundation, soit la version 3 de la licence, soit (à votre convenance) toute version ultérieure.
*/

"use client";

import React, { useState, useEffect } from 'react';
import { usePrestations } from '@/contexts/PrestationContext';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { ClockIcon, CheckCircleIcon, SparklesIcon, ExclamationCircleIcon } from '@heroicons/react/24/outline';
import { useAdmin } from '@/contexts/AdminContext';

export const PersonalPrestationSettings: React.FC = () => {
    const { horaireHabituel, updateHoraireHabituel, isPrestationLoading } = usePrestations();
    const { primaryColor } = useAdmin();

    const [start, setStart] = useState(horaireHabituel.start);
    const [end, setEnd] = useState(horaireHabituel.end);
    const [pause, setPause] = useState(horaireHabituel.pause);
    const [isSaving, setIsSaving] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    useEffect(() => {
        setStart(horaireHabituel.start);
        setEnd(horaireHabituel.end);
        setPause(horaireHabituel.pause);
    }, [horaireHabituel]);

    const handleSave = async () => {
        console.log('[PersonalPrestationSettings] Starting save...');
        setIsSaving(true);
        setMessage(null);

        try {
            const newHoraire = {
                ...horaireHabituel,
                start,
                end,
                pause: Math.max(30, pause)
            };
            console.log('[PersonalPrestationSettings] Sending:', newHoraire);

            const success = await updateHoraireHabituel(newHoraire);
            console.log('[PersonalPrestationSettings] Result:', success);

            setIsSaving(false);
            if (success) {
                setMessage({ type: 'success', text: '✅ Vos préférences ont été enregistrées avec succès !' });
            } else {
                setMessage({ type: 'error', text: '❌ Échec de l\'enregistrement. Veuillez réessayer.' });
            }
        } catch (error) {
            console.error('[PersonalPrestationSettings] Error:', error);
            setIsSaving(false);
            setMessage({ type: 'error', text: '❌ Une erreur inattendue est survenue.' });
        }
    };

    return (
        <Card className="p-8 space-y-8 bg-white border-0 shadow-sm rounded-[2rem]">
            {/* PROMINENT FEEDBACK MESSAGE - Always at the top */}
            {message && (
                <div
                    className={`p-6 rounded-2xl flex items-center gap-4 animate-pulse border-2 ${message.type === 'success'
                        ? 'bg-emerald-100 text-emerald-900 border-emerald-400'
                        : 'bg-rose-100 text-rose-900 border-rose-400'
                        }`}
                    style={{
                        boxShadow: message.type === 'success'
                            ? '0 0 20px rgba(16, 185, 129, 0.4)'
                            : '0 0 20px rgba(244, 63, 94, 0.4)'
                    }}
                >
                    {message.type === 'success'
                        ? <CheckCircleIcon className="w-8 h-8 flex-shrink-0" />
                        : <ExclamationCircleIcon className="w-8 h-8 flex-shrink-0" />
                    }
                    <span className="text-lg font-black">{message.text}</span>
                </div>
            )}

            <div className="flex items-center gap-4">
                <div className="p-4 rounded-2xl" style={{ backgroundColor: `${primaryColor}10`, color: primaryColor }}>
                    <SparklesIcon className="w-8 h-8" />
                </div>
                <div>
                    <h2 className="text-2xl font-black text-gray-900 tracking-tight">Mon Horaire Habituel</h2>
                    <p className="text-sm text-gray-500 font-medium">Configurez vos heures par défaut pour gagner du temps lors de vos encodages.</p>
                </div>
            </div>

            {/* Quick Presets */}
            <div className="flex flex-wrap gap-3">
                <span className="text-xs font-bold text-gray-400 uppercase self-center mr-2">Presets rapides :</span>
                <button
                    type="button"
                    onClick={() => { setStart('08:00'); setEnd('16:00'); }}
                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl transition-all hover:scale-105"
                >
                    8h - 16h
                </button>
                <button
                    type="button"
                    onClick={() => { setStart('09:00'); setEnd('17:00'); }}
                    className="px-4 py-2 bg-primary-100 hover:bg-primary-200 text-primary-700 font-bold rounded-xl transition-all hover:scale-105 ring-2 ring-primary-300"
                    style={{ backgroundColor: `${primaryColor}15`, color: primaryColor, borderColor: primaryColor }}
                >
                    9h - 17h
                </button>
                <button
                    type="button"
                    onClick={() => { setStart('10:00'); setEnd('18:00'); }}
                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl transition-all hover:scale-105"
                >
                    10h - 18h
                </button>
                <button
                    type="button"
                    onClick={() => { setStart('08:30'); setEnd('16:30'); }}
                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl transition-all hover:scale-105"
                >
                    8h30 - 16h30
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                    <label className="text-[11px] font-black text-gray-400 uppercase ml-2 tracking-widest">Heure de début</label>
                    <input
                        type="time"
                        value={start}
                        onChange={(e) => setStart(e.target.value)}
                        className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent rounded-[1.5rem] focus:bg-white focus:border-primary-200 outline-none text-lg font-black transition-all"
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-[11px] font-black text-gray-400 uppercase ml-2 tracking-widest">Heure de fin</label>
                    <input
                        type="time"
                        value={end}
                        onChange={(e) => setEnd(e.target.value)}
                        className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent rounded-[1.5rem] focus:bg-white focus:border-primary-200 outline-none text-lg font-black transition-all"
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-[11px] font-black text-gray-400 uppercase ml-2 tracking-widest">Pause (minutes)</label>
                    <input
                        type="number"
                        min="30"
                        value={pause}
                        onChange={(e) => setPause(parseInt(e.target.value) || 30)}
                        className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent rounded-[1.5rem] focus:bg-white focus:border-primary-200 outline-none text-lg font-black transition-all"
                    />
                </div>
            </div>

            <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-4 border-t border-gray-50">
                <div className="flex items-center gap-2 text-amber-600 bg-amber-50 px-4 py-2 rounded-xl text-xs font-bold">
                    <ClockIcon className="w-4 h-4" />
                    <span>Rappel : La pause minimale obligatoire est de 30 min.</span>
                </div>

                <Button
                    onClick={handleSave}
                    loading={isSaving}
                    disabled={isPrestationLoading || isSaving}
                    className="w-full md:w-auto px-10 h-14 rounded-2xl text-base font-black shadow-xl hover:scale-105 active:scale-95 transition-all"
                    style={{ backgroundColor: primaryColor }}
                >
                    {isSaving ? 'ENREGISTREMENT...' : 'ENREGISTRER MES PRÉFÉRENCES'}
                </Button>
            </div>
        </Card>
    );
};
