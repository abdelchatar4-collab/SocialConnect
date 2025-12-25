/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect - User Update Data Mapper
*/

import { Prisma } from '@prisma/client';
import { parseDateString } from './user-api.helpers';

export function buildUserUpdateData(body: any, session: any): Prisma.UserUpdateInput {
    const d = (s: any) => parseDateString(s) ?? undefined;
    return {
        updatedBy: session.user?.name || session.user?.email || null,
        nom: body.nom, prenom: body.prenom, dateNaissance: d(body.dateNaissance),
        genre: body.genre, telephone: body.telephone, email: body.email,
        dateOuverture: d(body.dateOuverture), dateCloture: d(body.dateCloture),
        etat: body.etat, antenne: body.antenne, statutSejour: body.statutSejour,
        gestionnaire: body.gestionnaire ? { connect: { id: body.gestionnaire } } : { disconnect: true },
        nationalite: body.nationalite, trancheAge: body.trancheAge, remarques: body.remarques,
        secteur: body.secteur, langue: body.langue, situationProfessionnelle: body.situationProfessionnelle,
        revenus: body.revenus, premierContact: body.premierContact, notesGenerales: body.notesGenerales,
        problematiquesDetails: body.problematiquesDetails, informationImportante: body.informationImportante,
        donneesConfidentielles: body.donneesConfidentielles, partenaire: body.partenaire,
        hasPrevExp: body.hasPrevExp, prevExpDateReception: d(body.prevExpDateReception),
        prevExpDateRequete: d(body.prevExpDateRequete), prevExpDateVad: d(body.prevExpDateVad),
        prevExpDateAudience: d(body.prevExpDateAudience), prevExpDateSignification: d(body.prevExpDateSignification),
        prevExpDateJugement: d(body.prevExpDateJugement), prevExpDateExpulsion: d(body.prevExpDateExpulsion),
        prevExpDossierOuvert: body.prevExpDossierOuvert, prevExpDecision: body.prevExpDecision,
        prevExpCommentaire: body.prevExpCommentaire, prevExpDemandeCpas: body.prevExpDemandeCpas,
        prevExpNegociationProprio: body.prevExpNegociationProprio, prevExpSolutionRelogement: body.prevExpSolutionRelogement,
        prevExpMaintienLogement: body.prevExpMaintienLogement, prevExpTypeFamille: body.prevExpTypeFamille,
        prevExpTypeRevenu: body.prevExpTypeRevenu, prevExpEtatLogement: body.prevExpEtatLogement,
        prevExpNombreChambre: body.prevExpNombreChambre, prevExpAideJuridique: body.prevExpAideJuridique,
        prevExpMotifRequete: body.prevExpMotifRequete,
        logementDetails: body.logementDetails ? JSON.stringify(body.logementDetails) : null,
        adresse: body.adresse ? { upsert: { create: { rue: body.adresse.rue || '', numero: body.adresse.numero || '', boite: body.adresse.boite || '', codePostal: body.adresse.codePostal || '', ville: body.adresse.ville || '' }, update: { rue: body.adresse.rue || '', numero: body.adresse.numero || '', boite: body.adresse.boite || '', codePostal: body.adresse.codePostal || '', ville: body.adresse.ville || '' } } } : undefined,
    };
}
