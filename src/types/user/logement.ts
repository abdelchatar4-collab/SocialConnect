/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect - Logement Types
*/

export interface LogementDetails {
    id?: string;
    type?: string;
    statut?: string;
    nombrePieces?: number;
    typeLogement?: string;
    dateEntree?: string;
    dateSortie?: string;
    motifSortie?: string | null;
    destinationSortie?: string | null;
    proprietaire?: string | null;
    bailleur?: string | null;
    loyer?: string | null;
    charges?: string | null;
    commentaire?: string | null;
    commentaires?: string | null;
    userId?: string;
    bailEnregistre?: string;
    dateContrat?: string;
    dureeContrat?: string;
    garantieLocative?: string;
    statutGarantie?: string;
    hasLitige?: boolean;
    typeLitige?: string;
    dateLitige?: string;
    descriptionLitige?: string;
    actionsPrises?: string;
    datePreavis?: string;
    dureePreavis?: string;
    preavisPour?: string;
}

export interface LogementDetailsForm {
    id?: string;
    type: string;
    statut: string;
    nombrePieces: number;
    typeLogement: string;
    dateEntree: string;
    dateSortie: string;
    motifSortie: string;
    destinationSortie: string;
    proprietaire: string;
    bailleur: string;
    loyer: string;
    charges: string;
    commentaire: string;
    commentaires: string;
    userId?: string;
    hasLitige: boolean;
    bailEnregistre?: string;
    dateContrat?: string;
    dureeContrat?: string;
    garantieLocative?: string;
    statutGarantie?: string;
    typeLitige?: string;
    dateLitige?: string;
    descriptionLitige?: string;
    actionsPrises?: string;
    datePreavis?: string;
    dureePreavis?: string;
    preavisPour?: string;
}
