/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect est un logiciel libre : vous pouvez le redistribuer et/ou le modifier selon les termes de la Licence Publique Générale GNU telle que publiée par la Free Software Foundation, soit la version 3 de la licence, soit (à votre convenance) toute version ultérieure.

Ce programme est distribué dans l'espoir qu'il sera utile, mais SANS AUCUNE GARANTIE ; sans même la garantie implicite de COMMERCIALISATION ou d'ADÉQUATION À UN USAGE PARTICULIER. Voir la Licence Publique Générale GNU pour plus de détails.
*/

import { ApiError } from '@/types/errors';

export const handleApiError = (error: unknown): ApiError => {
  if (error instanceof Error) {
    return { message: error.message, code: 'GENERIC_ERROR' };
  }
  // Gestion spécifique des erreurs Prisma
  if (typeof error === 'object' && error !== null && 'code' in error) {
    const prismaError = error as { code: string; message?: string };
    switch (prismaError.code) {
      case 'P2002':
        return { message: 'Violation de contrainte unique', code: 'UNIQUE_CONSTRAINT' };
      case 'P2025':
        return { message: 'Enregistrement non trouvé', code: 'NOT_FOUND' };
      default:
        return { message: prismaError.message || 'Erreur de base de données', code: 'DATABASE_ERROR' };
    }
  }

  return { message: 'Erreur inconnue', code: 'UNKNOWN_ERROR' };
};
