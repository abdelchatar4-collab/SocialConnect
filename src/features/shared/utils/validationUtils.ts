/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect est un logiciel libre : vous pouvez le redistribuer et/ou le modifier selon les termes de la Licence Publique Générale GNU telle que publiée par la Free Software Foundation, soit la version 3 de la licence, soit (à votre convenance) toute version ultérieure.

Ce programme est distribué dans l'espoir qu'il sera utile, mais SANS AUCUNE GARANTIE ; sans même la garantie implicite de COMMERCIALISATION ou d'ADÉQUATION À UN USAGE PARTICULIER. Voir la Licence Publique Générale GNU pour plus de détails.
*/

/**
 * Utilitaires de validation
 */

/**
 * Valide un email
 */
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Valide un numéro de téléphone belge
 */
export function validatePhoneBE(phone: string): boolean {
  // Patterns pour les numéros belges
  const patterns = [
    /^0[1-9]\d{7,8}$/, // Format national (04XX XX XX XX)
    /^\+32[1-9]\d{7,8}$/, // Format international (+32 4XX XX XX XX)
    /^0032[1-9]\d{7,8}$/ // Format international (0032 4XX XX XX XX)
  ];

  const cleaned = phone.replace(/[\s\-\(\)]/g, '');
  return patterns.some(pattern => pattern.test(cleaned));
}

/**
 * Valide un code postal belge
 */
export function validatePostalCodeBE(postalCode: string): boolean {
  const cleanedCode = postalCode.replace(/\s/g, '');
  return /^[1-9]\d{3}$/.test(cleanedCode);
}

/**
 * Valide une date au format dd/MM/yyyy
 */
export function validateDateFormat(date: string): boolean {
  const dateRegex = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/;
  const match = date.match(dateRegex);

  if (!match) return false;

  const day = parseInt(match[1], 10);
  const month = parseInt(match[2], 10);
  const year = parseInt(match[3], 10);

  // Vérifications de base
  if (month < 1 || month > 12) return false;
  if (day < 1 || day > 31) return false;
  if (year < 1900 || year > new Date().getFullYear() + 10) return false;

  // Vérification des jours par mois
  const daysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

  // Année bissextile
  if (month === 2 && isLeapYear(year)) {
    return day <= 29;
  }

  return day <= daysInMonth[month - 1];
}

/**
 * Vérifie si une année est bissextile
 */
export function isLeapYear(year: number): boolean {
  return (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
}

/**
 * Valide un champ obligatoire
 */
export function validateRequired(value: any): boolean {
  if (value === null || value === undefined) return false;
  if (typeof value === 'string') return value.trim().length > 0;
  return true;
}

/**
 * Valide la longueur d'un texte
 */
export function validateLength(
  text: string,
  options: { min?: number; max?: number }
): boolean {
  if (!text) return !options.min || options.min === 0;

  const length = text.trim().length;

  if (options.min && length < options.min) return false;
  if (options.max && length > options.max) return false;

  return true;
}

/**
 * Valide qu'une valeur est dans une liste d'options
 */
export function validateInList(value: string, options: string[]): boolean {
  return options.includes(value);
}

/**
 * Valide un numéro
 */
export function validateNumber(
  value: string | number,
  options: { min?: number; max?: number; integer?: boolean } = {}
): boolean {
  const num = typeof value === 'string' ? parseFloat(value) : value;

  if (isNaN(num)) return false;

  if (options.integer && !Number.isInteger(num)) return false;
  if (options.min !== undefined && num < options.min) return false;
  if (options.max !== undefined && num > options.max) return false;

  return true;
}
