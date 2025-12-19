/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect est un logiciel libre : vous pouvez le redistribuer et/ou le modifier selon les termes de la Licence Publique Générale GNU telle que publiée par la Free Software Foundation, soit la version 3 de la licence, soit (à votre convenance) toute version ultérieure.

Ce programme est distribué dans l'espoir qu'il sera utile, mais SANS AUCUNE GARANTIE ; sans même la garantie implicite de COMMERCIALISATION ou d'ADÉQUATION À UN USAGE PARTICULIER. Voir la Licence Publique Générale GNU pour plus de détails.
*/

// src/types/index.ts

// Réexporter tout depuis user.ts
export * from './user';
export * from './errors';

// Import for the interface below
import type { UserFormData } from './user';

// UserForm interface
export interface UserFormRef {
  submitForm: () => Promise<void>;
  resetForm: () => void;
  getCurrentData: () => Partial<UserFormData>;
  isDirty: () => boolean;
}

// Ajouter d'autres types globaux ici si nécessaire
