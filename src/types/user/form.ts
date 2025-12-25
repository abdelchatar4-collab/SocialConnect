/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect - User Form Types
*/

import { Mutuelle, Adresse, Problematique, ActionSuivi } from './sub-interfaces';
import { LogementDetailsForm } from './logement';

export interface UserFormData {
    id?: string;
    nom: string;
    prenom: string;
    genre: string;
    telephone: string;
    email: string;
    statutSejour: string;
    gestionnaire: string;
    nationalite: string;
    trancheAge: string;
    remarques: string;
    secteur: string;
    langue: string;
    situationProfessionnelle: string;
    revenus: string;
    premierContact: string;
    notesGenerales: string;
    etat: string;
    antenne: string;
    dateNaissance: string;
    dateOuverture: string;
    dateCloture: string;
    partenaire?: Array<{ id: string; nom: string }> | null;
    adresse: Adresse;
    hasPrevExp: boolean;
    prevExpDateReception: string;
    prevExpDateRequete: string;
    prevExpDateVad: string;
    prevExpMotifRequete: string;
    prevExpDateAudience: string;
    prevExpDateSignification: string;
    prevExpDateJugement: string;
    prevExpDateExpulsion?: string;
    prevExpDossierOuvert?: string;
    prevExpDecision?: string;
    prevExpCommentaire: string;
    prevExpDemandeCpas: string;
    prevExpNegociationProprio: string;
    prevExpSolutionRelogement: string;
    prevExpMaintienLogement: string;
    prevExpTypeFamille: string;
    prevExpTypeRevenu: string;
    prevExpEtatLogement: string;
    prevExpNombreChambre: string;
    prevExpAideJuridique: string;
    logementDetails: LogementDetailsForm;
    problematiques: Problematique[];
    problematiquesDetails: string;
    actions: ActionSuivi[];
    informationImportante: string;
    mediationType: string;
    mediationDemandeur: string;
    mediationPartieAdverse: string;
    mediationStatut: string;
    mediationDescription: string;
    mutuelle?: Mutuelle | null;
    rgpdAttestationGeneratedAt?: Date | string | null;
    afficherDonneesConfidentielles: boolean;
    donneesConfidentielles: string;
    createdBy?: string | null;
    createdAt?: Date | string | null;
    updatedBy?: string | null;
    updatedAt?: Date | string | null;
}
