/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect est un logiciel libre : vous pouvez le redistribuer et/ou le modifier selon les termes de la Licence Publique Générale GNU telle que publiée par la Free Software Foundation, soit la version 3 de la licence, soit (à votre convenance) toute version ultérieure.

Ce programme est distribué dans l'espoir qu'il sera utile, mais SANS AUCUNE GARANTIE ; sans même la garantie implicite de COMMERCIALISATION ou d'ADÉQUATION À UN USAGE PARTICULIER. Voir la Licence Publique Générale GNU pour plus de détails.
*/

// Fonction utilitaire pour déduire le type d'action
const deduceActionType = (action: any): string => {
  if (action.type && action.type.trim() !== '') return action.type;
  const desc = (action.description || '').toLowerCase();
  const toCheck = desc;

  if (/\b(rdv|rendez[- ]?vous)\b/.test(toCheck)) return 'RDV';
  if (/\bappel(s)?\b/.test(toCheck)) return 'Appel';
  if (/\brelance(s)?\b/.test(toCheck)) return 'Relance';
  if (/\bmail(s)?\b/.test(toCheck)) return 'Mail';
  if (/\bsuivi(s)?\b/.test(toCheck)) return 'Suivi';
  if (/\bsms\b/.test(toCheck)) return 'SMS';
  if (/\bvisite(s)?\b/.test(toCheck)) return 'Visite';
  if (/\b(vente|contrat de vente|voiture|véhicule|immatriculation)\b/.test(toCheck)) return 'Vente/Voiture';
  if (/\b(simulation|simulation en ligne|calcul|estimation|demande de simulation)\b/.test(toCheck)) return 'Simulation';
  if (/\b(document|documents|envoyer documents|imprimer|impression|scan|scanner)\b/.test(toCheck)) return 'Document';
  if (/\b(facture|paiement|payer|régler|échéance|dette|remboursement)\b/.test(toCheck)) return 'Facture/Paiement';
  if (/\b(\d{1,2}[\/\-.]+\d{1,2}[\/\-.]+\d{2,4})\b/.test(toCheck)) return 'Action datée';

  return 'Autre';
};

// Interface pour les actions
interface ActionItem {
  date: string | null;
  type: string;
  description: string;
  originalLine: string;
}

