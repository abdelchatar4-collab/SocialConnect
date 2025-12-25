/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect est un logiciel libre : vous pouvez le redistribuer et/ou le modifier selon les termes de la Licence Publique Générale GNU telle que publiée par la Free Software Foundation, soit la version 3 de la licence, soit (à votre convenance) toute version ultérieure.

Ce programme est distribué dans l'espoir qu'il sera utile, mais SANS AUCUNE GARANTIE ; sans même la garantie implicite de COMMERCIALISATION ou d'ADÉQUATION À UN USAGE PARTICULIER. Voir la Licence Publique Générale GNU pour plus de détails.
*/

'use client';

/**
 * BirthdaySettings - Modern redesigned version
 * Manage team birthdays and holiday themes
 */

import React, { useState, useEffect } from 'react';
import { useAdmin } from '@/contexts/AdminContext';
import { Button } from '@/components/ui';
import { Cake, PartyPopper, Save, Plus, Trash2, Moon, Sun, Ghost, Candy, Star, Calendar } from 'lucide-react';

interface Gestionnaire {
    id: string;
    prenom: string;
    nom: string;
    couleurMedaillon?: string | null;
}

export const BirthdaySettings: React.FC = () => {
    const {
        enableBirthdays,
        setEnableBirthdays,
        colleagueBirthdays,
        setColleagueBirthdays,
        activeHolidayTheme,
        setActiveHolidayTheme,
        saveSettings
    } = useAdmin();

    const [newName, setNewName] = useState('');
    const [newDate, setNewDate] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [saveMessage, setSaveMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
    const [gestionnaires, setGestionnaires] = useState<Gestionnaire[]>([]);

    // Fetch gestionnaires to get their colors
    useEffect(() => {
        fetch('/api/gestionnaires')
            .then(res => res.ok ? res.json() : [])
            .then(data => setGestionnaires(data))
            .catch(() => setGestionnaires([]));
    }, []);

    // Helper to get gestionnaire color by name
    const getGestionnaireColor = (name: string) => {
        const g = gestionnaires.find(gest =>
            gest.prenom?.toLowerCase() === name.toLowerCase() ||
            `${gest.prenom} ${gest.nom}`.toLowerCase() === name.toLowerCase()
        );
        if (g?.couleurMedaillon) {
            try {
                const c = typeof g.couleurMedaillon === 'string'
                    ? JSON.parse(g.couleurMedaillon)
                    : g.couleurMedaillon;
                return `linear-gradient(135deg, ${c.from}, ${c.to})`;
            } catch { return null; }
        }
        return null;
    };

    const handleAddBirthday = () => {
        if (!newName.trim() || !newDate) {
            return;
        }

        const newBirthday = { name: newName.trim(), date: newDate };
        setColleagueBirthdays([...colleagueBirthdays, newBirthday]);
        setNewName('');
        setNewDate('');
    };

    const handleRemoveBirthday = (index: number) => {
        const updated = colleagueBirthdays.filter((_, i) => i !== index);
        setColleagueBirthdays(updated);
    };

    const handleSave = async () => {
        setIsSaving(true);
        setSaveMessage(null);

        try {
            await saveSettings();
            setSaveMessage({ type: 'success', text: 'Paramètres sauvegardés avec succès !' });
            setTimeout(() => setSaveMessage(null), 3000);
        } catch (error) {
            console.error('[BirthdaySettings] Save error:', error);
            setSaveMessage({ type: 'error', text: `Erreur lors de la sauvegarde: ${error instanceof Error ? error.message : 'Erreur inconnue'}` });
        } finally {
            setIsSaving(false);
        }
    };

    const formatDateDisplay = (dateStr: string) => {
        const [year, month, day] = dateStr.split('-');
        return `${day}/${month}`;
    };

    return (
        <div className="space-y-6">
            {/* Header Card */}
            <div className="settings-card">
                <div className="settings-card-header">
                    <div className="settings-card-icon settings-card-icon--pink">
                        <PartyPopper className="w-4 h-4" />
                    </div>
                    <div>
                        <h3 className="settings-card-title">Vie d'équipe & Festivités</h3>
                        <p className="settings-card-subtitle">Gérez les anniversaires et les thèmes de fêtes</p>
                    </div>
                </div>
            </div>

            {/* Enable/Disable & Themes */}
            <div className="settings-card">
                <div className="settings-card-body space-y-6">
                    {/* Toggle */}
                    <div className="flex items-center justify-between">
                        <div>
                            <span className="text-sm font-medium text-gray-900 block">Activer les anniversaires</span>
                            <span className="text-xs text-gray-500">Un bandeau avec confettis s'affichera le jour J</span>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                checked={enableBirthdays}
                                onChange={(e) => setEnableBirthdays(e.target.checked)}
                                className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-pink-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-pink-500"></div>
                        </label>
                    </div>

                    {/* Holiday Themes */}
                    <div className="pt-4 border-t border-gray-100">
                        <h4 className="text-sm font-medium text-gray-900 mb-3">Thème Festif (Habillage Global)</h4>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                            <button
                                onClick={() => setActiveHolidayTheme('NONE')}
                                className={`p-3 rounded-lg border text-center transition-all flex flex-col items-center gap-2 ${activeHolidayTheme === 'NONE'
                                    ? 'border-gray-500 bg-gray-50 text-gray-900 ring-1 ring-gray-300'
                                    : 'border-gray-200 hover:border-gray-300 text-gray-500 hover:bg-gray-50'
                                    }`}
                            >
                                <span className="text-xl">🚫</span>
                                <span className="text-xs font-medium">Aucun</span>
                            </button>
                            <button
                                onClick={() => setActiveHolidayTheme('CHRISTMAS')}
                                className={`p-3 rounded-lg border text-center transition-all flex flex-col items-center gap-2 ${activeHolidayTheme === 'CHRISTMAS'
                                    ? 'border-red-500 bg-red-50 text-red-700 ring-1 ring-red-300'
                                    : 'border-gray-200 hover:border-red-200 text-gray-500 hover:bg-red-50'
                                    }`}
                            >
                                <span className="text-xl">🎄</span>
                                <span className="text-xs font-medium">Noël</span>
                            </button>
                            <button
                                onClick={() => setActiveHolidayTheme('NEW_YEAR')}
                                className={`p-3 rounded-lg border text-center transition-all flex flex-col items-center gap-2 ${activeHolidayTheme === 'NEW_YEAR'
                                    ? 'border-yellow-500 bg-yellow-50 text-yellow-700 ring-1 ring-yellow-300'
                                    : 'border-gray-200 hover:border-yellow-200 text-gray-500 hover:bg-yellow-50'
                                    }`}
                            >
                                <span className="text-xl">🎆</span>
                                <span className="text-xs font-medium">Nouvel An</span>
                            </button>
                            <button
                                onClick={() => setActiveHolidayTheme('HALLOWEEN')}
                                className={`p-3 rounded-lg border text-center transition-all flex flex-col items-center gap-2 ${activeHolidayTheme === 'HALLOWEEN'
                                    ? 'border-orange-500 bg-orange-50 text-orange-700 ring-1 ring-orange-300'
                                    : 'border-gray-200 hover:border-orange-200 text-gray-500 hover:bg-orange-50'
                                    }`}
                            >
                                <span className="text-xl">🎃</span>
                                <span className="text-xs font-medium">Halloween</span>
                            </button>
                            <button
                                onClick={() => setActiveHolidayTheme('RAMADAN')}
                                className={`p-3 rounded-lg border text-center transition-all flex flex-col items-center gap-2 ${activeHolidayTheme === 'RAMADAN'
                                    ? 'border-emerald-500 bg-emerald-50 text-emerald-700 ring-1 ring-emerald-300'
                                    : 'border-gray-200 hover:border-emerald-200 text-gray-500 hover:bg-emerald-50'
                                    }`}
                            >
                                <span className="text-xl">🌙</span>
                                <span className="text-xs font-medium">Ramadan</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Birthday List */}
            {enableBirthdays && (
                <div className="settings-card animate-in fade-in slide-in-from-bottom-2">
                    <div className="settings-card-header">
                        <div>
                            <h3 className="settings-card-title">Liste des anniversaires</h3>
                            <p className="settings-card-subtitle">Ajoutez les dates d'anniversaire de vos collègues</p>
                        </div>
                    </div>
                    <div className="settings-card-body space-y-4">
                        {/* Add New Birthday */}
                        <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                            <h4 className="text-xs uppercase text-gray-500 font-semibold mb-3">Ajouter un collègue</h4>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={newName}
                                    onChange={(e) => setNewName(e.target.value)}
                                    placeholder="Prénom"
                                    className="settings-input flex-1"
                                />
                                <input
                                    type="date"
                                    value={newDate}
                                    onChange={(e) => setNewDate(e.target.value)}
                                    className="settings-input w-40"
                                />
                                <button
                                    onClick={handleAddBirthday}
                                    disabled={!newName.trim() || !newDate}
                                    className="settings-btn settings-btn--primary"
                                >
                                    <Plus className="w-4 h-4" />
                                    Ajouter
                                </button>
                            </div>
                        </div>

                        {/* Birthday List */}
                        <div className="border border-gray-200 rounded-lg overflow-hidden bg-white divide-y divide-gray-100 max-h-80 overflow-y-auto">
                            {colleagueBirthdays.length > 0 ? (
                                colleagueBirthdays.map((birthday, index) => (
                                    <div
                                        key={index}
                                        className="p-3 flex items-center justify-between hover:bg-pink-50 transition-colors group"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div
                                                className="w-8 h-8 rounded-full flex items-center justify-center text-white font-semibold text-sm shadow-sm"
                                                style={{
                                                    background: getGestionnaireColor(birthday.name) || 'linear-gradient(135deg, #ec4899, #db2777)'
                                                }}
                                            >
                                                {birthday.name.charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <p className="font-medium text-gray-900">{birthday.name}</p>
                                                <p className="text-xs text-gray-500 flex items-center gap-1">
                                                    <Calendar className="w-3 h-3" />
                                                    {formatDateDisplay(birthday.date)}
                                                </p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => handleRemoveBirthday(index)}
                                            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                                            title="Supprimer"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))
                            ) : (
                                <div className="p-8 text-center text-gray-500 italic">
                                    Aucun anniversaire enregistré
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Save Button */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
                {saveMessage && (
                    <span className={`text-sm animate-in fade-in ${saveMessage.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>
                        {saveMessage.text}
                    </span>
                )}
                <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="settings-btn settings-btn--primary px-6"
                >
                    <Save className="w-4 h-4" />
                    {isSaving ? 'Sauvegarde...' : 'Sauvegarder les changements'}
                </button>
            </div>
        </div>
    );
};
