/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect est un logiciel libre : vous pouvez le redistribuer et/ou le modifier selon les termes de la Licence Publique Générale GNU telle que publiée par la Free Software Foundation, soit la version 3 de la licence, soit (à votre convenance) toute version ultérieure.

Ce programme est distribué dans l'espoir qu'il sera utile, mais SANS AUCUNE GARANTIE ; sans même la garantie implicite de COMMERCIALISATION ou d'ADÉQUATION À UN USAGE PARTICULIER. Voir la Licence Publique Générale GNU pour plus de détails.
*/

'use client';

/**
 * UserList - Modern modular user list component
 * Refactored to separate state and logic into custom hooks.
 */

import React, { useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useAdmin } from '@/contexts/AdminContext';
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
    UserListGrid,
    UserListFloatingActions
} from './index';

// Hooks
import { useUserList } from '../../hooks/useUserList';
import { useUserActions } from '../../hooks/useUserActions';
import { usePagination } from '../../hooks/usePagination';
import { useUserListState } from '../../hooks/useUserListState';
import { useUserListLogic } from '../../hooks/useUserListLogic';

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

export const UserList: React.FC<UserListProps> = (props) => {
    const router = useRouter();
    const { data: session } = useSession();
    const { isAdmin: isAdminContext } = useAdmin();
    const isAdmin = props.isAdmin !== undefined ? props.isAdmin : isAdminContext;

    // Custom Hooks - Data Fetching
    const { users, setUsers, gestionnaires, loading, refresh } = useUserList();
    const { options: problematiquesOptions } = useDropdownOptionsAPI(DROPDOWN_CATEGORIES.PROBLEMATIQUES);

    // Custom Hooks - State Management
    const state = useUserListState(props);

    // Custom Hooks - Logic Processing
    const { sortedUsers, gestionnaireMap, stats } = useUserListLogic({
        users,
        gestionnaires,
        session,
        state,
    });

    // Custom Hooks - Bulk Actions
    const { handleBulkDelete, handleDeleteAll } = useUserActions({
        users,
        setUsers,
        selectedUsers: state.selectedUsers,
        setSelectedUsers: state.setSelectedUsers,
        isAdmin,
        onRefresh: refresh,
    });

    // Custom Hooks - Pagination
    const { currentPage, totalPages, goToPage } = usePagination({
        totalItems: sortedUsers.length,
        itemsPerPage: ITEMS_PER_PAGE,
    });

    // Navigation handlers
    const handleNewUser = useCallback(() => {
        router.push('/users/new');
    }, [router]);

    const handleRowClick = useCallback((userId: string) => {
        router.push(`/users/${userId}`);
    }, [router]);

    const handleLastAddedClick = useCallback((userId: string) => {
        router.push(`/users/${userId}/edit`);
    }, [router]);

    // Service context
    const serviceId = (session?.user as any)?.serviceId;
    const showAntenne = serviceId === 'default' || !serviceId;
    const currentUserIdentifier = session?.user?.name || undefined;

    // Paginated subset
    const paginatedUsers = useMemo(() => {
        const start = (currentPage - 1) * ITEMS_PER_PAGE;
        return sortedUsers.slice(start, start + ITEMS_PER_PAGE);
    }, [sortedUsers, currentPage]);

    // Problematiques options for the filter dropdown
    const problematiquesFilterOptions = useMemo(() => [
        { value: '', label: 'Toutes problématiques' },
        { value: 'aucune', label: 'Aucune problématique' },
        ...problematiquesOptions.filter(opt => opt.value !== '').map(opt => ({ value: opt.value, label: opt.label }))
    ], [problematiquesOptions]);

    if (loading) {
        return (
            <div className="space-y-6">
                <UserListHeader
                    users={[]}
                    title="Liste des usagers"
                    subtitle="Chargement..."
                    isAdmin={isAdmin}
                    loading={true}
                    onRefresh={() => { }
                    }
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
                    {state.viewMode === 'table' ? <TableSkeleton rows={5} /> : <GridSkeleton cards={8} />}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 relative pb-20">
            <UserListHeader
                users={sortedUsers}
                title="Liste des usagers"
                subtitle={`${sortedUsers.length} usager${sortedUsers.length > 1 ? 's' : ''}`}
                isAdmin={isAdmin}
                onRefresh={refresh}
                onImport={undefined}
                onExport={() => { }}
                onBulkDelete={handleBulkDelete}
                onDeleteAll={handleDeleteAll}
                selectedCount={state.selectedUsers.length}
            />

            <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
                <UserListFilters
                    searchTerm={state.searchTerm}
                    searchField={state.searchField}
                    onSearchTermChange={state.handleSearchTermChange}
                    onSearchFieldChange={state.setSearchField}
                    problematiqueFilter={state.problematiqueFilter}
                    onProblematiqueFilterChange={state.handleProblematiqueFilterChange}
                    problematiquesOptions={problematiquesFilterOptions}
                    showImportantInfoOnly={state.showImportantInfoOnly}
                    onShowImportantInfoOnlyChange={state.handleShowImportantInfoOnlyChange}
                    showDonneesConfidentielles={state.showDonneesConfidentielles}
                    onShowDonneesConfidentiellesChange={state.handleShowDonneesConfidentiellesChange}
                    showMissingBirthDate={state.showMissingBirthDate}
                    onShowMissingBirthDateChange={state.handleShowMissingBirthDateChange}
                    showDuplicates={state.showDuplicates}
                    onShowDuplicatesChange={state.setShowDuplicates}
                    includeDateInDuplicates={state.includeDateInDuplicates}
                    onIncludeDateInDuplicatesChange={state.setIncludeDateInDuplicates}

                    importantInfoCount={stats.importantInfoCount}
                    donneesConfidentiellesCount={stats.donneesConfidentiellesCount}
                    missingBirthDateCount={stats.missingBirthDateCount}
                    duplicatesCount={stats.duplicatesCount}

                    totalUsersCount={stats.totalUsersCount}
                    lastAddedUser={stats.lastAddedUser}
                    myDossiersCount={stats.myDossiersCount}
                    currentUserIdentifier={currentUserIdentifier}
                    onAddUser={handleNewUser}
                    onLastAddedClick={handleLastAddedClick}

                    showProblematiques={state.showProblematiques}
                    onShowProblematiquesChange={state.setShowProblematiques}
                    showActions={state.showActions}
                    onShowActionsChange={state.setShowActions}
                    showDossier={state.showDossier}
                    onShowDossierChange={state.setShowDossier}
                    showPhone={state.showPhone}
                    onShowPhoneChange={state.setShowPhone}
                    showAdresse={state.showAdresse}
                    onShowAdresseChange={state.setShowAdresse}
                    showDateNaissance={state.showDateNaissance}
                    onShowDateNaissanceChange={state.setShowDateNaissance}
                    viewMode={state.viewMode}
                    onViewModeChange={state.setViewMode}
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
                        {state.viewMode === 'table' ? (
                            <UserListTable
                                users={paginatedUsers}
                                allUsersCount={sortedUsers.length}
                                selectedUsers={state.selectedUsers}
                                onSelectUser={state.handleSelectUser}
                                onSelectAll={(checked) => state.setSelectedUsers(checked ? paginatedUsers.map(u => u.id) : [])}
                                onSort={state.handleSort}
                                sortField={state.sortField}
                                sortDirection={state.sortDirection}
                                onRowClick={handleRowClick}
                                gestionnaireMap={gestionnaireMap}
                                showColumns={{
                                    showProblematiques: state.showProblematiques,
                                    showActions: state.showActions,
                                    showDossier: state.showDossier,
                                    showPhone: state.showPhone,
                                    showAdresse: state.showAdresse,
                                    showAntenne,
                                    showDateNaissance: state.showDateNaissance
                                }}
                            />
                        ) : (
                            <div className="bg-gray-50 min-h-[500px]">
                                <UserListGrid
                                    users={paginatedUsers}
                                    gestionnaireMap={gestionnaireMap}
                                    onRowClick={handleRowClick}
                                    showDossier={state.showDossier}
                                    showPhone={state.showPhone}
                                    showProblematiques={state.showProblematiques}
                                    showActions={state.showActions}
                                    showAdresse={state.showAdresse}
                                    showAntenne={showAntenne}
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

            <UserListFloatingActions
                selectedCount={state.selectedUsers.length}
                onClearSelection={state.handleClearSelection}
                onDelete={() => handleBulkDelete && handleBulkDelete()}
            />
        </div>
    );
};

export default UserList;
