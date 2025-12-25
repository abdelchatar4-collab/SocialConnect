/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect - Demo List Component
Extracted from UserManagementDemo.tsx
*/

import React from 'react';
import { User } from '@/types/user';

interface UserManagementListProps {
    usersLoading: boolean;
    paginatedUsers: User[];
    totalItems: number;
    totalPages: number;
    hasFilters: boolean;
    filters: any;
    updateFilter: (name: any, value: any) => void;
    sortOptions: any;
    updateSort: (field: keyof User, direction: 'asc' | 'desc') => void;
    pagination: any;
    setPage: (page: number) => void;
    stats: any;
}

export const UserManagementList: React.FC<UserManagementListProps> = ({
    usersLoading,
    paginatedUsers,
    totalItems,
    totalPages,
    hasFilters,
    filters,
    updateFilter,
    sortOptions,
    updateSort,
    pagination,
    setPage,
    stats
}) => {
    return (
        <div className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Liste des Utilisateurs</h2>

            {/* Filtres */}
            <div className="bg-gray-50 p-4 rounded-lg mb-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Recherche</label>
                        <input
                            type="text"
                            value={filters.search || ''}
                            onChange={(e) => updateFilter('search', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md"
                            placeholder="Nom, email, téléphone..."
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Gestionnaire</label>
                        <select
                            value={filters.gestionnaire || ''}
                            onChange={(e) => updateFilter('gestionnaire', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        >
                            <option value="">Tous les gestionnaires</option>
                            {Object.keys(stats.byGestionnaire).map(gestionnaire => (
                                <option key={gestionnaire} value={gestionnaire}>
                                    {gestionnaire} ({stats.byGestionnaire[gestionnaire]})
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Statut</label>
                        <select
                            value={filters.etat || ''}
                            onChange={(e) => updateFilter('etat', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        >
                            <option value="">Tous les statuts</option>
                            {Object.keys(stats.byStatus).map(status => (
                                <option key={status} value={status}>
                                    {status} ({stats.byStatus[status]})
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {hasFilters && (
                    <div className="mt-4">
                        <button
                            onClick={() => updateFilter('search', undefined)}
                            className="text-blue-600 hover:text-blue-800 text-sm"
                        >
                            Effacer les filtres
                        </button>
                    </div>
                )}
            </div>

            {/* Informations sur la liste */}
            <div className="flex justify-between items-center mb-4">
                <div>
                    <span className="text-sm text-gray-600">
                        Affichage de {paginatedUsers.length} sur {totalItems} utilisateur(s)
                        {hasFilters && ' (filtré)'}
                    </span>
                </div>

                <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">Trier par:</span>
                    <select
                        value={`${sortOptions.field}-${sortOptions.direction}`}
                        onChange={(e) => {
                            const [field, direction] = e.target.value.split('-');
                            updateSort(field as keyof User, direction as 'asc' | 'desc');
                        }}
                        className="px-2 py-1 border border-gray-300 rounded text-sm"
                    >
                        <option value="dateOuverture-desc">Date d&apos;ouverture (récent)</option>
                        <option value="dateOuverture-asc">Date d&apos;ouverture (ancien)</option>
                        <option value="nom-asc">Nom (A-Z)</option>
                        <option value="nom-desc">Nom (Z-A)</option>
                        <option value="prenom-asc">Prénom (A-Z)</option>
                        <option value="prenom-desc">Prénom (Z-A)</option>
                    </select>
                </div>
            </div>

            {/* Liste des utilisateurs */}
            {usersLoading ? (
                <div className="text-center py-8">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    <p className="mt-2 text-gray-600">Chargement...</p>
                </div>
            ) : paginatedUsers.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                    {hasFilters ? 'Aucun utilisateur ne correspond aux filtres' : 'Aucun utilisateur trouvé'}
                </div>
            ) : (
                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Nom</th>
                                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Email</th>
                                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Gestionnaire</th>
                                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Statut</th>
                                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Date d&apos;ouverture</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {paginatedUsers.map((user, index) => (
                                <tr key={user.id || index} className="hover:bg-gray-50">
                                    <td className="px-4 py-3 text-sm">{user.prenom} {user.nom}</td>
                                    <td className="px-4 py-3 text-sm text-gray-600">{user.email}</td>
                                    <td className="px-4 py-3 text-sm text-gray-600">
                                        {typeof user.gestionnaire === 'string'
                                            ? user.gestionnaire
                                            : user.gestionnaire
                                                ? `${user.gestionnaire.prenom || ''} ${user.gestionnaire.nom || ''}`.trim()
                                                : 'Non assigné'}
                                    </td>
                                    <td className="px-4 py-3 text-sm">
                                        <span className={`px-2 py-1 rounded-full text-xs ${user.etat === 'actif' ? 'bg-green-100 text-green-800' :
                                            user.etat === 'fermé' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'}`}>
                                            {user.etat || 'Non défini'}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-sm text-gray-600">
                                        {user.dateOuverture ? new Date(user.dateOuverture).toLocaleDateString() : '-'}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="mt-4 flex justify-center">
                    <div className="flex gap-2">
                        <button onClick={() => setPage(pagination.page - 1)} disabled={pagination.page === 1} className="px-3 py-2 border rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed">Précédent</button>
                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                            const page = i + 1;
                            return (
                                <button key={page} onClick={() => setPage(page)} className={`px-3 py-2 border rounded-md text-sm ${pagination.page === page ? 'bg-blue-600 text-white border-blue-600' : 'hover:bg-gray-50'}`}>{page}</button>
                            );
                        })}
                        <button onClick={() => setPage(pagination.page + 1)} disabled={pagination.page === totalPages} className="px-3 py-2 border rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed">Suivant</button>
                    </div>
                </div>
            )}
        </div>
    );
};
