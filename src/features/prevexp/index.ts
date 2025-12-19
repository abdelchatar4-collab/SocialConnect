/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect est un logiciel libre : vous pouvez le redistribuer et/ou le modifier selon les termes de la Licence Publique Générale GNU telle que publiée par la Free Software Foundation, soit la version 3 de la licence, soit (à votre convenance) toute version ultérieure.

Ce programme est distribué dans l'espoir qu'il sera utile, mais SANS AUCUNE GARANTIE ; sans même la garantie implicite de COMMERCIALISATION ou d'ADÉQUATION À UN USAGE PARTICULIER. Voir la Licence Publique Générale GNU pour plus de détails.
*/

/**
 * PrevExp Feature - Prevention Expulsion module
 */

// Types
export interface PrevExpData {
    hasPrevExp: boolean;
    dateReception?: string;
    dateRequete?: string;
    dateVad?: string;
    motifRequete?: string;
    dateAudience?: string;
    dateSignification?: string;
    dateJugement?: string;
    dateExpulsion?: string;
    decision?: string;
    commentaire?: string;
    demandeCpas?: string;
    negociationProprio?: string;
    solutionRelogement?: string;
    maintienLogement?: string;
    typeFamille?: string;
    typeRevenu?: string;
    etatLogement?: string;
    nombreChambre?: string;
    aideJuridique?: string;
}

// Re-export components when created
// export { PrevExpFields } from './components/PrevExpFields';