// Fonction pour normaliser et valider les dates
const parseAndValidateDate = (dateStr: string): string | null => {
  if (!dateStr) return null;

  // Regex plus stricte pour les dates
  const dateMatch = dateStr.match(/(\d{1,2})[\/\-.](\d{1,2})[\/\-.](\d{2,4})/);
  if (!dateMatch) return null;

  const [, day, month, year] = dateMatch;
  const fullYear = year.length === 2 ? `20${year}` : year;

  // Validation basique
  const dayNum = parseInt(day);
  const monthNum = parseInt(month);
  const yearNum = parseInt(fullYear);

  if (dayNum < 1 || dayNum > 31 || monthNum < 1 || monthNum > 12 || yearNum < 2000 || yearNum > 2030) {
    return null;
  }

  // Retourner au format ISO
  return `${fullYear}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
};

// Importer le type ActionSuivi
import { ActionSuivi } from '@/types/user';

// Fonction pour dédupliquer les actions (version adaptée pour ActionSuivi)
export const deduplicateActionsSuivi = (actions: ActionSuivi[]): ActionSuivi[] => {
  const seen = new Set<string>();
  return actions.filter(action => {
    // Normaliser la date pour la déduplication
    let normalizedDate = action.date?.toString() || 'no-date';
    if (action.date && normalizedDate.includes('T')) {
      // Extraire seulement la partie date (YYYY-MM-DD) des dates ISO
      normalizedDate = normalizedDate.split('T')[0];
    }

    // Créer une clé unique basée sur date + type + description normalisée
    const normalizedDesc = (action.description || '').toLowerCase().trim().replace(/\s+/g, ' ');
    const key = `${normalizedDate}-${action.type || 'no-type'}-${normalizedDesc}`;

    if (seen.has(key)) {
      return false; // Action déjà vue, on l'ignore
    }
    seen.add(key);
    return true;
  });
};

// Fonction pour extraire les actions des notes
export const extractActionsFromNotes = (notes: string): ActionItem[] => {
  if (!notes) return [];
  const lines = notes.split(/\n|\r|\r\n|[.;•\u2028\u2029]/).map((l: string) => l.trim()).filter(Boolean);
  const actions: ActionItem[] = [];

  for (const line of lines) {
    if (!line) continue;
    const dateMatch = line.match(/(\d{1,2}[\/\-.](\d{1,2})[\/\-.](\d{2,4})|\d{4}-\d{2}-\d{2})/);
    const rawDate = dateMatch ? dateMatch[0] : null;
    const date = rawDate ? parseAndValidateDate(rawDate) : null;
    let type = deduceActionType({ description: line });

    if (rawDate && line.startsWith(rawDate)) {
      const afterDate = line.slice(rawDate.length).trim();
      if (afterDate) {
        const typeAfter = deduceActionType({ description: afterDate });
        if (typeAfter && typeAfter !== 'Autre') type = typeAfter;
      }
    }

    let description = line;
    if (rawDate) description = description.replace(rawDate, '').replace(/(le|du|au|:)/i, '').trim();

    if (type !== 'Autre' || date || /envoy[ée]/i.test(line) || /mail|email|courriel/i.test(line)) {
      actions.push({ date, type, description, originalLine: line });
    }
  }

  return actions;
};

// CORRECTION: Fonction pour trier les actions par date (ordre chronologique)
export const sortActionsByDate = (actions: ActionItem[]): ActionItem[] => {
  return actions.sort((a, b) => {
    if (!a.date && !b.date) return 0;
    if (!a.date) return 1;
    if (!b.date) return -1;

    // Convertir les dates en objets Date pour comparaison
    const dateA = new Date(a.date);
    const dateB = new Date(b.date);

    // CORRECTION: Tri croissant (plus ancien en premier)
    return dateA.getTime() - dateB.getTime();
  });
};

// Cache pour éviter les extractions multiples
const extractionCache = new Map<string, ActionItem[]>();

// Fonction centralisée pour obtenir les actions d'un utilisateur
export const getActionsForUser = (user: any): ActionItem[] => {
  // Si l'utilisateur a déjà des actions manuelles, les utiliser
  if (user.actions && user.actions.length > 0) {
    return user.actions;
  }

  // Sinon, extraire depuis les notes avec cache
  const cacheKey = `${user.id}-${user.notesGenerales || ''}`;
  if (extractionCache.has(cacheKey)) {
    return extractionCache.get(cacheKey)!;
  }

  const extracted = extractActionsFromNotes(user.notesGenerales || '');
  const deduplicated = deduplicateActions(extracted);
  const sorted = sortActionsByDate(deduplicated);

  extractionCache.set(cacheKey, sorted);
  return sorted;
};

// Fonction principale pour obtenir les 3 dernières actions (CORRIGÉE)
export const getLastThreeActions = (notes: string): ActionItem[] => {
  const extracted = extractActionsFromNotes(notes);
  const deduplicated = deduplicateActions(extracted); // Nouvelle étape
  const sorted = sortActionsByDate(deduplicated);
  return sorted.slice(-3); // Prendre les 3 dernières (plus récentes)
};

// Fonction pour obtenir le nombre total d'actions
export const getTotalActionsCount = (notes: string): number => {
  const extracted = extractActionsFromNotes(notes);
  const deduplicated = deduplicateActions(extracted);
  return deduplicated.length;
};

// Fonction pour vider le cache (utile pour les tests)
export const clearExtractionCache = (): void => {
  extractionCache.clear();
};

export { deduceActionType };
export type { ActionItem };

// Fonction pour dédupliquer les actions (version pour ActionItem)
export const deduplicateActions = (actions: ActionItem[]): ActionItem[] => {
  const seen = new Set<string>();
  return actions.filter(action => {
    // Normaliser la date pour la déduplication
    let normalizedDate = action.date || 'no-date';
    if (action.date && normalizedDate.includes('T')) {
      // Extraire seulement la partie date (YYYY-MM-DD) des dates ISO
      normalizedDate = normalizedDate.split('T')[0];
    }

    // Créer une clé unique basée sur date + type + description normalisée
    const normalizedDesc = (action.description || '').toLowerCase().trim().replace(/\s+/g, ' ');
    const key = `${normalizedDate}-${action.type || 'no-type'}-${normalizedDesc}`;

    if (seen.has(key)) {
      return false; // Action déjà vue, on l'ignore
    }
    seen.add(key);
    return true;
  });
};
