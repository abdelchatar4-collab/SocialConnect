/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect est un logiciel libre : vous pouvez le redistribuer et/ou le modifier selon les termes de la Licence Publique Générale GNU telle que publiée par la Free Software Foundation, soit la version 3 de la licence, soit (à votre convenance) toute version ultérieure.

Ce programme est distribué dans l'espoir qu'il sera utile, mais SANS AUCUNE GARANTIE ; sans même la garantie implicite de COMMERCIALISATION ou d'ADÉQUATION À UN USAGE PARTICULIER. Voir la Licence Publique Générale GNU pour plus de détails.
*/

'use client';

import { useState, useCallback, useEffect } from 'react';
import { useAdmin } from '@/contexts/AdminContext';
import type { FilterType } from '../components/UserList/UserListFilters';

interface UseUserListStateProps {
    searchTerm?: string;
    searchField?: FilterType;
    sortField?: string | null;
    sortDirection?: 'asc' | 'desc';
    problematiqueFilter?: string;
    showImportantInfoOnly?: boolean;
    showDonneesConfidentielles?: boolean;
    showMissingBirthDate?: boolean;
    onSearchTermChange?: (value: string) => void;
    onSortChange?: (field: string | null, direction: 'asc' | 'desc') => void;
    onProblematiqueFilterChange?: (filter: string) => void;
    onShowImportantInfoOnlyChange?: (show: boolean) => void;
    onShowDonneesConfidentiellesChange?: (show: boolean) => void;
    onShowMissingBirthDateChange?: (show: boolean) => void;
}

export const useUserListState = (props: UseUserListStateProps = {}) => {
    const { visibleColumns } = useAdmin();

    // View Mode State
    const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');

    // Local filter state
    const [localSearchTerm, setLocalSearchTerm] = useState('');
    const [localSearchField, setLocalSearchField] = useState<FilterType>('all');
    const [localSortField, setLocalSortField] = useState<string | null>(null);
    const [localSortDirection, setLocalSortDirection] = useState<'asc' | 'desc'>('asc');
    const [localProblematiqueFilter, setLocalProblematiqueFilter] = useState('');
    const [localShowImportantInfoOnly, setLocalShowImportantInfoOnly] = useState(false);
    const [localShowDonneesConfidentielles, setLocalShowDonneesConfidentielles] = useState(false);
    const [localShowMissingBirthDate, setLocalShowMissingBirthDate] = useState(false);
    const [showDuplicates, setShowDuplicates] = useState(false);
    const [includeDateInDuplicates, setIncludeDateInDuplicates] = useState(true);

    // Selection state
    const [selectedUsers, setSelectedUsers] = useState<string[]>([]);

    // Column visibility toggles - initialized from visibleColumns settings
    const [showProblematiques, setShowProblematiques] = useState(visibleColumns.problematiques ?? false);
    const [showActions, setShowActions] = useState(visibleColumns.actions ?? false);
    const [showDossier, setShowDossier] = useState(visibleColumns.dossier ?? false);
    const [showPhone, setShowPhone] = useState(visibleColumns.telephone ?? false);
    const [showAdresse, setShowAdresse] = useState(visibleColumns.adresse ?? false);
    const [showDateNaissance, setShowDateNaissance] = useState(visibleColumns.dateNaissance ?? false);

    // Sync local column state with visibleColumns settings when they load
    useEffect(() => {
        setShowProblematiques(visibleColumns.problematiques ?? false);
        setShowActions(visibleColumns.actions ?? false);
        setShowDossier(visibleColumns.dossier ?? false);
        setShowPhone(visibleColumns.telephone ?? false);
        setShowAdresse(visibleColumns.adresse ?? false);
        setShowDateNaissance(visibleColumns.dateNaissance ?? false);
    }, [visibleColumns]);

    // Use external props if provided, otherwise use local state
    const searchTerm = props.searchTerm !== undefined ? props.searchTerm : localSearchTerm;
    const searchField = props.searchField !== undefined ? props.searchField : localSearchField;
    const sortField = props.sortField !== undefined ? props.sortField : localSortField;
    const sortDirection = props.sortDirection !== undefined ? props.sortDirection : localSortDirection;
    const problematiqueFilter = props.problematiqueFilter !== undefined ? props.problematiqueFilter : localProblematiqueFilter;
    const showImportantInfoOnly = props.showImportantInfoOnly !== undefined ? props.showImportantInfoOnly : localShowImportantInfoOnly;
    const showDonneesConfidentielles = props.showDonneesConfidentielles !== undefined ? props.showDonneesConfidentielles : localShowDonneesConfidentielles;
    const showMissingBirthDate = props.showMissingBirthDate !== undefined ? props.showMissingBirthDate : localShowMissingBirthDate;

    // Integrated handlers
    const handleSearchTermChange = props.onSearchTermChange || setLocalSearchTerm;
    const handleProblematiqueFilterChange = props.onProblematiqueFilterChange || setLocalProblematiqueFilter;

    const handleSort = useCallback((field: string) => {
        const newDirection = sortField === field && sortDirection === 'asc' ? 'desc' : 'asc';
        if (props.onSortChange) {
            props.onSortChange(field, newDirection);
        } else {
            setLocalSortField(field);
            setLocalSortDirection(newDirection);
        }
    }, [sortField, sortDirection, props.onSortChange]);

    const handleShowImportantInfoOnlyChange = useCallback((val: boolean) => {
        if (props.onShowImportantInfoOnlyChange) props.onShowImportantInfoOnlyChange(val);
        else setLocalShowImportantInfoOnly(val);
    }, [props.onShowImportantInfoOnlyChange]);

    const handleShowDonneesConfidentiellesChange = useCallback((val: boolean) => {
        if (props.onShowDonneesConfidentiellesChange) props.onShowDonneesConfidentiellesChange(val);
        else setLocalShowDonneesConfidentielles(val);
    }, [props.onShowDonneesConfidentiellesChange]);

    const handleShowMissingBirthDateChange = useCallback((val: boolean) => {
        if (props.onShowMissingBirthDateChange) props.onShowMissingBirthDateChange(val);
        else setLocalShowMissingBirthDate(val);
    }, [props.onShowMissingBirthDateChange]);

    const handleSelectUser = useCallback((userId: string, checked: boolean) => {
        setSelectedUsers(prev =>
            checked ? [...prev, userId] : prev.filter(id => id !== userId)
        );
    }, []);

    const handleClearSelection = useCallback(() => {
        setSelectedUsers([]);
    }, []);

    return {
        // View & Toggles
        viewMode, setViewMode,
        showProblematiques, setShowProblematiques,
        showActions, setShowActions,
        showDossier, setShowDossier,
        showPhone, setShowPhone,
        showAdresse, setShowAdresse,
        showDateNaissance, setShowDateNaissance,

        // Filters state
        searchTerm, handleSearchTermChange,
        searchField, setSearchField: setLocalSearchField,
        sortField, sortDirection, handleSort,
        problematiqueFilter, handleProblematiqueFilterChange,
        showImportantInfoOnly, handleShowImportantInfoOnlyChange,
        showDonneesConfidentielles, handleShowDonneesConfidentiellesChange,
        showMissingBirthDate, handleShowMissingBirthDateChange,
        showDuplicates, setShowDuplicates,
        includeDateInDuplicates, setIncludeDateInDuplicates,

        // Selection
        selectedUsers, setSelectedUsers, handleSelectUser, handleClearSelection,
    };
};
