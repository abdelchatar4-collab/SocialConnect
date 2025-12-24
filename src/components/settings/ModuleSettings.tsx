/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect est un logiciel libre : vous pouvez le redistribuer et/ou le modifier selon les termes de la Licence Publique Générale GNU telle que publiée par la Free Software Foundation, soit la version 3 de la licence, soit (à votre convenance) toute version ultérieure.

Ce programme est distribué dans l'espoir qu'il sera utile, mais SANS AUCUNE GARANTIE ; sans même la garantie implicite de COMMERCIALISATION ou d'ADÉQUATION À UN USAGE PARTICULIER. Voir la Licence Publique Générale GNU pour plus de détails.
*/

'use client';

import React, { useState } from 'react';
import { useAdmin } from '@/contexts/AdminContext';
import { Shield, Layout, Home, Brain, Save, Loader2, CheckCircle2 } from 'lucide-react';

export default function ModuleSettings() {
    const { enabledModules, setEnabledModules, saveSettings } = useAdmin();
    const [isSaving, setIsSaving] = useState(false);
    const [saveMessage, setSaveMessage] = useState('');

    const toggleModule = (moduleId: string) => {
        setEnabledModules({
            ...enabledModules,
            [moduleId]: !enabledModules[moduleId]
        });
    };

    const handleSave = async () => {
        setIsSaving(true);
        setSaveMessage('');
        try {
            await saveSettings();
            setSaveMessage('✓ Configuration enregistrée');
            setTimeout(() => setSaveMessage(''), 3000);
        } catch {
            setSaveMessage('✗ Erreur lors de l\'enregistrement');
            setTimeout(() => setSaveMessage(''), 3000);
        } finally {
            setIsSaving(false);
        }
    };

    const modules = [
        {
            id: 'housingAnalysis',
            label: 'Module Logement & Prévention',
            description: 'Active les champs détaillés du logement et l\'analyse de prévention d\'expulsion.',
            icon: <Home className="w-5 h-5 text-blue-500" />,
            category: 'Métier'
        },
        {
            id: 'aiAssistant',
            label: 'Assistant IA (Analyse de notes)',
            description: 'Permet d\'utiliser l\'IA pour résumer les situations et proposer des actions.',
            icon: <Brain className="w-5 h-5 text-purple-500" />,
            category: 'Intelligence'
        },
        {
            id: 'statsDashboard',
            label: 'Tableau de bord Statistiques',
            description: 'Affiche les graphiques et analyses de données sur la page d\'accueil.',
            icon: <Shield className="w-5 h-5 text-amber-500" />,
            category: 'Analyse'
        }
    ];

    return (
        <div className="space-y-6">
            <div className="bg-blue-50 border border-blue-200 p-4 rounded-xl flex items-start gap-3 mb-6">
                <Shield className="w-5 h-5 text-blue-600 mt-0.5" />
                <div className="text-sm text-blue-800">
                    <p className="font-bold mb-1">Isolation des services</p>
                    <p>Ces réglages sont <strong>propres à votre service actuel</strong>. Ils permettent d'activer ou de désactiver des fonctionnalités sans affecter les autres services du portail.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {modules.map((mod) => (
                    <div
                        key={mod.id}
                        className={`p-5 rounded-2xl border-2 transition-all cursor-pointer flex items-start gap-4 ${enabledModules[mod.id]
                            ? 'bg-white border-blue-500 shadow-md ring-1 ring-blue-50'
                            : 'bg-gray-50 border-gray-100 opacity-80 hover:opacity-100 hover:border-gray-200'
                            }`}
                        onClick={() => toggleModule(mod.id)}
                    >
                        <div className={`p-3 rounded-xl ${enabledModules[mod.id] ? 'bg-blue-50' : 'bg-gray-100'}`}>
                            {mod.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                                <span className="text-xs font-bold uppercase tracking-wider text-gray-400">
                                    {mod.category}
                                </span>
                                {enabledModules[mod.id] && (
                                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                                )}
                            </div>
                            <h4 className="font-bold text-gray-900 mb-1">{mod.label}</h4>
                            <p className="text-sm text-gray-500 leading-relaxed">
                                {mod.description}
                            </p>
                            <div className="mt-3 flex items-center gap-2">
                                <div className={`w-10 h-5 rounded-full relative transition-colors ${enabledModules[mod.id] ? 'bg-blue-600' : 'bg-gray-300'}`}>
                                    <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${enabledModules[mod.id] ? 'left-6' : 'left-1'}`} />
                                </div>
                                <span className="text-xs font-semibold text-gray-600">
                                    {enabledModules[mod.id] ? 'Activé' : 'Désactivé'}
                                </span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Save Button */}
            <div className="flex items-center justify-end gap-3 pt-6 border-t border-gray-200 mt-8">
                {saveMessage && (
                    <span className={`text-sm font-medium ${saveMessage.startsWith('✓') ? 'text-green-600' : 'text-red-600'}`}>
                        {saveMessage}
                    </span>
                )}
                <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all disabled:opacity-50"
                >
                    {isSaving ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                        <Save className="w-4 h-4" />
                    )}
                    {isSaving ? 'Enregistrement...' : 'Enregistrer la configuration'}
                </button>
            </div>
        </div>
    );
}
