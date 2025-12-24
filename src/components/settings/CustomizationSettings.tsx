/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect est un logiciel libre : vous pouvez le redistribuer et/ou le modifier selon les termes de la Licence Publique Générale GNU telle que publiée par la Free Software Foundation, soit la version 3 de la licence, soit (à votre convenance) toute version ultérieure.

Ce programme est distribué dans l'espoir qu'il sera utile, mais SANS AUCUNE GARANTIE ; sans même la garantie implicite de COMMERCIALISATION ou d'ADÉQUATION À UN USAGE PARTICULIER. Voir la Licence Publique Générale GNU pour plus de détails.
*/

'use client';

/**
 * CustomizationSettings - Modern redesigned version
 * Colors, header, required fields configuration
 */

import { useState } from 'react';
import { useAdmin } from '@/contexts/AdminContext';
import { Check, Palette, Type, Eye, ClipboardCheck, RotateCcw, Save, Loader2, Plus, X } from 'lucide-react';

export default function CustomizationSettings() {
    const {
        primaryColor,
        setPrimaryColor,
        headerSubtitle,
        setHeaderSubtitle,
        showCommunalLogo,
        setShowCommunalLogo,
        requiredFields,
        setRequiredFields,
        availableYears,
        setAvailableYears,
        saveSettings
    } = useAdmin();

    const [isSaving, setIsSaving] = useState(false);
    const [saveMessage, setSaveMessage] = useState('');

    // Preset colors
    const presetColors = [
        { name: 'Bleu professionnel', color: '#1e3a8a' },
        { name: 'Bleu ciel', color: '#0284c7' },
        { name: 'Indigo', color: '#4f46e5' },
        { name: 'Violet', color: '#7c3aed' },
        { name: 'Rose', color: '#db2777' },
        { name: 'Rouge', color: '#dc2626' },
        { name: 'Orange', color: '#ea580c' },
        { name: 'Vert émeraude', color: '#059669' },
        { name: 'Vert forêt', color: '#16a34a' },
        { name: 'Turquoise PASQ', color: '#0891b2' },
        { name: 'Gris ardoise', color: '#475569' },
        { name: 'Gris foncé', color: '#374151' }
    ];

    // Fields by section
    const fieldsBySection = [
        {
            section: 'Identification & Contact',
            icon: '👤',
            fields: [
                { id: 'nom', label: 'Nom' },
                { id: 'prenom', label: 'Prénom' },
                { id: 'telephone', label: 'Téléphone' },
                { id: 'email', label: 'Email' },
                { id: 'premierContact', label: 'Premier contact' },
                { id: 'adresse.rue', label: 'Rue' },
                { id: 'adresse.codePostal', label: 'Code postal' },
                { id: 'adresse.ville', label: 'Ville' }
            ]
        },
        {
            section: 'Informations personnelles',
            icon: '📋',
            fields: [
                { id: 'dateNaissance', label: 'Date de naissance' },
                { id: 'genre', label: 'Genre' },
                { id: 'nationalite', label: 'Nationalité' },
                { id: 'statutSejour', label: 'Statut de séjour' },
                { id: 'langue', label: 'Langue(s)' },
                { id: 'situationProfessionnelle', label: 'Situation pro' }
            ]
        },
        {
            section: 'Gestion administrative',
            icon: '⚙️',
            fields: [
                { id: 'gestionnaire', label: 'Gestionnaire' },
                { id: 'antenne', label: 'Antenne' },
                { id: 'etat', label: 'État du dossier' },
                { id: 'dateOuverture', label: "Date d'ouverture" },
                { id: 'partenaire', label: 'Partenaire(s)' }
            ]
        },
        {
            section: 'Logement',
            icon: '🏠',
            fields: [
                { id: 'logementDetails.typeLogement', label: 'Type logement' },
                { id: 'logementDetails.proprietaire', label: 'Propriétaire' },
                { id: 'logementDetails.loyer', label: 'Loyer' },
                { id: 'revenus', label: 'Revenus' }
            ]
        }
    ];

    const handleSave = async () => {
        setIsSaving(true);
        setSaveMessage('');
        try {
            await saveSettings();
            setSaveMessage('✓ Sauvegardé');
            setTimeout(() => setSaveMessage(''), 3000);
        } catch {
            setSaveMessage('✗ Erreur');
            setTimeout(() => setSaveMessage(''), 3000);
        } finally {
            setIsSaving(false);
        }
    };

    const toggleRequiredField = (fieldId: string) => {
        if (requiredFields.includes(fieldId)) {
            setRequiredFields(requiredFields.filter(f => f !== fieldId));
        } else {
            setRequiredFields([...requiredFields, fieldId]);
        }
    };

    const handleAddYear = () => {
        const nextYear = Math.max(...availableYears, new Date().getFullYear()) + 1;
        setAvailableYears([...availableYears, nextYear].sort((a, b) => a - b));
    };

    const handleRemoveYear = (yearToRemove: number) => {
        if (availableYears.length <= 1) {
            alert("Vous devez garder au moins une année d'exercice.");
            return;
        }
        setAvailableYears(availableYears.filter(y => y !== yearToRemove));
    };

    return (
        <div className="space-y-6">
            {/* Color Section */}
            <div className="settings-card">
                <div className="settings-card-header">
                    <div className="settings-card-icon settings-card-icon--purple">
                        <Palette className="w-4 h-4" />
                    </div>
                    <div>
                        <h3 className="settings-card-title">Couleur principale</h3>
                        <p className="settings-card-subtitle">Personnalisez l'identité visuelle</p>
                    </div>
                </div>
                <div className="settings-card-body">
                    {/* Preset colors grid */}
                    <div className="grid grid-cols-6 md:grid-cols-12 gap-2 mb-4">
                        {presetColors.map((preset) => (
                            <button
                                key={preset.color}
                                onClick={() => setPrimaryColor(preset.color)}
                                className={`aspect-square rounded-lg transition-all relative ${primaryColor === preset.color
                                    ? 'ring-2 ring-offset-2 ring-cyan-500 scale-110'
                                    : 'hover:scale-105'
                                    }`}
                                style={{ backgroundColor: preset.color }}
                                title={preset.name}
                            >
                                {primaryColor === preset.color && (
                                    <Check className="w-4 h-4 text-white absolute inset-0 m-auto drop-shadow" />
                                )}
                            </button>
                        ))}
                    </div>

                    {/* Custom color */}
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <input
                            type="color"
                            value={primaryColor}
                            onChange={(e) => setPrimaryColor(e.target.value)}
                            className="h-10 w-14 rounded border-2 border-gray-200 cursor-pointer"
                        />
                        <input
                            type="text"
                            value={primaryColor}
                            onChange={(e) => setPrimaryColor(e.target.value)}
                            className="flex-1 px-3 py-2 border border-gray-200 rounded-lg font-mono text-sm"
                            placeholder="#0891b2"
                        />
                        <button
                            onClick={() => setPrimaryColor('#0891b2')}
                            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                            title="Réinitialiser"
                        >
                            <RotateCcw className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Header Section */}
            <div className="settings-card">
                <div className="settings-card-header">
                    <div className="settings-card-icon settings-card-icon--blue">
                        <Type className="w-4 h-4" />
                    </div>
                    <div>
                        <h3 className="settings-card-title">En-tête</h3>
                        <p className="settings-card-subtitle">Texte et affichage</p>
                    </div>
                </div>
                <div className="settings-card-body space-y-4">
                    <div>
                        <label className="settings-label">Sous-titre</label>
                        <input
                            type="text"
                            value={headerSubtitle}
                            onChange={(e) => setHeaderSubtitle(e.target.value)}
                            className="settings-input"
                            placeholder="PORTAIL DE GESTION"
                        />
                        <p className="settings-hint">Texte affiché sous le nom du service</p>
                    </div>
                </div>
            </div>

            {/* Display Options */}
            <div className="settings-card">
                <div className="settings-card-header">
                    <div className="settings-card-icon settings-card-icon--green">
                        <Eye className="w-4 h-4" />
                    </div>
                    <div>
                        <h3 className="settings-card-title">Affichage</h3>
                        <p className="settings-card-subtitle">Options visuelles</p>
                    </div>
                </div>
                <div className="settings-card-body">
                    <label className="flex items-center gap-3 cursor-pointer p-3 hover:bg-gray-50 rounded-lg transition-colors">
                        <input
                            type="checkbox"
                            checked={showCommunalLogo}
                            onChange={(e) => setShowCommunalLogo(e.target.checked)}
                            className="w-5 h-5 text-cyan-600 border-gray-300 rounded focus:ring-cyan-500"
                        />
                        <div>
                            <span className="font-medium text-gray-900">Afficher le logo communal</span>
                            <p className="text-sm text-gray-500">Logo visible dans le header</p>
                        </div>
                    </label>
                </div>
            </div>

            {/* Exercise Period Section */}
            <div className="settings-card">
                <div className="settings-card-header">
                    <div className="settings-card-icon settings-card-icon--purple">
                        <RotateCcw className="w-4 h-4" />
                    </div>
                    <div>
                        <h3 className="settings-card-title">Période d'exercice</h3>
                        <p className="settings-card-subtitle">Gérez les années disponibles</p>
                    </div>
                </div>
                <div className="settings-card-body">
                    <div className="flex flex-wrap gap-2 mb-4">
                        {availableYears.map((year) => (
                            <div
                                key={year}
                                className="flex items-center gap-2 bg-purple-50 text-purple-700 px-3 py-1.5 rounded-full border border-purple-100 group transition-all"
                            >
                                <span className="font-semibold">{year}</span>
                                <button
                                    onClick={() => handleRemoveYear(year)}
                                    className="p-0.5 hover:bg-purple-200 rounded-full transition-colors"
                                    title={`Supprimer ${year}`}
                                >
                                    <X className="w-3.5 h-3.5" />
                                </button>
                            </div>
                        ))}
                        <button
                            onClick={handleAddYear}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-dashed border-purple-300 text-purple-600 hover:bg-purple-50 hover:border-purple-400 transition-all font-medium text-sm"
                        >
                            <Plus className="w-4 h-4" />
                            Ajouter une année
                        </button>
                    </div>
                    <p className="settings-hint">Ces années apparaissent dans le sélecteur de période en haut de l'application.</p>
                </div>
            </div>

            {/* Required Fields */}
            <div className="settings-card">
                <div className="settings-card-header">
                    <div className="settings-card-icon settings-card-icon--amber">
                        <ClipboardCheck className="w-4 h-4" />
                    </div>
                    <div>
                        <h3 className="settings-card-title">Champs obligatoires</h3>
                        <p className="settings-card-subtitle">{requiredFields.length} champ(s) sélectionné(s)</p>
                    </div>
                </div>
                <div className="settings-card-body">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {fieldsBySection.map((section) => (
                            <div key={section.section} className="bg-gray-50 rounded-lg p-3">
                                <h4 className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2 flex items-center gap-1.5">
                                    <span>{section.icon}</span>
                                    {section.section}
                                </h4>
                                <div className="space-y-1">
                                    {section.fields.map((field) => (
                                        <label
                                            key={field.id}
                                            className="flex items-center gap-2 cursor-pointer p-1.5 rounded hover:bg-white transition-colors"
                                        >
                                            <input
                                                type="checkbox"
                                                checked={requiredFields.includes(field.id)}
                                                onChange={() => toggleRequiredField(field.id)}
                                                className="w-4 h-4 text-amber-600 border-gray-300 rounded focus:ring-amber-500"
                                            />
                                            <span className="text-sm text-gray-700">{field.label}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Save Button */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200 sticky bottom-0 bg-white py-4 -mx-6 px-6">
                {saveMessage && (
                    <span className={`text-sm font-medium ${saveMessage.startsWith('✓') ? 'text-green-600' : 'text-red-600'}`}>
                        {saveMessage}
                    </span>
                )}
                <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="settings-btn settings-btn--primary"
                >
                    {isSaving ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                        <Save className="w-4 h-4" />
                    )}
                    {isSaving ? 'Sauvegarde...' : 'Enregistrer'}
                </button>
            </div>
        </div>
    );
}
