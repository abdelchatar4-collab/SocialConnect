/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect - API User Types
*/

export interface CreateUserRequestBody {
    nom?: string;
    prenom?: string;
    dateNaissance?: string | null;
    genre?: string;
    telephone?: string;
    email?: string;
    dateOuverture?: string | null;
    dateCloture?: string | null;
    etat?: string;
    antenne?: string;
    statutSejour?: string;
    gestionnaire?: string;
    nationalite?: string;
    trancheAge?: string;
    remarques?: string;
    secteur?: string;
    langue?: string;
    situationProfessionnelle?: string;
    revenus?: string;
    premierContact?: string;
    notesGenerales?: string;
    problematiquesDetails?: string;
    informationImportante?: string;
    afficherDonneesConfidentielles?: boolean;
    donneesConfidentielles?: string;
    hasPrevExp?: boolean;
    prevExpDateReception?: string | null;
    prevExpDateRequete?: string | null;
    prevExpDateVad?: string | null;
    prevExpDateAudience?: string | null;
    prevExpDateSignification?: string | null;
    prevExpDateJugement?: string | null;
    prevExpDateExpulsion?: string | null;
    prevExpDossierOuvert?: string;
    prevExpDecision?: string;
    prevExpCommentaire?: string;
    prevExpDemandeCpas?: string;
    prevExpNegociationProprio?: string;
    prevExpSolutionRelogement?: string;
    prevExpMaintienLogement?: string;
    prevExpTypeFamille?: string;
    prevExpTypeRevenu?: string;
    prevExpEtatLogement?: string;
    prevExpNombreChambre?: string;
    prevExpAideJuridique?: string;
    prevExpMotifRequete?: string;
    logementDetails?: {
        typeLogement?: string;
        proprietaire?: string;
        bailEnregistre?: string;
        dateContrat?: string | null;
        dateEntree?: string | null;
        dureeContrat?: string;
        loyer?: string;
        charges?: string;
        garantieLocative?: string;
        statutGarantie?: string;
        hasLitige?: boolean;
        typeLitige?: string;
        dateLitige?: string | null;
        preavisPour?: string;
        descriptionLitige?: string;
        actionsPrises?: string;
        datePreavis?: string | null;
        dureePreavis?: string;
        dateSortie?: string | null;
        motifSortie?: string;
        destinationSortie?: string;
        commentaire?: string;
        actions?: any[];
    } | null;
    adresse?: {
        rue?: string;
        numero?: string;
        boite?: string;
        codePostal?: string;
        ville?: string;
    } | null;
    problematiques?: Array<{ type: string; description?: string | null }>;
}
