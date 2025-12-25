/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect - Core Import Logic
*/

import prisma from '@/lib/prisma';
import { determineSecteur } from '@/utils/secteurUtils';
import { sanitizeStringField, findGestionnaireId } from './importUtils';

export async function importSingleUser(userData: any, targetYear: number, allGest: any[]) {
    const email = sanitizeStringField(userData.email);
    if (email) {
        const existing = await prisma.user.findFirst({ where: { email } });
        if (existing) throw new Error(`Doublon email: ${email}`);
    }

    let adrId = null;
    if (userData.adresse && Object.values(userData.adresse).some(v => v)) {
        const adr = await prisma.adresse.create({
            data: {
                rue: userData.adresse.rue, numero: userData.adresse.numero, boite: userData.adresse.boite,
                codePostal: userData.adresse.codePostal, ville: userData.adresse.ville, pays: userData.adresse.pays,
            }
        });
        adrId = adr.id;
    }

    const gestId = findGestionnaireId(userData.gestionnaire, allGest);

    const user = await prisma.user.create({
        data: {
            id: userData.id, annee: userData.annee || targetYear,
            nom: sanitizeStringField(userData.nom) || 'N/A', prenom: sanitizeStringField(userData.prenom) || 'N/A',
            dateNaissance: userData.dateNaissance ? new Date(userData.dateNaissance) : null,
            genre: sanitizeStringField(userData.genre), telephone: sanitizeStringField(userData.telephone), email,
            dateOuverture: userData.dateOuverture ? new Date(userData.dateOuverture) : new Date(),
            dateCloture: userData.dateCloture ? new Date(userData.dateCloture) : null,
            etat: sanitizeStringField(userData.etat) || undefined,
            antenne: sanitizeStringField(userData.antenne) || undefined,
            statutSejour: sanitizeStringField(userData.statutSejour) || undefined,
            nationalite: sanitizeStringField(userData.nationalite), trancheAge: sanitizeStringField(userData.trancheAge),
            remarques: sanitizeStringField(userData.remarques), langue: sanitizeStringField(userData.langue),
            premierContact: sanitizeStringField(userData.premierContact), notesGenerales: sanitizeStringField(userData.notesGenerales),
            logementDetails: userData.logementDetails, hasPrevExp: !!userData.hasPrevExp,
            prevExpDateReception: userData.prevExpDateReception ? new Date(userData.prevExpDateReception) : null,
            prevExpDateRequete: userData.prevExpDateRequete ? new Date(userData.prevExpDateRequete) : null,
            prevExpDateVad: userData.prevExpDateVad ? new Date(userData.prevExpDateVad) : null,
            prevExpDecision: sanitizeStringField(userData.prevExpDecision), prevExpCommentaire: sanitizeStringField(userData.prevExpCommentaire),
            ...(adrId && { adresse: { connect: { id: adrId } } }),
            ...(gestId && { gestionnaire: { connect: { id: gestId } } }),
        },
        include: { adresse: true }
    });

    if (user.adresse) {
        const sec = determineSecteur(user.adresse);
        if (sec && sec !== "Non spécifié") await prisma.user.update({ where: { id: user.id }, data: { secteur: sec } });
    }

    if (userData.problematiques?.length) {
        const probs = userData.problematiques
            .map((p: any) => ({ type: sanitizeStringField(p.type), description: sanitizeStringField(p.description), detail: sanitizeStringField(p.detail), userId: user.id }))
            .filter((p: any) => p.type && p.description);
        if (probs.length) await prisma.problematique.createMany({ data: probs, skipDuplicates: true });
    }

    if (userData.actions?.length) {
        const acts = userData.actions
            .map((a: any) => ({ date: a.date ? new Date(a.date) : new Date(), type: sanitizeStringField(a.type), description: sanitizeStringField(a.description), partenaire: sanitizeStringField(a.partenaire), userId: user.id }))
            .filter((a: any) => a.type && a.description);
        if (acts.length) await prisma.actionSuivi.createMany({ data: acts, skipDuplicates: true });
    }

    return user;
}
