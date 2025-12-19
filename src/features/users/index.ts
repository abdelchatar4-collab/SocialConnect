/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect est un logiciel libre : vous pouvez le redistribuer et/ou le modifier selon les termes de la Licence Publique Générale GNU telle que publiée par la Free Software Foundation, soit la version 3 de la licence, soit (à votre convenance) toute version ultérieure.

Ce programme est distribué dans l'espoir qu'il sera utile, mais SANS AUCUNE GARANTIE ; sans même la garantie implicite de COMMERCIALISATION ou d'ADÉQUATION À UN USAGE PARTICULIER. Voir la Licence Publique Générale GNU pour plus de détails.
*/

/**
 * Index principal pour la fonctionnalité Users
 *
 * Ce fichier centralise tous les exports de la fonctionnalité utilisateurs
 * pour faciliter les imports dans le reste de l'application.
 */

// ==========================================
// COMPOSANTS PRINCIPAUX
// ==========================================

// Composants existants
export { default as UserList } from './components/UserList';
// UserList principal reste aussi dans /src/components/UserList.tsx
// export { default as UserForm } from './components/UserForm'; // Moved to /src/components/UserForm.tsx
export { default as UserDetails } from './components/UserDetails';
export { default as UserPDFView } from './components/UserPDFView';
export { default as ImportUsers } from './components/ImportUsers';

// ==========================================
// HOOKS PERSONNALISÉS
// ==========================================

// Hook principal pour la gestion CRUD des utilisateurs
export { default as useUser } from './hooks/useUser';

// Hook pour les actions de formulaire (CRUD, export, etc.)
export {
  default as useUserFormActions,
  useBasicUserActions,
  useBulkUserActions,
  useGestionnaireActions
} from './hooks/useUserFormActions';

// Hook pour la validation de formulaire
export {
  useUserFormValidation,
  useBasicValidation,
  useRealtimeValidation
} from './hooks/useUserFormValidation';

// Hooks pour la gestion d'état et données
export { useUserFormState, useNewUserForm, useEditUserForm } from './hooks/useUserFormState';
export { useUserData, useUsers, useSingleUser } from './hooks/useUserData';
export { useUserFilters } from './hooks/useUserFilters';
export { useCompleteUserForm, useNewUserFormComplete, useEditUserFormComplete } from './hooks/useCompleteUserForm';

// ==========================================
// SERVICES
// ==========================================

// Service principal de gestion des utilisateurs
export { userService } from './services/userService';

// Service d'analytics et statistiques
export { userAnalyticsService } from './services/userAnalyticsService';
export type { UserStats, AdvancedFilters } from './services/userAnalyticsService';

// ==========================================
// TYPES
// ==========================================

// Types (re-export depuis types centraux)
export type { User, UserFormData, Gestionnaire } from '@/types/user';

// ==========================================
// UTILITAIRES
// ==========================================

// Utils
export * from './utils/userUtils';
