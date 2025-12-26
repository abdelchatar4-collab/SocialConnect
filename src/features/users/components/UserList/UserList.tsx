/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect est un logiciel libre : vous pouvez le redistribuer et/ou le modifier selon les termes de la Licence Publique Générale GNU telle que publiée par la Free Software Foundation, soit la version 3 de la licence, soit (à votre convenance) toute version ultérieure.
*/

'use client';

import React, { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useAdmin } from '@/contexts/AdminContext';
import ImportUsers from '../ImportUsers';
import { DROPDOWN_CATEGORIES } from '@/constants/dropdownCategories';
import { useDropdownOptionsAPI } from '@/hooks/useDropdownOptionsAPI';
import { ITEMS_PER_PAGE } from '@/config/constants';
import { UserListHeader, UserListFilters, UserListTable, UserListPagination, UserListGrid, UserListFloatingActions } from './index';
import { useUserList } from '../../hooks/useUserList';
import { useUserActions } from '../../hooks/useUserActions';
import { usePagination } from '../../hooks/usePagination';
import { useUserListState } from '../../hooks/useUserListState';
import { useUserListLogic } from '../../hooks/useUserListLogic';
import { UserListSkeleton } from './UserListSkeleton';

export const UserList: React.FC<any> = (props) => {
    const [isImporting, setIsImporting] = React.useState(false);
    const router = useRouter();
    const { data: sess } = useSession();
    const { isAdmin: isAdmCtx } = useAdmin();
    const isAdm = props.isAdmin ?? isAdmCtx;
    const { users, setUsers, gestionnaires, loading, refresh } = useUserList();
    const { options: probOpt } = useDropdownOptionsAPI(DROPDOWN_CATEGORIES.PROBLEMATIQUES);
    const state = useUserListState(props);
    const { sortedUsers: sUsers, gestionnaireMap: gMap, stats } = useUserListLogic({ users, gestionnaires, session: sess, state });
    const { handleBulkDelete: hBD } = useUserActions({ users, setUsers, selectedUsers: state.selectedUsers, setSelectedUsers: state.setSelectedUsers, isAdmin: isAdm, onRefresh: refresh });
    const { currentPage: cp, totalPages: tp, goToPage: gtp } = usePagination({ totalItems: sUsers.length, itemsPerPage: ITEMS_PER_PAGE });

    const pFiltOpt = useMemo(() => [{ value: '', label: 'Toutes' }, { value: 'aucune', label: 'Aucune' }, ...probOpt.filter(o => o.value).map(o => ({ value: o.value, label: o.label }))], [probOpt]);
    const pagUsers = useMemo(() => sUsers.slice((cp - 1) * ITEMS_PER_PAGE, cp * ITEMS_PER_PAGE), [sUsers, cp]);

    if (loading) return <UserListSkeleton isAdmin={isAdm} viewMode={state.viewMode as any} />;

    const rIdx = (u: any) => router.push(`/users/${u}`);
    const rEdt = (u: any) => router.push(`/users/${u}/edit`);

    const handleExport = async () => {
        try {
            const response = await fetch('/api/users/export/excel');
            if (!response.ok) throw new Error('Erreur lors de l\'exportation');

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `Export_Usagers_${new Date().toISOString().split('T')[0]}.xlsx`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (error) {
            console.error('Export error:', error);
            alert('Erreur lors de l\'exportation Excel');
        }
    };

    return (
        <div className="space-y-6 relative pb-20">
            <UserListHeader
                users={sUsers}
                title="Liste des usagers"
                subtitle={`${sUsers.length} usager(s)`}
                isAdmin={isAdm}
                onRefresh={refresh}
                onBulkDelete={hBD}
                selectedCount={state.selectedUsers.length}
                onExport={handleExport}
                onImport={() => setIsImporting(true)}
            />

            {isImporting && (
                <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-6 animate-in fade-in slide-in-from-top-4 duration-300">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-bold text-slate-800">Outil d'importation</h2>
                        <button
                            onClick={() => setIsImporting(false)}
                            className="text-slate-500 hover:text-slate-800 font-medium px-4 py-2 rounded-lg hover:bg-slate-100 transition-colors"
                        >
                            Retour à la liste
                        </button>
                    </div>
                    <ImportUsers onImportComplete={() => {
                        setIsImporting(false);
                        refresh();
                    }} />
                </div>
            )}

            <div className={`bg-white rounded-lg shadow border overflow-hidden ${isImporting ? 'hidden' : ''}`}>
                <UserListFilters {...state} onSearchTermChange={state.handleSearchTermChange} onSearchFieldChange={state.setSearchField} onProblematiqueFilterChange={state.handleProblematiqueFilterChange} problematiquesOptions={pFiltOpt} onShowImportantInfoOnlyChange={state.handleShowImportantInfoOnlyChange} onShowDonneesConfidentiellesChange={state.handleShowDonneesConfidentiellesChange} onShowMissingBirthDateChange={state.handleShowMissingBirthDateChange} onShowDuplicatesChange={state.setShowDuplicates} onIncludeDateInDuplicatesChange={state.setIncludeDateInDuplicates} {...stats} currentUserIdentifier={sess?.user?.name || undefined} onAddUser={() => router.push('/users/new')} onLastAddedClick={rEdt} onShowProblematiquesChange={state.setShowProblematiques} onShowActionsChange={state.setShowActions} onShowDossierChange={state.setShowDossier} onShowPhoneChange={state.setShowPhone} onShowAdresseChange={state.setShowAdresse} onShowDateNaissanceChange={state.setShowDateNaissance} onViewModeChange={state.setViewMode} />
                {!sUsers.length ? <div className="p-12 text-center text-gray-500">Aucun usager trouvé</div> : (
                    state.viewMode === 'table' ? (
                        <UserListTable users={pagUsers} allUsersCount={sUsers.length} selectedUsers={state.selectedUsers} onSelectUser={state.handleSelectUser} onSelectAll={c => state.setSelectedUsers(c ? pagUsers.map(u => u.id) : [])} onSort={state.handleSort} sortField={state.sortField} sortDirection={state.sortDirection} onRowClick={rIdx} gestionnaireMap={gMap} showColumns={{ ...state, showAntenne: !((sess?.user as any)?.serviceId) || (sess?.user as any)?.serviceId === 'default' }} />
                    ) : <UserListGrid users={pagUsers} gestionnaireMap={gMap} onRowClick={rIdx} {...state} showAntenne={!((sess?.user as any)?.serviceId) || (sess?.user as any)?.serviceId === 'default'} />
                )}
                <UserListPagination currentPage={cp} totalPages={tp} totalItems={sUsers.length} itemsPerPage={ITEMS_PER_PAGE} onPageChange={gtp} />
            </div>
            <UserListFloatingActions selectedCount={state.selectedUsers.length} onClearSelection={state.handleClearSelection} onDelete={hBD} />
        </div>
    );
};

export default UserList;
