/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect est un logiciel libre : vous pouvez le redistribuer et/ou le modifier selon les termes de la Licence Publique Générale GNU telle que publiée par la Free Software Foundation, soit la version 3 de la licence, soit (à votre convenance) toute version ultérieure.

Ce programme est distribué dans l'espoir qu'il sera utile, mais SANS AUCUNE GARANTIE ; sans même la garantie implicite de COMMERCIALISATION ou d'ADÉQUATION À UN USAGE PARTICULIER. Voir la Licence Publique Générale GNU pour plus de détails.
*/

/**
 * Utilitaires de formatage
 */

/**
 * Formate un numéro de téléphone
 */
export function formatPhoneNumber(phone: string): string {
  if (!phone) return '';

  // Nettoyer le numéro
  const cleaned = phone.replace(/\D/g, '');

  // Format belge standard
  if (cleaned.startsWith('32')) {
    // +32 format
    return `+32 ${cleaned.slice(2, 3)} ${cleaned.slice(3, 5)} ${cleaned.slice(5, 7)} ${cleaned.slice(7, 9)}`;
  } else if (cleaned.startsWith('0')) {
    // Format national
    return `${cleaned.slice(0, 4)} ${cleaned.slice(4, 6)} ${cleaned.slice(6, 8)} ${cleaned.slice(8, 10)}`;
  }

  return phone;
}

/**
 * Formate une adresse complète
 */
export function formatAddress(adresse: any): string {
  if (!adresse) return '';

  if (typeof adresse === 'string') {
    return adresse;
  }

  const parts = [
    adresse.rue,
    adresse.numero,
    adresse.boite ? `boîte ${adresse.boite}` : null,
    adresse.codePostal,
    adresse.ville
  ].filter(Boolean);

  return parts.join(', ');
}

/**
 * Capitalise la première lettre de chaque mot
 */
export function capitalizeWords(str: string): string {
  if (!str) return '';

  return str
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Tronque un texte à une longueur donnée
 */
export function truncateText(text: string, maxLength: number): string {
  if (!text || text.length <= maxLength) return text;

  return text.slice(0, maxLength - 3) + '...';
}

/**
 * Formate un montant en euros
 */
export function formatCurrency(amount: string | number): string {
  if (!amount) return '';

  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (isNaN(num)) return amount.toString();

  return new Intl.NumberFormat('fr-BE', {
    style: 'currency',
    currency: 'EUR'
  }).format(num);
}

/**
 * Nettoie un nom de fichier
 */
export function sanitizeFileName(fileName: string): string {
  return fileName
    .replace(/[^a-zA-Z0-9.-]/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '');
}
