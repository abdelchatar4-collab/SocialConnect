/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect est un logiciel libre : vous pouvez le redistribuer et/ou le modifier selon les termes de la Licence Publique Générale GNU telle que publiée par la Free Software Foundation, soit la version 3 de la licence, soit (à votre convenance) toute version ultérieure.

Ce programme est distribué dans l'espoir qu'il sera utile, mais SANS AUCUNE GARANTIE ; sans même la garantie implicite de COMMERCIALISATION ou d'ADÉQUATION À UN USAGE PARTICULIER. Voir la Licence Publique Générale GNU pour plus de détails.
*/

/**
 * UserList - Modern modular user list component
 * Refactored from 1808-line monolithic file into composable sub-components
 */

"use client";

import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Card, CardContent } from '@/components/ui';
import { useAdmin } from '@/contexts/AdminContext';
import { User, Problematique } from '@/types';
import { DROPDOWN_CATEGORIES } from '@/constants/dropdownCategories';
import { useDropdownOptionsAPI } from '@/hooks/useDropdownOptionsAPI';
import { ITEMS_PER_PAGE } from '@/config/constants';
import { TableSkeleton, GridSkeleton } from '@/components/ui/Skeleton';

// Sub-components
import {
    UserListHeader,
    UserListFilters,
    UserListTable,
    UserListPagination,
    UserListColumnToggle,
    UserListGrid,
    UserListFloatingActions
} from './index';

// Hooks
import { useUserList } from '../../hooks/useUserList';
import { useUserActions } from '../../hooks/useUserActions';
import { useUserColumns } from '../../hooks/useUserColumns';
import { usePagination } from '../../hooks/usePagination';
import { useUserFilters } from '../../hooks/useUserFilters';

// Types
import type { FilterType } from './UserListFilters';

interface UserListProps {
    searchTerm?: string;
    searchField?: FilterType;
    onSearchTermChange?: (value: string) => void;
    sortField?: string | null;
    sortDirection?: 'asc' | 'desc';
    onSortChange?: (field: string | null, direction: 'asc' | 'desc') => void;
    problematiqueFilter?: string;
    onProblematiqueFilterChange?: (filter: string) => void;
    showImportantInfoOnly?: boolean;
    onShowImportantInfoOnlyChange?: (show: boolean) => void;
    showDonneesConfidentielles?: boolean;
    onShowDonneesConfidentiellesChange?: (show: boolean) => void;
    showMissingBirthDate?: boolean;
    onShowMissingBirthDateChange?: (show: boolean) => void;
    isAdmin?: boolean;
    isImporting?: boolean;
    onCancelImport?: () => void;
    // Legacy / Action props forwarding
    onDeleteUsers?: () => Promise<void>;
    onImportUsers?: () => Promise<void>;
    onDeleteImportedUsers?: () => Promise<void>;
}

