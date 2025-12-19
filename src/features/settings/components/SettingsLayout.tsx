/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect est un logiciel libre : vous pouvez le redistribuer et/ou le modifier selon les termes de la Licence Publique Générale GNU telle que publiée par la Free Software Foundation, soit la version 3 de la licence, soit (à votre convenance) toute version ultérieure.

Ce programme est distribué dans l'espoir qu'il sera utile, mais SANS AUCUNE GARANTIE ; sans même la garantie implicite de COMMERCIALISATION ou d'ADÉQUATION À UN USAGE PARTICULIER. Voir la Licence Publique Générale GNU pour plus de détails.
*/

/**
 * SettingsLayout - Modern settings page with sidebar navigation
 */

'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { X, Search, Check, AlertCircle } from 'lucide-react';
import '../styles/settings-modern.css';

// Import existing settings components
import GeneralSettings from '@/components/settings/GeneralSettings';
import CustomizationSettings from '@/components/settings/CustomizationSettings';
import GestionnaireSettings from '@/components/settings/GestionnaireSettings';
import DropdownOptionsSettings from '@/components/settings/DropdownOptionsSettings';
import { PartenairesSettings } from '@/components/settings/PartenairesSettings';
import GeographicalSettings from '@/components/settings/GeographicalSettings';
import { BirthdaySettings } from '@/components/settings/BirthdaySettings';
import AntennesSettings from '@/components/settings/AntennesSettings';
import AiSettings from '@/components/settings/AiSettings';

// Section configuration
interface SettingsSection {
    id: string;
    label: string;
    icon: string;
    description: string;
    keywords: string[];
}

const SETTINGS_SECTIONS: SettingsSection[] = [
    {
        id: 'customization',
        label: 'Personnalisation',
        icon: '🎨',
        description: 'Couleurs, en-tête, champs obligatoires',
        keywords: ['couleur', 'theme', 'header', 'champs', 'obligatoire', 'logo', 'style'],
    },
    {
        id: 'general',
        label: 'Général',
        icon: '⚙️',
        description: 'Nom du service, logo communal',
        keywords: ['nom', 'service', 'logo', 'general', 'application'],
    },
    {
        id: 'gestionnaires',
        label: 'Gestionnaires',
        icon: '👥',
        description: 'Gestion de l\'équipe',
        keywords: ['gestionnaire', 'équipe', 'utilisateur', 'membre', 'staff'],
    },
    {
        id: 'options',
        label: 'Options',
        icon: '📋',
        description: 'Listes déroulantes personnalisables',
        keywords: ['option', 'liste', 'dropdown', 'select', 'choix'],
    },
    {
        id: 'partenaires',
        label: 'Partenaires',
        icon: '🤝',
        description: 'Organisations partenaires',
        keywords: ['partenaire', 'organisation', 'association', 'externe'],
    },
    {
        id: 'geographie',
        label: 'Géographie',
        icon: '🌍',
        description: 'Secteurs, communes, zones',
        keywords: ['secteur', 'commune', 'zone', 'géographie', 'localisation'],
    },
    {
        id: 'equipe',
        label: 'Vie d\'équipe',
        icon: '🎂',
        description: 'Anniversaires et événements',
        keywords: ['anniversaire', 'birthday', 'équipe', 'événement', 'fête'],
    },
    {
        id: 'antennes',
        label: 'Antennes',
        icon: '🏢',
        description: 'Succursales et bureaux',
        keywords: ['antenne', 'succursale', 'bureau', 'branch', 'site'],
    },
    {
        id: 'ai',
        label: 'Intelligence Artificielle',
        icon: '🤖',
        description: 'Configuration Ollama et modèles',
        keywords: ['ia', 'ai', 'ollama', 'modèle', 'llm', 'gemma', 'qwen', 'mistral'],
    },
];

// Toast notification state
interface ToastState {
    show: boolean;
    type: 'success' | 'error';
    message: string;
}

interface SettingsLayoutProps {
    isOpen: boolean;
    onClose: () => void;
    defaultSection?: string;
}

