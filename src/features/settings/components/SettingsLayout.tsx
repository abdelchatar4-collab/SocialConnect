/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect est un logiciel libre : vous pouvez le redistribuer et/ou le modifier selon les termes de la Licence Publique Générale GNU telle que publiée par la Free Software Foundation, soit la version 3 de la licence, soit (à votre convenance) toute version ultérieure.
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
import ModuleSettings from '@/components/settings/ModuleSettings';
import ColumnVisibilitySettings from '@/components/settings/ColumnVisibilitySettings';
import FormSectionSettings from '@/components/settings/FormSectionSettings';
import { PrestationAdmin } from '@/features/prestations/components/PrestationAdmin';
import { PersonalPrestationSettings } from '@/features/prestations/components/PersonalPrestationSettings';
import { useSession } from 'next-auth/react';

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
        id: 'modules',
        label: 'Modules',
        icon: '🛡️',
        description: 'Activer/Désactiver les fonctionnalités du service',
        keywords: ['module', 'fonctionnalité', 'activation', 'médiation', 'simplified', 'flux'],
    },
    {
        id: 'colonnes',
        label: 'Colonnes Liste',
        icon: '🗒️',
        description: 'Personnaliser les colonnes de la liste usagers',
        keywords: ['colonne', 'liste', 'affichage', 'tableau', 'usager', 'visible'],
    },
    {
        id: 'formulaire',
        label: 'Sections Formulaire',
        icon: '📝',
        description: 'Activer/désactiver les sections du formulaire usager',
        keywords: ['formulaire', 'section', 'champ', 'cacher', 'afficher', 'logement', 'mediation'],
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
    {
        id: 'prestations',
        label: 'Suivi Prestations',
        icon: '⏱️',
        description: 'Suivi des heures et bonis de l\'équipe',
        keywords: ['prestation', 'heure', 'bonis', 'travail', 'suivi', 'équipe'],
    },
    {
        id: 'mon-horaire',
        label: 'Mon Horaire',
        icon: '🕒',
        description: 'Configurer votre horaire de travail habituel',
        keywords: ['horaire', 'travail', 'pause', 'habituel', 'défaut', 'prestation'],
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
    defaultSection,
}) => {
    const { data: session } = useSession();
    const userRole = (session?.user as any)?.role || 'USER';
    const isAdmin = userRole === 'ADMIN' || userRole === 'SUPER_ADMIN';

    const [activeSection, setActiveSection] = useState(defaultSection || (isAdmin ? 'customization' : 'mon-horaire'));
    const [searchQuery, setSearchQuery] = useState('');
    const [toast, setToast] = useState<ToastState>({ show: false, type: 'success', message: '' });

    // Filter sections based on SEARCH, SERVICE AND ROLE
    const filteredSections = useMemo(() => {
        const currentServiceId = (session?.user as any)?.serviceId || 'default';
        const role = (session?.user as any)?.role || 'USER';
        const isUserAdmin = role === 'ADMIN' || role === 'SUPER_ADMIN';

        let sections = SETTINGS_SECTIONS;

        // Restriction par rôle : Un USER ne voit que son horaire, la vie d'équipe et ses prestations
        if (!isUserAdmin) {
            sections = sections.filter(s => ['mon-horaire', 'equipe'].includes(s.id));
        }

        // MASQUER LES ANTENNES POUR LES SERVICES NON-DEFAULT (PASQ)
        if (currentServiceId !== 'default') {
            sections = sections.filter(s => s.id !== 'antennes');
        }

        if (!searchQuery.trim()) return sections;

        const query = searchQuery.toLowerCase();
        return sections.filter(section =>
            section.label.toLowerCase().includes(query) ||
            section.description.toLowerCase().includes(query) ||
            section.keywords.some(kw => kw.includes(query))
        );
    }, [searchQuery, session]);

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
            case 'modules':
                return <ModuleSettings />;
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
            case 'colonnes':
                return <ColumnVisibilitySettings />;
            case 'formulaire':
                return <FormSectionSettings />;
            case 'prestations':
                return <PrestationAdmin />;
            case 'mon-horaire':
                return <PersonalPrestationSettings />;
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
