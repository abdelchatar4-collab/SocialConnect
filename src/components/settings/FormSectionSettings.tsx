/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect est un logiciel libre : vous pouvez le redistribuer et/ou le modifier selon les termes de la Licence Publique Générale GNU telle que publiée par la Free Software Foundation, soit la version 3 de la licence, soit (à votre convenance) toute version ultérieure.

Ce programme est distribué dans l'espoir qu'il sera utile, mais SANS AUCUNE GARANTIE ; sans même la garantie implicite de COMMERCIALISATION ou d'ADÉQUATION À UN USAGE PARTICULIER. Voir la Licence Publique Générale GNU pour plus de détails.
*/

'use client';

import React, { useState } from 'react';
import { useAdmin, DEFAULT_VISIBLE_FORM_SECTIONS } from '@/contexts/AdminContext';
import {
    User, Phone, MapPin, Briefcase, Users, Home, AlertTriangle,
    ListChecks, Scale, FileText, Lock, Save, Loader2, RotateCcw, Shield
} from 'lucide-react';

interface FormSection {
    id: string;
    label: string;
    description: string;
    icon: React.ReactNode;
    locked?: boolean; // Cannot be disabled
}

const FORM_SECTIONS: FormSection[] = [
    {
        id: 'identity',
        label: 'Identité',
        description: 'Nom, prénom, genre, date de naissance, nationalité',
        icon: <User className="w-5 h-5 text-blue-500" />,
        locked: true // Always visible - required fields
    },
    {
        id: 'contact',
        label: 'Coordonnées',
        description: 'Téléphone, email, langue de contact',
        icon: <Phone className="w-5 h-5 text-green-500" />
    },
    {
        id: 'address',
        label: 'Adresse',
        description: 'Rue, numéro, code postal, ville, quartier',
        icon: <MapPin className="w-5 h-5 text-red-500" />
    },
    {
        id: 'management',
        label: 'Gestion du dossier',
        description: 'Gestionnaire, antenne, secteur, état, dates d\'ouverture/clôture',
        icon: <Briefcase className="w-5 h-5 text-amber-500" />
    },
    {
        id: 'situation',
        label: 'Situation sociale',
        description: 'Statut de séjour, situation professionnelle, revenus, tranche d\'âge',
        icon: <Users className="w-5 h-5 text-purple-500" />
    },
    {
        id: 'housing',
        label: 'Logement détaillé',
        description: 'Type de logement, statut, bail, loyer, charges, litige',
        icon: <Home className="w-5 h-5 text-teal-500" />
    },
    {
        id: 'prevExp',
        label: 'Prévention Expulsion',
        description: 'Dates de procédure, décisions, aides juridiques, solutions',
        icon: <AlertTriangle className="w-5 h-5 text-orange-500" />
    },
    {
        id: 'problems',
        label: 'Problématiques & Actions',
        description: 'Liste des problématiques identifiées et actions de suivi',
        icon: <ListChecks className="w-5 h-5 text-indigo-500" />
    },
    {
        id: 'mediation',
        label: 'Médiation',
        description: 'Type de médiation, demandeur, partie adverse, statut du litige',
        icon: <Scale className="w-5 h-5 text-rose-500" />
    },
    {
        id: 'notes',
        label: 'Notes & Remarques',
        description: 'Notes générales, remarques, informations importantes',
        icon: <FileText className="w-5 h-5 text-gray-500" />
    },
    {
        id: 'confidential',
        label: 'Données confidentielles',
        description: 'Informations sensibles à accès restreint',
        icon: <Lock className="w-5 h-5 text-red-600" />
    }
];

