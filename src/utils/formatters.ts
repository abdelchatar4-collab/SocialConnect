/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect est un logiciel libre : vous pouvez le redistribuer et/ou le modifier selon les termes de la Licence Publique Générale GNU telle que publiée par la Free Software Foundation, soit la version 3 de la licence, soit (à votre convenance) toute version ultérieure.

Ce programme est distribué dans l'espoir qu'il sera utile, mais SANS AUCUNE GARANTIE ; sans même la garantie implicite de COMMERCIALISATION ou d'ADÉQUATION À UN USAGE PARTICULIER. Voir la Licence Publique Générale GNU pour plus de détails.
*/

/**
 * Utilitaires de formatage pour l'application
 */

/**
 * Formate une date en format français (JJ/MM/AAAA)
 */
export const formatDate = (dateInput?: string | number | object | null): string => {
  if (!dateInput) return 'N/A';
  if (typeof dateInput === 'object' && dateInput !== null) {
    return '[Date invalide (Objet)]';
  }
  const dateString = String(dateInput);
  try {
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
      const [year, month, day] = dateString.split('-');
      if (parseInt(month, 10) > 0 && parseInt(month, 10) <= 12 && parseInt(day, 10) > 0 && parseInt(day, 10) <= 31) {
        return `${day}/${month}/${year}`;
      }
    }
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    return date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  } catch (e) {
    console.error("Erreur formatage date:", e, dateString);
    return dateString;
  }
};

/**
 * Formate un numéro de téléphone en format international
 */
export const formatPhone = (phone?: string): string => {
  if (!phone) return 'N/A';
  
  // Supprime tout sauf les chiffres
  const digits = phone.replace(/\D/g, '');
  
  // Formate selon la longueur
  if (digits.length === 10) {
    // Format français 06.12.34.56.78
    return digits.replace(/(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})/, '$1.$2.$3.$4.$5');
  } else if (digits.length === 9) {
    // Format belge 0456.78.90.12
    return digits.replace(/(\d{4})(\d{2})(\d{2})(\d{2})/, '$1.$2.$3.$4');
  }
  
  // Si le format ne correspond à aucun standard, retourne tel quel
  return phone;
};

/**
 * Tronque un texte à une longueur donnée
 */
export const truncateText = (text: string, maxLength: number = 100): string => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

/**
 * Capitalise la première lettre de chaque mot
 */
export const capitalizeWords = (text?: string): string => {
  if (!text) return '';
  return text
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

/**
 * Formate un montant en euros
 */
export const formatCurrency = (amount?: number | string): string => {
  if (amount === undefined || amount === null) return 'N/A';
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (isNaN(numAmount)) return 'N/A';
  
  return new Intl.NumberFormat('fr-FR', { 
    style: 'currency', 
    currency: 'EUR',
    minimumFractionDigits: 2
  }).format(numAmount);
};