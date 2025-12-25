/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect - API User Mapping Utilities
*/

import { CreateUserRequestBody } from '@/types/api/userApi';
import { generateUserIdByAntenne } from '@/lib/idGenerator';
import { Prisma } from '@prisma/client';

import { normalizeToISODate } from '@/utils/dateUtils';

/**
 * Utility function to parse date strings
 * Supports various formats including French DD/MM/YYYY
 */
export function parseDateString(dateString: string | null | undefined): Date | null {
    if (!dateString || dateString.trim() === "") return null;

    const normalized = normalizeToISODate(dateString);
    if (!normalized) return null;

    const date = new Date(normalized);
    return isNaN(date.getTime()) ? null : date;
}

/**
 * Keywords for automatic problematic categorization
 */
export const PROBLEMATIC_KEYWORDS = [
    { type: "Fiscalité", mots: ["fiscal", "impot", "impôt", "tax", "revenu", "déclaration", "declaration"] },
    { type: "Santé Mentale (dont addiction)", mots: ["santé mentale", "psychologique", "psychiatr", "addict", "drogue", "alcool", "toxicoman", "dépression", "anxiété", "bipolaire", "schizophrén", "suicide"] },
    { type: "CPAS", mots: ["cpas", "ris", "revenu d'intégration", "revenu integration", "aide sociale", "aide du cpas"] },
    { type: "Juridique", mots: ["juridique", "avocat", "justice", "tribunal", "plainte", "procès", "procédure", "droit", "litige", "contentieux"] },
    { type: "Suivi post pénitentiaire/IPPJ", mots: ["pénitentiaire", "penitentiaire", "prison", "ippj", "libération", "liberation", "sortie de prison", "conditionnelle", "surveillance", "bracelet"] },
    { type: "Demande d'hébergement (court et moyen terme)", mots: ["hébergement", "hebergement", "héberger", "heberger", "accueil", "abri", "refuge", "logement temporaire", "logement d'urgence", "urgence logement"] },
    { type: "Famille/couple", mots: ["famille", "couple", "conjoint", "conjointe", "parent", "enfant", "époux", "épouse", "divorce", "séparation", "garde", "violence conjugale", "conflit familial"] },
    { type: "Scolarité", mots: ["scolaire", "école", "ecole", "scolarité", "scolarite", "étude", "etude", "inscription scolaire", "décrochage", "redoublement", "orientation scolaire"] },
    { type: "ISP", mots: ["isp", "insertion socioprofessionnelle", "formation", "emploi", "stage", "job", "travail", "orientation professionnelle"] },
    { type: "Santé (physique; handicap; autonomie)", mots: ["santé physique", "handicap", "autonomie", "maladie", "soin", "médical", "medecin", "infirmier", "infirmière", "hospitalisation", "prothèse", "fauteuil", "dépendance physique"] },
    { type: "Endettement/Surendettement", mots: ["dette", "endettement", "surendettement", "facture", "impayé", "impayés", "huissier", "plan de paiement", "plan de redressement"] },
    { type: "Séjours", mots: ["séjour", "sejour", "titre de séjour", "titre de sejour", "carte de séjour", "carte de sejour", "régularisation", "regularisation", "demande d'asile", "asile", "sans-papiers", "sans papiers"] },
    { type: "Sans abrisme", mots: ["sans-abri", "sans abri", "sdf", "à la rue", "a la rue", "hébergement d'urgence", "hebergement d'urgence", "errance"] },
    { type: "Energie (eau;gaz;électricité)", mots: ["énergie", "energie", "eau", "gaz", "électricité", "electricite", "facture d'énergie", "facture d'energie", "coupure", "compteur", "fournisseur d'énergie", "fournisseur d'energie"] },
    { type: "Médiation/Conflits de voisinage", mots: ["conflit", "voisin", "voisinage", "nuisance", "bruit", "tapage", "médiation", "conciliation", "dispute", "litige voisin", "différend", "altercation", "tension", "copropriété", "syndic", "parties", "accord", "négociation", "plainte voisin", "trouble", "odeur", "animal", "chien", "poubelle", "haie", "clôture", "parking", "stationnement"] },
    { type: "Autre", mots: ["autre", "divers", "inclassable", "non classé", "non classe"] },
];

