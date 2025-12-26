/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect est un logiciel libre : vous pouvez le redistribuer et/ou le modifier selon les termes de la Licence Publique Générale GNU telle que publiée par la Free Software Foundation, soit la version 3 de la licence, soit (à votre convenance) toute version ultérieure.

Ce programme est distribué dans l'espoir qu'il sera utile, mais SANS AUCUNE GARANTIE ; sans même la garantie implicite de COMMERCIALISATION ou d'ADÉQUATION À UN USAGE PARTICULIER. Voir la Licence Publique Générale GNU pour plus de détails.
*/

/**
 * Index principal pour les composants partagés
 *
 * Ce fichier centralise tous les exports des composants réutilisables
 * dans toute l'application.
 */

// Layout components
export { default as Layout } from './components/Layout';
export { default as Navbar } from './components/Navbar';
export { default as Header } from './components/Header';

// Form components
// export { default as FormNavigation } from './components/FormNavigation';
// export { default as FormStepper } from './components/FormStepper';
export { default as AddressAutocomplete } from './components/AddressAutocomplete';

// Modal components
export { default as ImportModal } from './components/ImportModal';
// export { default as OptionsModal } from './components/OptionsModal';
export { default as SettingsModal } from '../../components/SettingsModal'; // Corriger le chemin
export { default as BulkExportModal } from './components/BulkExportModal';

// Button components
export { default as ExportButton } from './components/ExportButton';
// Supprimer ces lignes :
// export { default as SettingsModal } from './components/SettingsModal';
// export { default as SettingsButton } from './components/SettingsButton';

// Other shared components
export { DocumentPreview } from './components/DocumentPreview';

// Hooks
export * from './hooks/useLocalStorage';
export * from './hooks/useDebounce';

// Utils
export * from './utils/dateUtils';
export * from './utils/formatUtils';
export * from './utils/validationUtils';

// Types - currently none defined
// export * from './types/common';
