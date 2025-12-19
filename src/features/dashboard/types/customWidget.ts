/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect est un logiciel libre : vous pouvez le redistribuer et/ou le modifier selon les termes de la Licence Publique Générale GNU telle que publiée par la Free Software Foundation, soit la version 3 de la licence, soit (à votre convenance) toute version ultérieure.

Ce programme est distribué dans l'espoir qu'il sera utile, mais SANS AUCUNE GARANTIE ; sans même la garantie implicite de COMMERCIALISATION ou d'ADÉQUATION À UN USAGE PARTICULIER. Voir la Licence Publique Générale GNU pour plus de détails.
*/

/**
 * Custom Widget Types - Type definitions for user-created dashboard widgets
 */

// ============ Field Registry ============
// All fields available for analysis, organized by section

export interface AnalyzableFieldConfig {
    id: string;
    label: string;
    section: FieldSection;
    path: string; // dot notation path in User object
    type: 'select' | 'multi' | 'boolean' | 'text';
}

export type FieldSection =
    | 'identification'
    | 'infosPerso'
    | 'gestion'
    | 'logement'
    | 'prevExp'
    | 'problematiques'
    | 'actions';

export const FIELD_SECTIONS: Record<FieldSection, string> = {
    identification: 'Identification',
    infosPerso: 'Infos personnelles',
    gestion: 'Gestion',
    logement: 'Logement',
    prevExp: 'Prévention Expulsion',
    problematiques: 'Problématiques',
    actions: 'Actions',
};

// Complete field registry
export const ANALYZABLE_FIELDS: AnalyzableFieldConfig[] = [
    // Identification
    { id: 'secteur', label: 'Secteur', section: 'identification', path: 'secteur', type: 'text' },

    // Infos personnelles
    { id: 'genre', label: 'Genre', section: 'infosPerso', path: 'genre', type: 'select' },
    { id: 'nationalite', label: 'Nationalité', section: 'infosPerso', path: 'nationalite', type: 'select' },
    { id: 'statutSejour', label: 'Statut de séjour', section: 'infosPerso', path: 'statutSejour', type: 'select' },
    { id: 'langue', label: 'Langue', section: 'infosPerso', path: 'langue', type: 'select' },
    { id: 'trancheAge', label: 'Tranche d\'âge', section: 'infosPerso', path: 'trancheAge', type: 'select' },
    { id: 'situationProfessionnelle', label: 'Situation professionnelle', section: 'infosPerso', path: 'situationProfessionnelle', type: 'select' },

    // Gestion
    { id: 'antenne', label: 'Antenne', section: 'gestion', path: 'antenne', type: 'select' },
    { id: 'gestionnaire', label: 'Gestionnaire', section: 'gestion', path: 'gestionnaire', type: 'select' },
    { id: 'etat', label: 'État du dossier', section: 'gestion', path: 'etat', type: 'select' },

    // Logement
    { id: 'typeLogement', label: 'Type de logement', section: 'logement', path: 'logementDetails.typeLogement', type: 'select' },
    { id: 'bailEnregistre', label: 'Bail enregistré', section: 'logement', path: 'logementDetails.bailEnregistre', type: 'select' },
    { id: 'dureeContrat', label: 'Durée du contrat', section: 'logement', path: 'logementDetails.dureeContrat', type: 'select' },
    { id: 'statutGarantie', label: 'Statut garantie', section: 'logement', path: 'logementDetails.statutGarantie', type: 'select' },
    { id: 'typeLitige', label: 'Type de litige', section: 'logement', path: 'logementDetails.typeLitige', type: 'multi' },
    { id: 'revenus', label: 'Sources de revenus', section: 'logement', path: 'revenus', type: 'multi' },

    // Prévention Expulsion
    { id: 'prevExpDecision', label: 'Décision', section: 'prevExp', path: 'prevExpDecision', type: 'select' },
    { id: 'prevExpDemandeCpas', label: 'Demande CPAS', section: 'prevExp', path: 'prevExpDemandeCpas', type: 'select' },
    { id: 'prevExpNegociationProprio', label: 'Négociation proprio', section: 'prevExp', path: 'prevExpNegociationProprio', type: 'select' },
    { id: 'prevExpSolutionRelogement', label: 'Solution relogement', section: 'prevExp', path: 'prevExpSolutionRelogement', type: 'select' },
    { id: 'prevExpMaintienLogement', label: 'Maintien logement', section: 'prevExp', path: 'prevExpMaintienLogement', type: 'select' },
    { id: 'prevExpTypeFamille', label: 'Type de famille', section: 'prevExp', path: 'prevExpTypeFamille', type: 'select' },
    { id: 'prevExpTypeRevenu', label: 'Type de revenu', section: 'prevExp', path: 'prevExpTypeRevenu', type: 'select' },
    { id: 'prevExpEtatLogement', label: 'État du logement', section: 'prevExp', path: 'prevExpEtatLogement', type: 'select' },
    { id: 'prevExpNombreChambre', label: 'Nombre de chambres', section: 'prevExp', path: 'prevExpNombreChambre', type: 'select' },
    { id: 'prevExpAideJuridique', label: 'Aide juridique', section: 'prevExp', path: 'prevExpAideJuridique', type: 'select' },
    { id: 'prevExpMotifRequete', label: 'Motif de requête', section: 'prevExp', path: 'prevExpMotifRequete', type: 'select' },

    // Problématiques
    { id: 'problematiquesType', label: 'Type de problématique', section: 'problematiques', path: 'problematiques[].type', type: 'multi' },

    // Actions
    { id: 'actionsType', label: 'Type d\'action', section: 'actions', path: 'actions[].type', type: 'multi' },
    { id: 'actionsPartenaire', label: 'Partenaire (actions)', section: 'actions', path: 'actions[].partenaire', type: 'multi' },
];

