/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect est un logiciel libre : vous pouvez le redistribuer et/ou le modifier selon les termes de la Licence Publique Générale GNU telle que publiée par la Free Software Foundation, soit la version 3 de la licence, soit (à votre convenance) toute version ultérieure.

Ce programme est distribué dans l'espoir qu'il sera utile, mais SANS AUCUNE GARANTIE ; sans même la garantie implicite de COMMERCIALISATION ou d'ADÉQUATION À UN USAGE PARTICULIER. Voir la Licence Publique Générale GNU pour plus de détails.
*/

import React from 'react';
import { useCompleteUserForm } from '../hooks/useCompleteUserForm';
import { useUserFilters } from '../hooks/useUserFilters';
import { useUsers } from '../hooks/useUserData';
import { userAnalyticsService } from '../services/userAnalyticsService';
import { User } from '@/types/user';

/**
 * Composant de démonstration montrant l'utilisation des hooks personnalisés
 * Ce composant illustre comment utiliser l'écosystème complet de hooks
 */
export const UserManagementDemo: React.FC = () => {
  // Hook pour la gestion complète d'un formulaire
  const {
    formData,
    updateField,
    fieldErrors,
    isValid,
    handleSubmit,
    isSaving,
    canSubmit,
    hasUnsavedChanges
  } = useCompleteUserForm({
    mode: 'create',
    validationMode: 'onChange',
    onSuccess: (user) => {
      console.log('Utilisateur créé avec succès:', user);
    },
    onError: (error) => {
      console.error('Erreur:', error);
    }
  });

  // Hook pour la récupération et gestion des utilisateurs
  const {
    users,
    loading: usersLoading,
    fetchUsers,
    refreshUsers
  } = useUsers();

  // Hook pour les filtres et tri
  const {
    filters,
    sortOptions,
    pagination,
    updateFilter,
    updateSort,
    setPage,
    processUsers
  } = useUserFilters({
    initialSort: { field: 'dateOuverture', direction: 'desc' },
    initialPagination: { page: 1, pageSize: 10 }
  });

  // Traitement des utilisateurs avec filtres/tri/pagination
  const {
    paginatedUsers,
    totalPages,
    totalItems,
    hasFilters
  } = processUsers(users);

  // Calcul des statistiques
  const stats = userAnalyticsService.calculateStats(users);
  const insights = userAnalyticsService.generateInsights(users);

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Démonstration de l&apos;Écosystème Utilisateurs</h1>

      {/* Section Statistiques */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Statistiques</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div className="bg-blue-100 p-4 rounded-lg">
            <h3 className="font-semibold">Total Utilisateurs</h3>
            <p className="text-2xl font-bold text-blue-600">{stats.total}</p>
          </div>
          <div className="bg-green-100 p-4 rounded-lg">
            <h3 className="font-semibold">Ajoutés Récemment</h3>
            <p className="text-2xl font-bold text-green-600">{stats.recentlyAdded}</p>
          </div>
          <div className="bg-yellow-100 p-4 rounded-lg">
            <h3 className="font-semibold">Mis à jour récemment</h3>
            <p className="text-2xl font-bold text-yellow-600">{stats.recentlyUpdated}</p>
          </div>
        </div>

        {/* Insights */}
        {insights.length > 0 && (
          <div className="bg-purple-50 p-4 rounded-lg">
            <h3 className="font-semibold mb-2">Suggestions d&apos;amélioration:</h3>
            <ul className="list-disc list-inside space-y-1">
              {insights.map((insight, index) => (
                <li key={index} className="text-purple-700">{insight}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Section Formulaire de Création */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Nouveau Utilisateur</h2>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

            {/* Nom */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nom *
              </label>
              <input
                type="text"
                value={formData.nom}
                onChange={(e) => updateField('nom', e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${fieldErrors.nom ? 'border-red-500' : 'border-gray-300'
                  }`}
                placeholder="Nom de famille"
              />
              {fieldErrors.nom && (
                <p className="text-red-500 text-sm mt-1">{fieldErrors.nom}</p>
              )}
            </div>

            {/* Prénom */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Prénom *
              </label>
              <input
                type="text"
                value={formData.prenom}
                onChange={(e) => updateField('prenom', e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${fieldErrors.prenom ? 'border-red-500' : 'border-gray-300'
                  }`}
                placeholder="Prénom"
              />
              {fieldErrors.prenom && (
                <p className="text-red-500 text-sm mt-1">{fieldErrors.prenom}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email *
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => updateField('email', e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${fieldErrors.email ? 'border-red-500' : 'border-gray-300'
                  }`}
                placeholder="email@example.com"
              />
              {fieldErrors.email && (
                <p className="text-red-500 text-sm mt-1">{fieldErrors.email}</p>
              )}
            </div>

            {/* Téléphone */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Téléphone *
              </label>
              <input
                type="tel"
                value={formData.telephone}
                onChange={(e) => updateField('telephone', e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${fieldErrors.telephone ? 'border-red-500' : 'border-gray-300'
                  }`}
                placeholder="01 23 45 67 89"
              />
              {fieldErrors.telephone && (
                <p className="text-red-500 text-sm mt-1">{fieldErrors.telephone}</p>
              )}
            </div>

            {/* Gestionnaire */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Gestionnaire *
              </label>
              <select
                value={formData.gestionnaire}
                onChange={(e) => updateField('gestionnaire', e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${fieldErrors.gestionnaire ? 'border-red-500' : 'border-gray-300'
                  }`}
              >
                <option value="">Sélectionner un gestionnaire</option>
                <option value="gestionnaire1">Gestionnaire 1</option>
                <option value="gestionnaire2">Gestionnaire 2</option>
                <option value="gestionnaire3">Gestionnaire 3</option>
              </select>
              {fieldErrors.gestionnaire && (
                <p className="text-red-500 text-sm mt-1">{fieldErrors.gestionnaire}</p>
              )}
            </div>

            {/* Nationalité */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nationalité *
              </label>
              <input
                type="text"
                value={formData.nationalite}
                onChange={(e) => updateField('nationalite', e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${fieldErrors.nationalite ? 'border-red-500' : 'border-gray-300'
                  }`}
                placeholder="Nationalité"
              />
              {fieldErrors.nationalite && (
                <p className="text-red-500 text-sm mt-1">{fieldErrors.nationalite}</p>
              )}
            </div>
          </div>

          {/* Boutons d'action */}
          <div className="mt-6 flex gap-4">
            <button
              onClick={handleSubmit}
              disabled={!canSubmit || isSaving}
              className={`px-6 py-2 rounded-md font-medium ${canSubmit && !isSaving
                ? 'bg-blue-600 text-white hover:bg-blue-500'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
            >
              {isSaving ? 'Création en cours...' : 'Créer Utilisateur'}
            </button>

            {hasUnsavedChanges && (
              <div className="flex items-center text-orange-600">
                <span className="text-sm">⚠ Modifications non sauvegardées</span>
              </div>
            )}
          </div>

          {/* Indicateur de validité */}
          <div className="mt-4">
            <div className={`text-sm ${isValid ? 'text-green-600' : 'text-red-600'}`}>
              {isValid ? '✓ Formulaire valide' : '✗ Formulaire invalide'}
            </div>
          </div>
        </div>
      </div>

      {/* Section Liste et Filtres */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Liste des Utilisateurs</h2>

        {/* Filtres */}
        <div className="bg-gray-50 p-4 rounded-lg mb-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Recherche
              </label>
              <input
                type="text"
                value={filters.search || ''}
                onChange={(e) => updateFilter('search', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="Nom, email, téléphone..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Gestionnaire
              </label>
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
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Statut
              </label>
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
                    <td className="px-4 py-3 text-sm">
                      {user.prenom} {user.nom}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {user.email}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {typeof user.gestionnaire === 'string'
                        ? user.gestionnaire
                        : user.gestionnaire
                          ? `${user.gestionnaire.prenom || ''} ${user.gestionnaire.nom || ''}`.trim()
                          : 'Non assigné'}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <span className={`px-2 py-1 rounded-full text-xs ${user.etat === 'actif' ? 'bg-green-100 text-green-800' :
                        user.etat === 'fermé' ? 'bg-red-100 text-red-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
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
              <button
                onClick={() => setPage(pagination.page - 1)}
                disabled={pagination.page === 1}
                className="px-3 py-2 border rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Précédent
              </button>

              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const page = i + 1;
                return (
                  <button
                    key={page}
                    onClick={() => setPage(page)}
                    className={`px-3 py-2 border rounded-md text-sm ${pagination.page === page
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'hover:bg-gray-50'
                      }`}
                  >
                    {page}
                  </button>
                );
              })}

              <button
                onClick={() => setPage(pagination.page + 1)}
                disabled={pagination.page === totalPages}
                className="px-3 py-2 border rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Suivant
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Actions globales */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Actions</h2>
        <div className="flex gap-4">
          <button
            onClick={refreshUsers}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-500"
          >
            Actualiser la liste
          </button>

          <button
            onClick={() => console.log('Export des utilisateurs filtrés:', paginatedUsers)}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-500"
          >
            Exporter ({totalItems} utilisateurs)
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserManagementDemo;