export const UserList: React.FC<UserListProps> = ({
    searchTerm: externalSearchTerm,
    searchField: externalSearchField,
    onSearchTermChange,
    sortField: externalSortField,
    sortDirection: externalSortDirection,
    onSortChange,
    problematiqueFilter: externalProblematiqueFilter,
    onProblematiqueFilterChange,
    showImportantInfoOnly: externalShowImportantInfoOnly,
    onShowImportantInfoOnlyChange,
    showDonneesConfidentielles: externalShowDonneesConfidentielles,
    onShowDonneesConfidentiellesChange,
    showMissingBirthDate: externalShowMissingBirthDate,
    onShowMissingBirthDateChange,
    isAdmin: isAdminProp,
    isImporting,
    onCancelImport,
    onDeleteUsers, // unused but accepted
    onImportUsers, // unused but accepted
    onDeleteImportedUsers, // unused but accepted
}) => {
    const router = useRouter();
    const { data: session } = useSession();
    const { isAdmin: isAdminContext } = useAdmin();
    const isAdmin = isAdminProp !== undefined ? isAdminProp : isAdminContext;

    // View Mode State
    const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');

    // Local state for controlled/uncontrolled props
    const [localSearchTerm, setLocalSearchTerm] = useState('');
    const [localSearchField, setLocalSearchField] = useState<FilterType>('all');
    const [localSortField, setLocalSortField] = useState<string | null>(null);
    const [localSortDirection, setLocalSortDirection] = useState<'asc' | 'desc'>('asc');
    const [localProblematiqueFilter, setLocalProblematiqueFilter] = useState('');
    const [localShowImportantInfoOnly, setLocalShowImportantInfoOnly] = useState(false);
    const [localShowDonneesConfidentielles, setLocalShowDonneesConfidentielles] = useState(false);
    const [localShowMissingBirthDate, setLocalShowMissingBirthDate] = useState(false);
    const [showDuplicates, setShowDuplicates] = useState(false);
    const [selectedUsers, setSelectedUsers] = useState<string[]>([]);

    // Column visibility toggles (mapped to UserListRow props)
    const [showProblematiques, setShowProblematiques] = useState(false);
    const [showActions, setShowActions] = useState(false);
    const [showDossier, setShowDossier] = useState(false);
    const [showPhone, setShowPhone] = useState(false);
    const [showAdresse, setShowAdresse] = useState(false);

    // Use external props if provided, otherwise use local state
    const searchTerm = externalSearchTerm !== undefined ? externalSearchTerm : localSearchTerm;
    const searchField = externalSearchField !== undefined ? externalSearchField : localSearchField;
    const sortField = externalSortField !== undefined ? externalSortField : localSortField;
    const sortDirection = externalSortDirection !== undefined ? externalSortDirection : localSortDirection;
    const problematiqueFilter = externalProblematiqueFilter !== undefined ? externalProblematiqueFilter : localProblematiqueFilter;
    const showImportantInfoOnly = externalShowImportantInfoOnly !== undefined ? externalShowImportantInfoOnly : localShowImportantInfoOnly;
    const showDonneesConfidentielles = externalShowDonneesConfidentielles !== undefined ? externalShowDonneesConfidentielles : localShowDonneesConfidentielles;
    const showMissingBirthDate = externalShowMissingBirthDate !== undefined ? externalShowMissingBirthDate : localShowMissingBirthDate;

    // Custom hooks
    const { users, setUsers, gestionnaires, loading, refresh } = useUserList();
    const { columns, toggleColumn } = useUserColumns();
    const { options: problematiquesOptions } = useDropdownOptionsAPI(DROPDOWN_CATEGORIES.PROBLEMATIQUES);

    // Navigation handlers
    const handleNewUser = useCallback(() => {
        router.push('/users/new');
    }, [router]);

    // Derived state for filters
    const gestionnaireMap = useMemo(() => {
        const map = new Map();
        gestionnaires.forEach(g => map.set(g.id, g));
        return map;
    }, [gestionnaires]);

    // Stats Calculations for Dashboard-like cards
    const totalUsersCount = users.length;

    // Last Added User (Sort by dateOuverture desc)
    const lastAddedUser = useMemo(() => {
        if (users.length === 0) return null;
        // Clone to avoid mutating
        return [...users].sort((a, b) => {
            const dateA = a.dateOuverture ? new Date(a.dateOuverture).getTime() : 0;
            const dateB = b.dateOuverture ? new Date(b.dateOuverture).getTime() : 0;
            return dateB - dateA;
        })[0];
    }, [users]);

    // My Dossiers Count
    // Filter by session user name or custom logic
    const myDossiersCount = useMemo(() => {
        if (!session?.user?.name) return 0;
        const currentUserName = session.user.name.toLowerCase();

        return users.filter(u => {
            if (!u.gestionnaire) return false;
            const gName = typeof u.gestionnaire === 'object'
                ? `${u.gestionnaire.prenom} ${u.gestionnaire.nom}`
                : String(u.gestionnaire);
            return gName.toLowerCase().includes(currentUserName);
        }).length;
    }, [users, session]);

    const currentUserIdentifier = session?.user?.name || undefined;

    // Apply local filtering first (Strict Parity with Original Logic)
    const filteredUsers = useMemo(() => {
        let result = users || [];

        // Apply search
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            result = result.filter(u => {
                if (searchField === 'all') {
                    // Recherche globale (inclut adresse et gestionnaire)
                    const adresse = u.adresse && typeof u.adresse === 'object'
                        ? `${u.adresse.rue || ''} ${u.adresse.numero || ''} ${u.adresse.codePostal || ''} ${u.adresse.ville || ''}`
                        : String(u.adresse || '');

                    const gestionnaireIdx = typeof u.gestionnaire === 'object'
                        ? `${u.gestionnaire?.prenom || ''} ${u.gestionnaire?.nom || ''}`
                        : String(u.gestionnaire || '');

                    return (
                        u.nom?.toLowerCase().includes(term) ||
                        u.prenom?.toLowerCase().includes(term) ||
                        u.email?.toLowerCase().includes(term) ||
                        u.telephone?.includes(term) ||
                        adresse.toLowerCase().includes(term) ||
                        String(gestionnaireIdx || '').toLowerCase().includes(term)
                    );
                }

                if (searchField === 'adresse') {
                    const adresse = u.adresse && typeof u.adresse === 'object'
                        ? u.adresse
                        : { rue: String(u.adresse || '') };

                    // Logique spécifique adresse de l'original
                    const rue = (adresse.rue || '').toLowerCase();
                    const numero = (adresse.numero || '').toLowerCase();
                    const cp = (adresse.codePostal || '').toLowerCase();
                    const ville = (adresse.ville || '').toLowerCase();
                    const fullAdresse = `${rue} ${numero} ${cp} ${ville}`;

                    return fullAdresse.includes(term);
                }

                if (searchField === 'gestionnaire') {
                    const gVal = typeof u.gestionnaire === 'object'
                        ? `${u.gestionnaire?.prenom || ''} ${u.gestionnaire?.nom || ''}`
                        : String(u.gestionnaire || '');
                    return gVal.toLowerCase().includes(term);
                }

                const val = u[searchField as keyof User];
                return String(val || '').toLowerCase().includes(term);
            });
        }

        // Problématique filter
        if (problematiqueFilter) {
            if (problematiqueFilter === 'aucune') {
                result = result.filter(u => !u.problematiques || u.problematiques.length === 0);
            } else {
                result = result.filter(u =>
                    u.problematiques?.some((p: Problematique) => {
                        const pType = (p.type || p.description || 'Problématique').toString().toLowerCase();
                        return pType === problematiqueFilter.toLowerCase();
                    })
                );
            }
        }

        // Special filters
        if (showImportantInfoOnly) {
            result = result.filter(u => u.informationImportante && u.informationImportante.trim() !== '');
        }
        if (showDonneesConfidentielles) {
            result = result.filter(u => u.donneesConfidentielles && u.donneesConfidentielles.trim() !== '');
        }
        if (showMissingBirthDate) {
            result = result.filter(u => !u.dateNaissance);
        }
        if (showDuplicates) {
            const seen = new Map<string, User[]>();
            result.forEach(u => {
                const key = `${u.nom?.toLowerCase()}_${u.prenom?.toLowerCase()}_${u.dateNaissance}`;
                if (!seen.has(key)) seen.set(key, []);
                seen.get(key)!.push(u);
            });
            result = result.filter(u => {
                const key = `${u.nom?.toLowerCase()}_${u.prenom?.toLowerCase()}_${u.dateNaissance}`;
                return (seen.get(key)?.length || 0) > 1;
            });
        }

        return result;
    }, [users, searchTerm, searchField, problematiqueFilter, showImportantInfoOnly, showDonneesConfidentielles, showMissingBirthDate, showDuplicates]);

    // Sorting
    const sortedUsers = useMemo(() => {
        const usersToSort = filteredUsers || [];
        if (!sortField) return usersToSort;
        return [...usersToSort].sort((a, b) => {
            let aVal: unknown = a[sortField as keyof User];
            let bVal: unknown = b[sortField as keyof User];

            if (sortField === 'gestionnaire') {
                aVal = typeof a.gestionnaire === 'object' ? a.gestionnaire?.prenom : a.gestionnaire;
                bVal = typeof b.gestionnaire === 'object' ? b.gestionnaire?.prenom : b.gestionnaire;
            }

            if (sortField === 'dateOuverture') {
                const timeA = a.dateOuverture ? new Date(a.dateOuverture).getTime() : 0;
                const timeB = b.dateOuverture ? new Date(b.dateOuverture).getTime() : 0;
                return sortDirection === 'asc' ? timeA - timeB : timeB - timeA;
            }

            const valAStr = String(aVal || '');
            const valBStr = String(bVal || '');
            const comparison = valAStr.localeCompare(valBStr);
            return sortDirection === 'asc' ? comparison : -comparison;
        });
    }, [filteredUsers, sortField, sortDirection]);

    // Pagination
    const { currentPage, totalPages, goToPage, getPageNumbers } = usePagination({
        totalItems: sortedUsers.length,
        itemsPerPage: ITEMS_PER_PAGE,
    });

    const paginatedUsers = useMemo(() => {
        const start = (currentPage - 1) * ITEMS_PER_PAGE;
        return sortedUsers.slice(start, start + ITEMS_PER_PAGE);
    }, [sortedUsers, currentPage]);

    // Actions
    const { handleDelete, handleBulkDelete, handleDeleteAll } = useUserActions({
        users,
        setUsers,
        selectedUsers,
        setSelectedUsers,
        isAdmin,
        onRefresh: refresh,
    });

    // Counts for filters
    const importantInfoCount = useMemo(() =>
        users.filter(u => u.informationImportante && u.informationImportante.trim() !== '').length,
        [users]
    );

    const donneesConfidentiellesCount = useMemo(() =>
        users.filter(u => u.donneesConfidentielles && u.donneesConfidentielles.trim() !== '').length,
        [users]
    );

    const missingBirthDateCount = useMemo(() =>
        users.filter(u => !u.dateNaissance).length,
        [users]
    );

    const duplicatesCount = useMemo(() => {
        const seen = new Map<string, number>();
        users.forEach(u => {
            const key = `${u.nom?.toLowerCase()}_${u.prenom?.toLowerCase()}_${u.dateNaissance}`;
            seen.set(key, (seen.get(key) || 0) + 1);
        });
        return Array.from(seen.values()).filter(count => count > 1).reduce((a, b) => a + b, 0);
    }, [users]);

    // Problematiques options
    const problematiquesFilterOptions = useMemo(() => [
        { value: '', label: 'Toutes problématiques' },
        { value: 'aucune', label: 'Aucune problématique' },
        ...problematiquesOptions.filter(opt => opt.value !== '').map(opt => ({ value: opt.value, label: opt.label }))
    ], [problematiquesOptions]);

    // Handlers
    const handleSort = useCallback((field: string) => {
        const newDirection = sortField === field && sortDirection === 'asc' ? 'desc' : 'asc';
        if (onSortChange) {
            onSortChange(field, newDirection);
        } else {
            setLocalSortField(field);
            setLocalSortDirection(newDirection);
        }
    }, [sortField, sortDirection, onSortChange]);

    // Handler helpers for local state inputs
    const handleSearchTermChange = onSearchTermChange || setLocalSearchTerm;
    const handleSearchFieldChange = (field: FilterType) => {
        setLocalSearchField(field);
        // Reset search term optional? No, keep it
    };

    const handleProblematiqueFilterChange = onProblematiqueFilterChange || setLocalProblematiqueFilter;
    const handleRecalculateStats = () => { }; // No-op as stats are computed memoized

    const handleRowClick = useCallback((userId: string) => {
        router.push(`/users/${userId}`);
    }, [router]);

    const handleSelectUser = useCallback((userId: string, checked: boolean) => {
        setSelectedUsers(prev =>
            checked ? [...prev, userId] : prev.filter(id => id !== userId)
        );
    }, []);

    const handleSelectAll = useCallback((checked: boolean) => {
        setSelectedUsers(checked ? paginatedUsers.map(u => u.id) : []);
    }, [paginatedUsers]);

    const handleClearSelection = useCallback(() => {
        setSelectedUsers([]);
    }, []);

    const handleLastAddedClick = useCallback((userId: string) => {
        router.push(`/users/${userId}/edit`);
    }, [router]);

    if (loading) {
        return (
            <div className="space-y-6">
                <UserListHeader
                    users={[]}
                    title="Liste des usagers"
                    subtitle="Chargement..."
                    isAdmin={isAdmin}
                    loading={true}
                    onRefresh={() => { }}
                    onImport={undefined}
                    onExport={() => { }}
                    onBulkDelete={() => Promise.resolve()}
                    onDeleteAll={() => Promise.resolve()}
                    selectedCount={0}
                />

                {/* Skeleton for Filters */}
                <div className="bg-white rounded-lg shadow border border-gray-200 p-6 space-y-4">
                    <div className="flex gap-4">
                        <div className="h-10 w-1/3 bg-gray-100 rounded animate-pulse" />
                        <div className="h-10 w-full bg-gray-100 rounded animate-pulse" />
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                        <div className="h-24 bg-gray-100 rounded animate-pulse" />
                        <div className="h-24 bg-gray-100 rounded animate-pulse" />
                        <div className="h-24 bg-gray-100 rounded animate-pulse" />
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden p-6">
                    {viewMode === 'table' ? <TableSkeleton rows={5} /> : <GridSkeleton cards={8} />}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 relative pb-20"> {/* Added pb-20 for floating bar space */}
            <UserListHeader
                users={sortedUsers}
                title="Liste des usagers"
                subtitle={`${sortedUsers.length} usager${sortedUsers.length > 1 ? 's' : ''}`}
                isAdmin={isAdmin}
                onRefresh={refresh}
                onImport={isImporting ? undefined : undefined} // TODO: Add import handler back if needed via prop
                onExport={() => { }} // TODO: Add export handler
                onBulkDelete={handleBulkDelete}
                onDeleteAll={handleDeleteAll}
                selectedCount={selectedUsers.length}
            />


            <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
                <UserListFilters
                    searchTerm={searchTerm}
                    searchField={searchField}
                    onSearchTermChange={handleSearchTermChange}
                    onSearchFieldChange={handleSearchFieldChange}
                    problematiqueFilter={problematiqueFilter}
                    onProblematiqueFilterChange={handleProblematiqueFilterChange}
                    problematiquesOptions={problematiquesFilterOptions}
                    showImportantInfoOnly={showImportantInfoOnly}
                    onShowImportantInfoOnlyChange={(val) => {
                        if (onShowImportantInfoOnlyChange) onShowImportantInfoOnlyChange(val);
                        else setLocalShowImportantInfoOnly(val);
                    }}
                    showDonneesConfidentielles={showDonneesConfidentielles}
                    onShowDonneesConfidentiellesChange={(val) => {
                        if (onShowDonneesConfidentiellesChange) onShowDonneesConfidentiellesChange(val);
                        else setLocalShowDonneesConfidentielles(val);
                    }}
                    showMissingBirthDate={showMissingBirthDate}
                    onShowMissingBirthDateChange={(val) => {
                        if (onShowMissingBirthDateChange) onShowMissingBirthDateChange(val);
                        else setLocalShowMissingBirthDate(val);
                    }}
                    showDuplicates={showDuplicates}
                    onShowDuplicatesChange={setShowDuplicates}
                    // Counts
                    importantInfoCount={importantInfoCount}
                    donneesConfidentiellesCount={donneesConfidentiellesCount}
                    missingBirthDateCount={missingBirthDateCount}
                    duplicatesCount={duplicatesCount}
                    // Dashboard Stats
                    totalUsersCount={totalUsersCount}
                    lastAddedUser={lastAddedUser}
                    myDossiersCount={myDossiersCount}
                    currentUserIdentifier={currentUserIdentifier}
                    onAddUser={handleNewUser}
                    onLastAddedClick={handleLastAddedClick}
                    // Column Toggles
                    showProblematiques={showProblematiques}
                    onShowProblematiquesChange={setShowProblematiques}
                    showActions={showActions}
                    onShowActionsChange={setShowActions}
                    showDossier={showDossier}
                    onShowDossierChange={setShowDossier}
                    showPhone={showPhone}
                    onShowPhoneChange={setShowPhone}
                    showAdresse={showAdresse}
                    onShowAdresseChange={setShowAdresse}
                    viewMode={viewMode}
                    onViewModeChange={setViewMode}
                />

                {sortedUsers.length === 0 ? (
                    <div className="p-12 text-center">
                        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2M4 13h2m13-8-4 4-4-4m0 0L9 9l4 4" />
                        </svg>
                        <h3 className="mt-2 text-sm font-medium text-gray-900">Aucun usager trouvé</h3>
                        <p className="mt-1 text-sm text-gray-500">Essayez de modifier vos filtres de recherche.</p>
                    </div>
                ) : (
                    <>
                        {viewMode === 'table' ? (
                            <UserListTable
                                users={paginatedUsers}
                                allUsersCount={sortedUsers.length}
                                selectedUsers={selectedUsers}
                                onSelectUser={handleSelectUser}
                                onSelectAll={handleSelectAll}
                                onSort={handleSort}
                                sortField={sortField}
                                sortDirection={sortDirection}
                                onRowClick={handleRowClick}
                                gestionnaireMap={gestionnaireMap}
                                // Column visibility map
                                showColumns={{
                                    showProblematiques,
                                    showActions,
                                    showDossier,
                                    showPhone,
                                    showAdresse
                                }}
                            />
                        ) : (
                            <div className="bg-gray-50 min-h-[500px]">
                                <UserListGrid
                                    users={paginatedUsers}
                                    gestionnaireMap={gestionnaireMap}
                                    onRowClick={handleRowClick}
                                    showDossier={showDossier}
                                    showPhone={showPhone}
                                    showProblematiques={showProblematiques}
                                    showActions={showActions}
                                    showAdresse={showAdresse}
                                />
                            </div>
                        )}
                    </>
                )}

                <UserListPagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    totalItems={sortedUsers.length}
                    itemsPerPage={ITEMS_PER_PAGE}
                    onPageChange={goToPage}
                />
            </div>

            {/* Floating Bulk Actions Bar */}
            <UserListFloatingActions
                selectedCount={selectedUsers.length}
                onClearSelection={handleClearSelection}
                onDelete={() => handleBulkDelete && handleBulkDelete()}
            />
        </div>
    );
};

export default UserList;