export const SettingsLayout: React.FC<SettingsLayoutProps> = ({
    isOpen,
    onClose,
    defaultSection = 'customization',
}) => {
    const [activeSection, setActiveSection] = useState(defaultSection);
    const [searchQuery, setSearchQuery] = useState('');
    const [toast, setToast] = useState<ToastState>({ show: false, type: 'success', message: '' });

    // Filter sections based on search
    const filteredSections = useMemo(() => {
        if (!searchQuery.trim()) return SETTINGS_SECTIONS;

        const query = searchQuery.toLowerCase();
        return SETTINGS_SECTIONS.filter(section =>
            section.label.toLowerCase().includes(query) ||
            section.description.toLowerCase().includes(query) ||
            section.keywords.some(kw => kw.includes(query))
        );
    }, [searchQuery]);

    // Show toast notification
    const showToast = useCallback((type: 'success' | 'error', message: string) => {
        setToast({ show: true, type, message });
        setTimeout(() => setToast(prev => ({ ...prev, show: false })), 3000);
    }, []);

    // Get active section config
    const activeSectionConfig = SETTINGS_SECTIONS.find(s => s.id === activeSection);

    // Render section component
    const renderSectionContent = () => {
        switch (activeSection) {
            case 'customization':
                return <CustomizationSettings />;
            case 'general':
                return <GeneralSettings />;
            case 'gestionnaires':
                return <GestionnaireSettings />;
            case 'options':
                return <DropdownOptionsSettings />;
            case 'partenaires':
                return <PartenairesSettings />;
            case 'geographie':
                return <GeographicalSettings />;
            case 'equipe':
                return <BirthdaySettings />;
            case 'antennes':
                return <AntennesSettings />;
            case 'ai':
                return <AiSettings />;
            default:
                return <div className="p-8 text-center text-gray-500">Section non trouvée</div>;
        }
    };

    if (!isOpen) return null;

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 transition-opacity"
                onClick={onClose}
            />

            {/* Modal - Full screen */}
            <div className="fixed inset-0 z-50 flex items-center justify-center sm:p-4 md:p-6 pointer-events-none">
                <div
                    className="settings-container w-full h-full shadow-2xl overflow-hidden bg-white sm:rounded-xl ring-1 ring-black/10 pointer-events-auto settings-animate-in"
                    style={{ maxHeight: '100%' }}
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Sidebar */}
                    <aside className="settings-sidebar">
                        <div className="settings-sidebar-header">
                            <div className="flex items-center justify-between">
                                <span className="settings-sidebar-title">Paramètres</span>
                                <button
                                    onClick={onClose}
                                    className="p-1.5 hover:bg-gray-200 rounded-lg transition-colors md:hidden"
                                >
                                    <X className="w-4 h-4 text-gray-500" />
                                </button>
                            </div>

                            {/* Search */}
                            <div className="settings-search">
                                <Search className="settings-search-icon" />
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Rechercher..."
                                    className="settings-search-input"
                                />
                            </div>
                        </div>

                        {/* Navigation */}
                        <nav className="settings-nav">
                            {filteredSections.map((section) => (
                                <button
                                    key={section.id}
                                    onClick={() => setActiveSection(section.id)}
                                    className={`settings-nav-item ${activeSection === section.id ? 'settings-nav-item--active' : ''
                                        }`}
                                >
                                    <span className="settings-nav-icon">{section.icon}</span>
                                    <span className="settings-nav-label">{section.label}</span>
                                </button>
                            ))}

                            {filteredSections.length === 0 && (
                                <div className="text-sm text-gray-500 text-center py-4">
                                    Aucun résultat pour "{searchQuery}"
                                </div>
                            )}
                        </nav>
                    </aside>

                    {/* Content */}
                    <main className="settings-content">
                        <header className="settings-content-header">
                            <h2 className="settings-content-title">
                                <span className="settings-content-title-icon">
                                    {activeSectionConfig?.icon}
                                </span>
                                {activeSectionConfig?.label}
                            </h2>
                            <button
                                onClick={onClose}
                                className="p-2 hover:bg-gray-100 rounded-lg transition-colors hidden md:flex"
                                title="Fermer"
                            >
                                <X className="w-5 h-5 text-gray-500" />
                            </button>
                        </header>

                        <div className="settings-content-body settings-animate-in" key={activeSection}>
                            {activeSectionConfig && (
                                <p className="text-sm text-gray-500 mb-4">
                                    {activeSectionConfig.description}
                                </p>
                            )}
                            {renderSectionContent()}
                        </div>
                    </main>
                </div>
            </div>

            {/* Toast */}
            {toast.show && (
                <div className={`settings-toast settings-toast--${toast.type}`}>
                    {toast.type === 'success' ? (
                        <Check className="w-4 h-4" />
                    ) : (
                        <AlertCircle className="w-4 h-4" />
                    )}
                    {toast.message}
                </div>
            )}
        </>
    );
};

export default SettingsLayout;
