/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect est un logiciel libre : vous pouvez le redistribuer et/ou le modifier selon les termes de la Licence Publique Générale GNU telle que publiée par la Free Software Foundation, soit la version 3 de la licence, soit (à votre convenance) toute version ultérieure.

Ce programme est distribué dans l'espoir qu'il sera utile, mais SANS AUCUNE GARANTIE ; sans même la garantie implicite de COMMERCIALISATION ou d'ADÉQUATION À UN USAGE PARTICULIER. Voir la Licence Publique Générale GNU pour plus de détails.
*/

export const DROPDOWN_CATEGORIES = {
  // Catégories principales
  PROBLEMATIQUES: 'problematiques',
  ACTIONS: 'actions',
  PARTENAIRES: 'partenaire',

  // Informations personnelles
  ETAT: 'etat',
  ANTENNE: 'antenne',
  GESTIONNAIRE: 'gestionnaire',

  // Logement
  TYPE_LOGEMENT: 'typeLogement',
  STATUT_OCCUPATION: 'statutOccupation',
  PREV_EXP_DECISION: 'prevExpDecision',
  PREV_EXP_DEMANDE_CPAS: 'prevExpDemandeCpas',
  PREV_EXP_NEGOCIATION_PROPRIO: 'prevExpNegociationProprio',
  PREV_EXP_SOLUTION_RELOGEMENT: 'prevExpSolutionRelogement',
  PREV_EXP_TYPE_FAMILLE: 'prevExpTypeFamille',
  PREV_EXP_TYPE_REVENU: 'prevExpTypeRevenu',
  PREV_EXP_ETAT_LOGEMENT: 'prevExpEtatLogement',
  PREV_EXP_NOMBRE_CHAMBRE: 'prevExpNombreChambre',
  PREV_EXP_AIDE_JURIDIQUE: 'prevExpAideJuridique',
  PREV_EXP_MOTIF_REQUETE: 'prevExpMotifRequete',

  // Logement Standardisation
  STATUT_GARANTIE: 'statutGarantie',
  BAIL_ENREGISTRE: 'bailEnregistre',
  DUREE_CONTRAT: 'dureeContrat',
  TYPE_LITIGE: 'typeLitige',
  DUREE_PREAVIS: 'dureePreavis',
  PREAVIS_POUR: 'preavisPour',

  // Statuts et situation
  STATUT_SEJOUR: 'statutSejour',
  STATUT_SOCIAL: 'statutSocial',
  SITUATION_FAMILIALE: 'situationFamiliale',
  SITUATION_PROFESSIONNELLE: 'situationProfessionnelle',

  // Langue et nationalité
  LANGUE: 'langue',
  NATIONALITE: 'nationalite',
  PREMIER_CONTACT: 'premierContact',
  REVENUS: 'revenus',
  PRESTATION_MOTIFS: 'prestation_motifs'
} as const;

export type DropdownCategory = typeof DROPDOWN_CATEGORIES[keyof typeof DROPDOWN_CATEGORIES];
