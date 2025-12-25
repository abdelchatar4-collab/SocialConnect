/**
 * Helpers pour l'API Users [id]
 */

import { NextResponse } from 'next/server';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

import { normalizeToISODate } from '@/utils/dateUtils';

// Parse une date string en Date ou null
// Utilise la normalisation robuste pour supporter le format français DD/MM/YYYY et autres
export function parseDateString(dateString: string | null | undefined): Date | null {
    if (!dateString) return null;

    // Normaliser d'abord (supporte DD/MM/YYYY, DDMMYYYY, ISO, etc.)
    const normalized = normalizeToISODate(dateString);
    if (!normalized) return null;

    const date = new Date(normalized);
    return isNaN(date.getTime()) ? null : date;
}

// Vérifie si un UUID est valide (v4)
export function isValidUUID(uuid: string): boolean {
    return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(uuid);
}

// Normalise une chaîne pour la recherche (sans accents, lowercase)
export function normalize(str: string): string {
    return str
        .toLowerCase()
        .normalize("NFD")
        .replace(/\p{Diacritic}/gu, "")
        .replace(/['']/g, "'");
}

// Mots-clés pour la détection automatique de problématiques
export const PROBLEMATIQUE_KEYWORDS = [
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

// Gestion centralisée des erreurs API
export function handleApiError(error: unknown): NextResponse {
    console.error('API Error:', error);

    if (error instanceof PrismaClientKnownRequestError) {
        switch (error.code) {
            case 'P2002':
                return NextResponse.json(
                    { error: 'Cette valeur existe déjà' },
                    { status: 409 }
                );
            case 'P2025':
                return NextResponse.json(
                    { error: 'Ressource non trouvée' },
                    { status: 404 }
                );
            default:
                return NextResponse.json(
                    { error: `Erreur de base de données: ${error.message}` },
                    { status: 400 }
                );
        }
    }

    const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
    return NextResponse.json(
        { error: `Erreur interne: ${errorMessage}` },
        { status: 500 }
    );
}

// Détecte les problématiques automatiquement depuis les notes
export function detectProblematiquesFromNotes(
    userId: string,
    notes: string
): Array<{
    id: string;
    type: string;
    detail: null;
    userId: string;
    description: string;
    dateSignalement: null;
}> {
    const normalizedNotes = normalize(notes);
    const detected: Array<{
        id: string;
        type: string;
        detail: null;
        userId: string;
        description: string;
        dateSignalement: null;
    }> = [];

    PROBLEMATIQUE_KEYWORDS.forEach(({ type, mots }) => {
        for (const mot of mots) {
            const regex = mot.length <= 3
                ? new RegExp(`\\b${mot}\\b`, 'i')
                : new RegExp(`\\b${mot}\\w*`, 'i');

            if (regex.test(normalizedNotes)) {
                detected.push({
                    id: `auto-${userId}-${type}`,
                    type,
                    detail: null,
                    userId,
                    description: "Ajouté automatiquement depuis les notes",
                    dateSignalement: null
                });
                break;
            }
        }
    });

    return detected;
}
