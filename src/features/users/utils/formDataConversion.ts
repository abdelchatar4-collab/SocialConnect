/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect - User Form Data Conversion Utilities
Extracted from useUserFormLogic.ts for maintainability
*/

import { User, UserFormData } from '@/types';
import { defaultUserFormData } from '../constants/formDefaults';

/**
 * Converts User data to UserFormData format
 * Handles date formatting, nested objects, and data normalization
 */
export const convertUserToFormData = (initialData: Partial<User>): UserFormData => {
    const convertedData: UserFormData = {
        ...defaultUserFormData,
        nom: initialData.nom || '',
        prenom: initialData.prenom || '',
        genre: initialData.genre || '',
        telephone: initialData.telephone || '',
        email: initialData.email || '',
        statutSejour: initialData.statutSejour || '',
        gestionnaire: extractGestionnaireId(initialData.gestionnaire),
        nationalite: initialData.nationalite || '',
        trancheAge: initialData.trancheAge || '',
        remarques: initialData.remarques || '',
        secteur: initialData.secteur || '',
        langue: initialData.langue || '',
        premierContact: initialData.premierContact || '',
        notesGenerales: initialData.notesGenerales || '',
        informationImportante: initialData.informationImportante || '',
        etat: initialData.etat || 'Ouvert',
        antenne: initialData.antenne || '',
        situationProfessionnelle: initialData.situationProfessionnelle || '',
        revenus: initialData.revenus || '',
        hasPrevExp: initialData.hasPrevExp || false,
        prevExpMotifRequete: initialData.prevExpMotifRequete || '',
        prevExpDecision: initialData.prevExpDecision || '',
        prevExpDemandeCpas: initialData.prevExpDemandeCpas || '',
        prevExpNegociationProprio: initialData.prevExpNegociationProprio || '',
        prevExpSolutionRelogement: initialData.prevExpSolutionRelogement || '',
        prevExpMaintienLogement: initialData.prevExpMaintienLogement || '',
        prevExpTypeFamille: initialData.prevExpTypeFamille || '',
        prevExpTypeRevenu: initialData.prevExpTypeRevenu || '',
        prevExpEtatLogement: initialData.prevExpEtatLogement || '',
        prevExpNombreChambre: initialData.prevExpNombreChambre || '',
        prevExpAideJuridique: initialData.prevExpAideJuridique || '',
        partenaire: normalizePartenaire(initialData.partenaire),
        dateNaissance: formatDateField(initialData.dateNaissance),
        dateOuverture: formatDateField(initialData.dateOuverture) || new Date().toISOString().split('T')[0],
        dateCloture: formatDateField(initialData.dateCloture),
        mediationType: initialData.mediationType || '',
        mediationDemandeur: initialData.mediationDemandeur || '',
        mediationPartieAdverse: initialData.mediationPartieAdverse || '',
        mediationStatut: initialData.mediationStatut || '',
        mediationDescription: initialData.mediationDescription || '',
        id: initialData.id,
        rgpdAttestationGeneratedAt: initialData.rgpdAttestationGeneratedAt || null,
        prevExpDateReception: formatDateField(initialData.prevExpDateReception),
        prevExpDateRequete: formatDateField(initialData.prevExpDateRequete),
        prevExpDateVad: formatDateField(initialData.prevExpDateVad),
        prevExpDateAudience: formatDateField(initialData.prevExpDateAudience),
        prevExpDateSignification: formatDateField(initialData.prevExpDateSignification),
        prevExpDateJugement: formatDateField(initialData.prevExpDateJugement),
        prevExpDateExpulsion: formatDateField(initialData.prevExpDateExpulsion),
        createdBy: (initialData as any).createdBy || null,
        createdAt: (initialData as any).createdAt || null,
        updatedBy: (initialData as any).updatedBy || null,
        updatedAt: (initialData as any).updatedAt || null,
    };

    // Convert address
    if (initialData.adresse) {
        convertedData.adresse = {
            rue: initialData.adresse.rue || '',
            numero: initialData.adresse.numero || '',
            boite: initialData.adresse.boite || '',
            codePostal: initialData.adresse.codePostal || '',
            ville: initialData.adresse.ville || (initialData.adresse as any).commune || '',
            quartier: initialData.adresse.quartier || '',
            pays: initialData.adresse.pays || '',
            secteur: initialData.adresse.secteur || ''
        };
    }

    // Convert logement details
    const logementSource = (initialData as any).logement || (initialData as any).logementDetails;
    if (logementSource) {
        convertedData.logementDetails = {
            ...defaultUserFormData.logementDetails,
            type: logementSource.type || '',
            statut: logementSource.statut || '',
            nombrePieces: logementSource.nombrePieces || 0,
            bailleur: logementSource.bailleur || '',
            commentaires: logementSource.commentaires || '',
            typeLogement: logementSource.typeLogement || '',
            dateEntree: logementSource.dateEntree || '',
            dateSortie: logementSource.dateSortie || '',
            motifSortie: logementSource.motifSortie || '',
            destinationSortie: logementSource.destinationSortie || '',
            proprietaire: logementSource.proprietaire || '',
            loyer: logementSource.loyer || '',
            charges: logementSource.charges || '',
            commentaire: logementSource.commentaire || '',
            hasLitige: logementSource.hasLitige || false,
            bailEnregistre: logementSource.bailEnregistre || '',
            dateContrat: logementSource.dateContrat || '',
            dureeContrat: logementSource.dureeContrat || '',
            garantieLocative: logementSource.garantieLocative || '',
            statutGarantie: logementSource.statutGarantie || '',
            typeLitige: logementSource.typeLitige || '',
            dateLitige: logementSource.dateLitige || '',
            descriptionLitige: logementSource.descriptionLitige || '',
            actionsPrises: logementSource.actionsPrises || '',
            datePreavis: logementSource.datePreavis || '',
            dureePreavis: logementSource.dureePreavis || '',
            preavisPour: logementSource.preavisPour || '',
        };
    }

    // Convert problematiques
    if (initialData.problematiques && Array.isArray(initialData.problematiques)) {
        convertedData.problematiques = initialData.problematiques.map(p => ({
            id: p.id,
            type: p.type || '',
            description: p.description || p.detail || '',
            dateSignalement: p.dateSignalement || new Date().toISOString(),
            detail: p.detail || '',
        }));
    }

    convertedData.problematiquesDetails = initialData.problematiquesDetails || '';

    // Convert actions
    if (initialData.actions && Array.isArray(initialData.actions)) {
        convertedData.actions = initialData.actions.map(a => ({
            description: a.description || '',
            date: a.date || '',
            fait: (a as any).fait || false,
            type: a.type || '',
            partenaire: a.partenaire || '',
        }));
    }

    return convertedData;
};

// Helper functions
function extractGestionnaireId(gestionnaire: any): string {
    if (!gestionnaire) return '';
    if (typeof gestionnaire === 'string') return gestionnaire;
    if (typeof gestionnaire === 'object' && gestionnaire?.id) return gestionnaire.id;
    if (typeof gestionnaire === 'object' && gestionnaire?.prenom) return gestionnaire.prenom;
    return '';
}

function formatDateField(date: string | Date | null | undefined): string {
    if (!date) return '';
    if (typeof date === 'string') return date.split('T')[0];
    return date.toISOString().split('T')[0];
}

function normalizePartenaire(partenaire: any): Array<{ id: string; nom: string }> {
    if (Array.isArray(partenaire)) {
        return partenaire.map((p: any) => typeof p === 'string' ? { id: p, nom: p } : p);
    }
    if (partenaire) {
        return [typeof partenaire === 'string' ? { id: partenaire, nom: partenaire } : partenaire];
    }
    return [];
}