// ============ Filter Configuration ============

export interface FilterConfig {
    id: string;
    label: string;
    type: 'boolean' | 'select' | 'dateRange';
    path?: string;
}

export const AVAILABLE_FILTERS: FilterConfig[] = [
    { id: 'hasPrevExp', label: 'Prévention Expulsion uniquement', type: 'boolean', path: 'hasPrevExp' },
    { id: 'isActive', label: 'Dossiers actifs uniquement', type: 'boolean' }, // Special: checks etat
    { id: 'hasLitige', label: 'Litige logement', type: 'boolean', path: 'logementDetails.hasLitige' },
    { id: 'antenne', label: 'Par antenne', type: 'select', path: 'antenne' },
    { id: 'gestionnaire', label: 'Par gestionnaire', type: 'select', path: 'gestionnaire' },
    { id: 'dateRange', label: 'Période d\'ouverture', type: 'dateRange', path: 'dateOuverture' },
];

// ============ Custom Widget Types ============

export type ChartType = 'pie' | 'bar' | 'table';

export interface CustomWidgetFilters {
    hasPrevExp?: boolean;
    isActive?: boolean;
    hasLitige?: boolean;
    antenne?: string;
    gestionnaire?: string;
    dateRange?: {
        start: string | null;
        end: string | null;
    };
}

export interface CustomWidgetConfig {
    id: string;
    name: string;
    analyzeField: string; // Field ID from ANALYZABLE_FIELDS
    chartType: ChartType;
    filters: CustomWidgetFilters;
    createdAt: string;
    order: number;
}

// ============ Helper Functions ============

export const getFieldById = (id: string): AnalyzableFieldConfig | undefined =>
    ANALYZABLE_FIELDS.find(f => f.id === id);

export const getFieldsBySection = (section: FieldSection): AnalyzableFieldConfig[] =>
    ANALYZABLE_FIELDS.filter(f => f.section === section);

export const getFilterById = (id: string): FilterConfig | undefined =>
    AVAILABLE_FILTERS.find(f => f.id === id);

// Default empty widget for creation
export const createEmptyWidget = (): Omit<CustomWidgetConfig, 'id' | 'createdAt' | 'order'> => ({
    name: '',
    analyzeField: 'genre',
    chartType: 'pie',
    filters: {},
});
