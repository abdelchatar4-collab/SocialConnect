/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect - UserListFilters Types
*/

import { User } from '@/types/user';

export type FilterType = 'all' | 'nom' | 'prenom' | 'email' | 'gestionnaire' | 'secteur' | 'antenne' | 'etat' | 'adresse';

export interface UserListFiltersProps {
    searchTerm: string;
    searchField: FilterType;
    onSearchTermChange: (value: string) => void;
    onSearchFieldChange: (field: FilterType) => void;
    problematiqueFilter: string;
    onProblematiqueFilterChange: (filter: string) => void;
    problematiquesOptions: Array<{ value: string; label: string }>;
    showImportantInfoOnly: boolean;
    onShowImportantInfoOnlyChange: (value: boolean) => void;
    showDonneesConfidentielles: boolean;
    onShowDonneesConfidentiellesChange: (value: boolean) => void;
    showMissingBirthDate: boolean;
    onShowMissingBirthDateChange: (value: boolean) => void;
    showDuplicates: boolean;
    onShowDuplicatesChange: (value: boolean) => void;
    includeDateInDuplicates: boolean;
    onIncludeDateInDuplicatesChange: (value: boolean) => void;
    importantInfoCount: number;
    donneesConfidentiellesCount: number;
    missingBirthDateCount: number;
    duplicatesCount: number;
    totalUsersCount: number;
    lastAddedUser: User | null;
    myDossiersCount: number;
    currentUserIdentifier?: string;
    showProblematiques: boolean;
    onShowProblematiquesChange: (value: boolean) => void;
    showActions: boolean;
    onShowActionsChange: (value: boolean) => void;
    showDossier: boolean;
    onShowDossierChange: (value: boolean) => void;
    showPhone: boolean;
    onShowPhoneChange: (value: boolean) => void;
    showAdresse: boolean;
    onShowAdresseChange: (value: boolean) => void;
    showDateNaissance: boolean;
    onShowDateNaissanceChange: (value: boolean) => void;
    viewMode: 'table' | 'cards';
    onViewModeChange: (mode: 'table' | 'cards') => void;
    onAddUser?: () => void;
    onLastAddedClick?: (userId: string) => void;
}
