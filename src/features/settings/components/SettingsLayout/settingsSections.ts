/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect - Settings Sections Configuration
*/

export interface SettingsSection {
    id: string;
    label: string;
    icon: string;
    description: string;
    keywords: string[];
}

export const SETTINGS_SECTIONS: SettingsSection[] = [
    { id: 'customization', label: 'Personnalisation', icon: '🎨', description: 'Couleurs, en-tête, champs obligatoires', keywords: ['couleur', 'theme', 'header', 'champs', 'obligatoire', 'logo', 'style'] },
    { id: 'modules', label: 'Modules', icon: '🛡️', description: 'Activer/Désactiver les fonctionnalités du service', keywords: ['module', 'fonctionnalité', 'activation', 'médiation', 'simplified', 'flux'] },
    { id: 'colonnes', label: 'Colonnes Liste', icon: '🗒️', description: 'Personnaliser les colonnes de la liste usagers', keywords: ['colonne', 'liste', 'affichage', 'tableau', 'usager', 'visible'] },
    { id: 'formulaire', label: 'Sections Formulaire', icon: '📝', description: 'Activer/désactiver les sections du formulaire usager', keywords: ['formulaire', 'section', 'champ', 'cacher', 'afficher', 'logement', 'mediation'] },
    { id: 'general', label: 'Général', icon: '⚙️', description: 'Nom du service, logo communal', keywords: ['nom', 'service', 'logo', 'general', 'application'] },
    { id: 'gestionnaires', label: 'Gestionnaires', icon: '👥', description: 'Gestion de l\'équipe', keywords: ['gestionnaire', 'équipe', 'utilisateur', 'membre', 'staff'] },
    { id: 'options', label: 'Options', icon: '📋', description: 'Listes déroulantes personnalisables', keywords: ['option', 'liste', 'dropdown', 'select', 'choix'] },
    { id: 'partenaires', label: 'Partenaires', icon: '🤝', description: 'Organisations partenaires', keywords: ['partenaire', 'organisation', 'association', 'externe'] },
    { id: 'geographie', label: 'Géographie', icon: '🌍', description: 'Secteurs, communes, zones', keywords: ['secteur', 'commune', 'zone', 'géographie', 'localisation'] },
    { id: 'equipe', label: 'Vie d\'équipe', icon: '🎂', description: 'Anniversaires et événements', keywords: ['anniversaire', 'birthday', 'équipe', 'événement', 'fête'] },
    { id: 'antennes', label: 'Antennes', icon: '🏢', description: 'Succursales et bureaux', keywords: ['antenne', 'succursale', 'bureau', 'branch', 'site'] },
    { id: 'ai', label: 'Intelligence Artificielle', icon: '🤖', description: 'Configuration Ollama et modèles', keywords: ['ia', 'ai', 'ollama', 'modèle', 'llm', 'gemma', 'qwen', 'mistral'] },
    { id: 'prestations', label: 'Suivi Prestations', icon: '⏱️', description: 'Suivi des heures et bonis de l\'équipe', keywords: ['prestation', 'heure', 'bonis', 'travail', 'suivi', 'équipe'] },
    { id: 'documents', label: 'Documents', icon: '📄', description: 'Paramètres des attestations et fiches', keywords: ['document', 'attestation', 'rgpd', 'fiche', 'pdf', 'impression', 'conservation'] },
    { id: 'mon-horaire', label: 'Mon Horaire', icon: '🕒', description: 'Configurer votre horaire de travail habituel', keywords: ['horaire', 'travail', 'pause', 'habituel', 'défaut', 'prestation'] },
];
