/**
 * Types pour l'API Users [id]
 */

// Interface pour le corps de la requête de mise à jour
export interface UpdateUserRequestBody {
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
    donneesConfidentielles?: string;
    partenaire?: string;
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
    logementDetails?: LogementDetails | null;
    adresse?: AdresseInput | null;
    problematiques?: ProblematiqueInput[];
    actions?: ActionInput[];
}

export interface LogementDetails {
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
}

export interface AdresseInput {
    rue?: string;
    numero?: string;
    boite?: string;
    codePostal?: string;
    ville?: string;
    pays?: string;
}

export interface ProblematiqueInput {
    id?: string;
    type: string;
    description?: string | null;
    dateSignalement: string;
}

export interface ActionInput {
    id?: string;
    date: string;
    type: string;
    partenaire?: string | null;
    description?: string | null;
}
