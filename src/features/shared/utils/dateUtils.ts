/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect est un logiciel libre : vous pouvez le redistribuer et/ou le modifier selon les termes de la Licence Publique Générale GNU telle que publiée par la Free Software Foundation, soit la version 3 de la licence, soit (à votre convenance) toute version ultérieure.

Ce programme est distribué dans l'espoir qu'il sera utile, mais SANS AUCUNE GARANTIE ; sans même la garantie implicite de COMMERCIALISATION ou d'ADÉQUATION À UN USAGE PARTICULIER. Voir la Licence Publique Générale GNU pour plus de détails.
*/

/**
 * Utilitaires pour la gestion des dates
 */

import { format, parse, isValid, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';

/**
 * Formate une date en format français
 */
export function formatDate(date: string | Date, formatStr: string = 'dd/MM/yyyy'): string {
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    if (!isValid(dateObj)) return '';
    return format(dateObj, formatStr, { locale: fr });
  } catch {
    return '';
  }
}

/**
 * Parse une date depuis un format français
 */
export function parseDate(dateStr: string, formatStr: string = 'dd/MM/yyyy'): Date | null {
  try {
    const parsed = parse(dateStr, formatStr, new Date(), { locale: fr });
    return isValid(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

/**
 * Vérifie si une date est valide
 */
export function isValidDate(date: string | Date): boolean {
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    return isValid(dateObj);
  } catch {
    return false;
  }
}

/**
 * Obtient la date actuelle en format français
 */
export function getCurrentDate(formatStr: string = 'dd/MM/yyyy'): string {
  return format(new Date(), formatStr, { locale: fr });
}

/**
 * Calcule l'âge depuis une date de naissance
 */
export function calculateAge(birthDate: string | Date): number {
  try {
    const birth = typeof birthDate === 'string' ? parseISO(birthDate) : birthDate;
    if (!isValid(birth)) return 0;

    const today = new Date();
    const age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      return age - 1;
    }

    return age;
  } catch {
    return 0;
  }
}
