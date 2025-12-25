/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect - User Model Interface
*/

import {
    Mutuelle, DocumentType, MetaData, Gestionnaire, Adresse,
    Problematique, ActionSuivi
} from './sub-interfaces';
import { LogementDetails } from './logement';

export interface User {
    id: string;
    nom?: string | null;
    prenom?: string | null;
    dateNaissance?: Date | string | null;
    genre?: string | null;
    telephone?: string | null;
    email?: string | null;
    adresseId?: string | null;
    dateOuverture?: Date | string | null;
    dateCloture?: Date | string | null;
    etat?: string | null;
    antenne?: string | null;
    statutSejour?: string | null;
    gestionnaire?: Gestionnaire | string | null;
    nationalite?: string | null;
    trancheAge?: string | null;
    remarques?: string | null;
    secteur?: string | null;
    langue?: string | null;
    situationProfessionnelle?: string | null;
    revenus?: string | null;
    premierContact?: string | null;
    notesGenerales?: string | null;
    problematiquesDetails?: string | null;
    hasPrevExp?: boolean | null;
    prevExpDateReception?: Date | string | null;
    prevExpDateRequete?: Date | string | null;
    prevExpDateVad?: Date | string | null;
    prevExpMotifRequete?: string | null;
    prevExpDateAudience?: Date | string | null;
    prevExpDateSignification?: Date | string | null;
    prevExpDateJugement?: Date | string | null;
    prevExpDateExpulsion?: Date | string | null;
    prevExpDossierOuvert?: string | null;
    prevExpDecision?: string | null;
    prevExpCommentaire?: string | null;
    prevExpDemandeCpas?: string | null;
    prevExpNegociationProprio?: string | null;
    prevExpSolutionRelogement?: string | null;
    prevExpMaintienLogement?: string | null;
    prevExpTypeFamille?: string | null;
    prevExpTypeRevenu?: string | null;
    prevExpEtatLogement?: string | null;
    prevExpNombreChambre?: string | null;
    prevExpAideJuridique?: string | null;
    logementDetails?: LogementDetails | string | null;
    mediationType?: string | null;
    mediationDemandeur?: string | null;
    mediationPartieAdverse?: string | null;
    mediationStatut?: string | null;
    mediationDescription?: string | null;
    adresse?: Adresse | null;
    documents?: DocumentType[] | null;
    meta?: MetaData | null;
    problematiques?: Problematique[] | null;
    actions?: ActionSuivi[] | null;
    actionsSuivi?: ActionSuivi[] | null;
    rgpdAttestationGeneratedAt?: Date | string | null;
    mutuelle?: Mutuelle | null;
    informationImportante?: string | null;
    partenaire?: string | null;
    afficherDonneesConfidentielles?: boolean | null;
    donneesConfidentielles?: string | null;
    dateCreation?: Date | string | null;
    derniereModification?: Date | string | null;
    createdBy?: string | null;
    createdAt?: Date | string | null;
    updatedBy?: string | null;
    updatedAt?: Date | string | null;
}
