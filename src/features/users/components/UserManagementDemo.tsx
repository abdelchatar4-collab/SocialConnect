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

// Sub-components
import { UserManagementStats } from './Demo/UserManagementStats';
import { UserManagementForm } from './Demo/UserManagementForm';
import { UserManagementList } from './Demo/UserManagementList';

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

      <UserManagementStats stats={stats} insights={insights} />

      <UserManagementForm
        formData={formData}
        updateField={updateField}
        fieldErrors={fieldErrors}
        isValid={isValid}
        handleSubmit={handleSubmit}
        isSaving={isSaving}
        canSubmit={canSubmit}
        hasUnsavedChanges={hasUnsavedChanges}
      />

      <UserManagementList
        usersLoading={usersLoading}
        paginatedUsers={paginatedUsers}
        totalItems={totalItems}
        totalPages={totalPages}
        hasFilters={hasFilters}
        filters={filters}
        updateFilter={updateFilter}
        sortOptions={sortOptions}
        updateSort={updateSort}
        pagination={pagination}
        setPage={setPage}
        stats={stats}
      />

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
