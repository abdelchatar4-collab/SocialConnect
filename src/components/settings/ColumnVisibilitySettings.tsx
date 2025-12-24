/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect est un logiciel libre : vous pouvez le redistribuer et/ou le modifier selon les termes de la Licence Publique Générale GNU telle que publiée par la Free Software Foundation, soit la version 3 de la licence, soit (à votre convenance) toute version ultérieure.

Ce programme est distribué dans l'espoir qu'il sera utile, mais SANS AUCUNE GARANTIE ; sans même la garantie implicite de COMMERCIALISATION ou d'ADÉQUATION À UN USAGE PARTICULIER. Voir la Licence Publique Générale GNU pour plus de détails.
*/

'use client';

/**
 * ColumnVisibilitySettings - Configuration des colonnes visibles dans la liste des usagers
 */

import { useState } from 'react';
import { useAdmin, DEFAULT_VISIBLE_COLUMNS } from '@/contexts/AdminContext';
import { Columns, Eye, EyeOff, RotateCcw, Save, Loader2, Check } from 'lucide-react';

// Définition des colonnes disponibles avec leurs labels
const COLUMN_DEFINITIONS = [
    { id: 'nom', label: 'Nom', description: 'Nom de famille', required: true },
    { id: 'prenom', label: 'Prénom', description: 'Prénom de l\'usager', required: true },
    { id: 'dateNaissance', label: 'Date de naissance', description: 'Date de naissance de l\'usager' },
    { id: 'telephone', label: 'Téléphone', description: 'Numéro de téléphone' },
    { id: 'email', label: 'Email', description: 'Adresse email' },
    { id: 'antenne', label: 'Antenne', description: 'Antenne de rattachement (PASQ uniquement)' },
    { id: 'secteur', label: 'Secteur', description: 'Secteur géographique' },
    { id: 'gestionnaire', label: 'Gestionnaire', description: 'Gestionnaire assigné' },
    { id: 'etat', label: 'État', description: 'État du dossier (Actif, Clôturé, etc.)' },
    { id: 'adresse', label: 'Adresse', description: 'Adresse complète' },
    { id: 'problematiques', label: 'Problématiques', description: 'Problématique principale' },
    { id: 'actions', label: 'Actions', description: 'Dernière action' },
    { id: 'dossier', label: 'N° Dossier', description: 'Numéro de dossier' }
];

export default function ColumnVisibilitySettings() {
    const { visibleColumns, setVisibleColumns, saveSettings } = useAdmin();
    const [isSaving, setIsSaving] = useState(false);
    const [saveMessage, setSaveMessage] = useState('');

    const handleToggleColumn = (columnId: string) => {
        // Les colonnes required ne peuvent pas être désactivées
        const column = COLUMN_DEFINITIONS.find(c => c.id === columnId);
        if (column?.required) return;

        setVisibleColumns({
            ...visibleColumns,
            [columnId]: !visibleColumns[columnId]
        });
    };

    const handleResetToDefault = () => {
        setVisibleColumns(DEFAULT_VISIBLE_COLUMNS);
    };

    const handleSave = async () => {
        setIsSaving(true);
        setSaveMessage('');
        try {
            await saveSettings();
            setSaveMessage('✓ Colonnes sauvegardées');
            setTimeout(() => setSaveMessage(''), 3000);
        } catch (error) {
            console.error('Erreur sauvegarde:', error);
            setSaveMessage('✗ Erreur de sauvegarde');
        } finally {
            setIsSaving(false);
        }
    };

    const visibleCount = Object.values(visibleColumns).filter(Boolean).length;

    return (
        <div className="settings-card">
            <div className="settings-card-header">
                <div className="flex items-center gap-3">
                    <div className="settings-card-icon settings-card-icon--purple">
                        <Columns className="w-4 h-4" />
                    </div>
                    <div>
                        <h3 className="settings-card-title">Colonnes de la Liste Usagers</h3>
                        <p className="settings-card-subtitle">
                            Personnalisez les colonnes visibles ({visibleCount}/{COLUMN_DEFINITIONS.length})
                        </p>
                    </div>
                </div>
            </div>

            <div className="settings-card-body space-y-4">
                {/* Grille des colonnes */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                    {COLUMN_DEFINITIONS.map((column) => {
                        const isVisible = visibleColumns[column.id] ?? DEFAULT_VISIBLE_COLUMNS[column.id] ?? true;
                        const isRequired = column.required;

                        return (
                            <button
                                key={column.id}
                                onClick={() => handleToggleColumn(column.id)}
                                disabled={isRequired}
                                className={`
                                    relative p-3 rounded-xl border-2 transition-all text-left
                                    ${isVisible
                                        ? 'border-cyan-500 bg-cyan-50/50 shadow-sm'
                                        : 'border-gray-200 bg-gray-50 hover:border-gray-300'}
                                    ${isRequired ? 'cursor-not-allowed opacity-80' : 'cursor-pointer hover:shadow-md'}
                                `}
                                title={column.description}
                            >
                                {/* Indicateur de visibilité */}
                                <div className="absolute top-2 right-2">
                                    {isVisible ? (
                                        <Eye className="w-4 h-4 text-cyan-600" />
                                    ) : (
                                        <EyeOff className="w-4 h-4 text-gray-400" />
                                    )}
                                </div>

                                {/* Contenu */}
                                <div className="pr-6">
                                    <div className={`font-medium text-sm ${isVisible ? 'text-cyan-700' : 'text-gray-600'}`}>
                                        {column.label}
                                    </div>
                                    <div className="text-xs text-gray-500 truncate mt-0.5">
                                        {column.description}
                                    </div>
                                </div>

                                {/* Badge required */}
                                {isRequired && (
                                    <div className="absolute bottom-2 right-2">
                                        <span className="text-[10px] text-gray-400 font-medium">requis</span>
                                    </div>
                                )}

                                {/* Checkmark si visible */}
                                {isVisible && (
                                    <div className="absolute -top-1 -left-1 w-5 h-5 bg-cyan-500 rounded-full flex items-center justify-center shadow-sm">
                                        <Check className="w-3 h-3 text-white" />
                                    </div>
                                )}
                            </button>
                        );
                    })}
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                    <button
                        onClick={handleResetToDefault}
                        className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <RotateCcw className="w-4 h-4" />
                        Réinitialiser
                    </button>

                    <div className="flex items-center gap-3">
                        {saveMessage && (
                            <span className={`text-sm ${saveMessage.includes('✓') ? 'text-green-600' : 'text-red-600'}`}>
                                {saveMessage}
                            </span>
                        )}
                        <button
                            onClick={handleSave}
                            disabled={isSaving}
                            className="flex items-center gap-2 px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-colors disabled:opacity-50"
                        >
                            {isSaving ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                <Save className="w-4 h-4" />
                            )}
                            Enregistrer
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