export default function FormSectionSettings() {
    const { visibleFormSections, setVisibleFormSections, saveSettings } = useAdmin();
    const [isSaving, setIsSaving] = useState(false);
    const [saveMessage, setSaveMessage] = useState('');

    const toggleSection = (sectionId: string) => {
        // Don't allow toggling locked sections
        const section = FORM_SECTIONS.find(s => s.id === sectionId);
        if (section?.locked) return;

        setVisibleFormSections({
            ...visibleFormSections,
            [sectionId]: !visibleFormSections[sectionId]
        });
    };

    const handleSave = async () => {
        setIsSaving(true);
        setSaveMessage('');
        try {
            await saveSettings();
            setSaveMessage('✓ Configuration des sections enregistrée');
            setTimeout(() => setSaveMessage(''), 3000);
        } catch {
            setSaveMessage('✗ Erreur lors de l\'enregistrement');
            setTimeout(() => setSaveMessage(''), 3000);
        } finally {
            setIsSaving(false);
        }
    };

    const handleReset = () => {
        setVisibleFormSections(DEFAULT_VISIBLE_FORM_SECTIONS);
    };

    const enabledCount = Object.values(visibleFormSections).filter(Boolean).length;

    return (
        <div className="space-y-6">
            {/* Info Banner */}
            <div className="bg-blue-50 border border-blue-200 p-4 rounded-xl flex items-start gap-3 mb-6">
                <Shield className="w-5 h-5 text-blue-600 mt-0.5" />
                <div className="text-sm text-blue-800">
                    <p className="font-bold mb-1">Personnalisez votre formulaire</p>
                    <p>Activez ou désactivez les sections selon les besoins de votre service.
                        Les sections désactivées seront cachées dans le formulaire de création/édition d'usagers.</p>
                </div>
            </div>

            {/* Stats */}
            <div className="flex items-center gap-4 mb-4">
                <div className="px-4 py-2 bg-gray-100 rounded-lg">
                    <span className="text-2xl font-bold text-gray-800">{enabledCount}</span>
                    <span className="text-gray-500 ml-1">/ {FORM_SECTIONS.length} sections actives</span>
                </div>
            </div>

            {/* Sections Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {FORM_SECTIONS.map((section) => {
                    const isEnabled = visibleFormSections[section.id] !== false;
                    const isLocked = section.locked;

                    return (
                        <div
                            key={section.id}
                            className={`p-4 rounded-xl border-2 transition-all flex items-start gap-3 ${isLocked
                                    ? 'bg-gray-50 border-gray-200 cursor-not-allowed opacity-70'
                                    : isEnabled
                                        ? 'bg-white border-blue-500 shadow-md cursor-pointer hover:shadow-lg'
                                        : 'bg-gray-50 border-gray-200 cursor-pointer hover:border-gray-300'
                                }`}
                            onClick={() => toggleSection(section.id)}
                        >
                            {/* Icon */}
                            <div className={`p-2 rounded-lg ${isEnabled ? 'bg-blue-50' : 'bg-gray-100'}`}>
                                {section.icon}
                            </div>

                            {/* Content */}
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                    <h4 className={`font-bold ${isEnabled ? 'text-gray-900' : 'text-gray-500'}`}>
                                        {section.label}
                                    </h4>
                                    {isLocked && (
                                        <span className="text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full">
                                            Obligatoire
                                        </span>
                                    )}
                                </div>
                                <p className="text-sm text-gray-500 leading-snug">
                                    {section.description}
                                </p>
                            </div>

                            {/* Toggle */}
                            {!isLocked && (
                                <div className="flex-shrink-0">
                                    <div className={`w-10 h-5 rounded-full relative transition-colors ${isEnabled ? 'bg-blue-600' : 'bg-gray-300'
                                        }`}>
                                        <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${isEnabled ? 'left-6' : 'left-1'
                                            }`} />
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-between pt-6 border-t border-gray-200 mt-8">
                <button
                    onClick={handleReset}
                    className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
                >
                    <RotateCcw className="w-4 h-4" />
                    Réinitialiser par défaut
                </button>

                <div className="flex items-center gap-3">
                    {saveMessage && (
                        <span className={`text-sm font-medium ${saveMessage.startsWith('✓') ? 'text-green-600' : 'text-red-600'
                            }`}>
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
                        {isSaving ? 'Enregistrement...' : 'Enregistrer'}
                    </button>
                </div>
            </div>
        </div>
    );
}