/**
 * Maps request body to Prisma UserCreateInput
 */
export function mapToUserCreateInput(
    body: CreateUserRequestBody & { annee?: number; dossierPrecedentId?: string },
    sessionUser: { name?: string | null; email?: string | null },
    serviceId: string
): Prisma.UserCreateInput {
    return {
        id: generateUserIdByAntenne(body.antenne),
        annee: body.annee || new Date().getFullYear(),
        createdBy: sessionUser?.name || sessionUser?.email || null,
        nom: body.nom || '',
        prenom: body.prenom || '',
        dateNaissance: parseDateString(body.dateNaissance),
        genre: body.genre,
        telephone: body.telephone,
        email: body.email,
        dateOuverture: parseDateString(body.dateOuverture) || new Date(),
        dateCloture: parseDateString(body.dateCloture),
        etat: body.etat,
        antenne: body.antenne,
        statutSejour: body.statutSejour,
        nationalite: body.nationalite,
        trancheAge: body.trancheAge,
        remarques: body.remarques,
        secteur: body.secteur,
        langue: body.langue,
        situationProfessionnelle: body.situationProfessionnelle,
        revenus: body.revenus,
        premierContact: body.premierContact,
        notesGenerales: body.notesGenerales,
        problematiquesDetails: body.problematiquesDetails,
        informationImportante: body.informationImportante,
        afficherDonneesConfidentielles: body.afficherDonneesConfidentielles || false,
        donneesConfidentielles: body.donneesConfidentielles,
        hasPrevExp: body.hasPrevExp === true,
        prevExpDateReception: parseDateString(body.prevExpDateReception),
        prevExpDateRequete: parseDateString(body.prevExpDateRequete),
        prevExpDateVad: parseDateString(body.prevExpDateVad),
        prevExpDateAudience: parseDateString(body.prevExpDateAudience),
        prevExpDateSignification: parseDateString(body.prevExpDateSignification),
        prevExpDateJugement: parseDateString(body.prevExpDateJugement),
        prevExpDateExpulsion: parseDateString(body.prevExpDateExpulsion),
        prevExpDossierOuvert: body.prevExpDossierOuvert,
        prevExpDecision: body.prevExpDecision,
        prevExpCommentaire: body.prevExpCommentaire,
        prevExpDemandeCpas: body.prevExpDemandeCpas,
        prevExpNegociationProprio: body.prevExpNegociationProprio,
        prevExpSolutionRelogement: body.prevExpSolutionRelogement,
        prevExpMaintienLogement: body.prevExpMaintienLogement,
        prevExpTypeFamille: body.prevExpTypeFamille,
        prevExpTypeRevenu: body.prevExpTypeRevenu,
        prevExpEtatLogement: body.prevExpEtatLogement,
        prevExpNombreChambre: body.prevExpNombreChambre,
        prevExpAideJuridique: body.prevExpAideJuridique,
        prevExpMotifRequete: body.prevExpMotifRequete,
        logementDetails: body.logementDetails ? JSON.stringify(body.logementDetails) : null,
        service: { connect: { id: serviceId } },
        ...(body.dossierPrecedentId ? { dossierPrecedent: { connect: { id: body.dossierPrecedentId } } } : {}),
        ...(body.gestionnaire ? { gestionnaire: { connect: { id: body.gestionnaire.toString() } } } : {}),
        ...(body.adresse ? {
            adresse: {
                create: {
                    rue: body.adresse.rue || '',
                    numero: body.adresse.numero || '',
                    boite: body.adresse.boite || '',
                    codePostal: body.adresse.codePostal || '',
                    ville: body.adresse.ville || '',
                }
            }
        } : {}),
        ...(body.problematiques && body.problematiques.length > 0 ? {
            problematiques: {
                create: body.problematiques.map(p => ({
                    type: p.type,
                    description: p.description,
                }))
            }
        } : {}),
    };
}
