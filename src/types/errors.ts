/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect est un logiciel libre : vous pouvez le redistribuer et/ou le modifier selon les termes de la Licence Publique Générale GNU telle que publiée par la Free Software Foundation, soit la version 3 de la licence, soit (à votre convenance) toute version ultérieure.

Ce programme est distribué dans l'espoir qu'il sera utile, mais SANS AUCUNE GARANTIE ; sans même la garantie implicite de COMMERCIALISATION ou d'ADÉQUATION À UN USAGE PARTICULIER. Voir la Licence Publique Générale GNU pour plus de détails.
*/

export interface ValidationError {
  field: string;
  message: string;
  code?: string;
}

export interface ApiError {
  message: string;
  code?: string;
  details?: Record<string, unknown>;
}

export type FormError = string | ValidationError | ApiError;

export interface FormErrors {
  [key: string]: FormError | FormError[] | undefined;
}

// Utilitaire pour afficher les erreurs de manière cohérente
export const displayError = (error: FormError | FormError[] | undefined): string => {
  if (!error) return '';

  // Si c'est un tableau, prendre la première erreur
  if (Array.isArray(error)) {
    if (error.length === 0) return '';
    const firstError = error[0];
    if (typeof firstError === 'string') return firstError;
    if ('message' in firstError) return firstError.message;
    return 'Erreur inconnue';
  }

  // Si c'est une erreur simple
  if (typeof error === 'string') return error;
  if ('message' in error) return error.message;
  return 'Erreur inconnue';
};
