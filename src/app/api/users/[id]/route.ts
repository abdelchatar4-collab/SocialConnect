/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect est un logiciel libre : vous pouvez le redistribuer et/ou le modifier selon les termes de la Licence Publique Générale GNU.
*/

export const dynamic = 'force-dynamic';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/authOptions';
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { Prisma } from '@prisma/client';

// Imports des modules extraits
import { UpdateUserRequestBody, ActionInput } from './user-api.types';
import {
  parseDateString,
  isValidUUID,
  detectProblematiquesFromNotes,
  handleApiError
} from './user-api.helpers';

// --- Fonction GET ---
export async function GET(
  request: NextRequest,
  context: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const { id } = context.params;

  try {
    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        adresse: true,
        problematiques: true,
        actions: true,
        gestionnaire: true,
      }
    });

    if (!user) {
      return NextResponse.json({ error: 'Utilisateur non trouvé' }, { status: 404 });
    }

    // Détection automatique des problématiques si aucune
    if (!user.problematiques || user.problematiques.length === 0) {
      const notes = user.notesGenerales || user.remarques || "";
      user.problematiques = detectProblematiquesFromNotes(user.id, notes);
    }

    // Parse logementDetails si c'est une chaîne JSON
    if (user.logementDetails && typeof user.logementDetails === 'string') {
      try {
        user.logementDetails = JSON.parse(user.logementDetails);
      } catch {
        user.logementDetails = '';
      }
    }

    return NextResponse.json(user);
  } catch (error) {
    return handleApiError(error);
  }
}

// --- Fonction PATCH (mise à jour RGPD) ---
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const updatedUser = await prisma.user.update({
      where: { id: params.id },
      data: { rgpdAttestationGeneratedAt: new Date() },
      select: { id: true, nom: true, prenom: true, rgpdAttestationGeneratedAt: true },
    });
    return NextResponse.json(updatedUser);
  } catch (error) {
    return handleApiError(error);
  }
}

// --- Fonction PUT ---
export async function PUT(
  request: NextRequest,
  context: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const { id } = context.params;

  try {
    // Vérifier que l'utilisateur existe
    const existingUser = await prisma.user.findUnique({ where: { id } });
    if (!existingUser) {
      return NextResponse.json({ error: `Utilisateur ${id} non trouvé.` }, { status: 404 });
    }

    const body = await request.json() as UpdateUserRequestBody;

    // --- GESTION DES PROBLÉMATIQUES ---
    await handleProblematiques(id, body.problematiques);

    // --- GESTION DES ACTIONS ---
    await handleActions(id, body.actions);

    // --- MISE À JOUR USER ---
    const dataToUpdate = buildUserUpdateData(body, session);
    const updatedUser = await prisma.user.update({
      where: { id },
      data: dataToUpdate,
      include: { adresse: true, problematiques: true, actions: true },
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    return handleApiError(error);
  }
}

// --- Fonction DELETE ---
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Accès non autorisé.' }, { status: 401 });
  }

  const userRole = (session.user as { role?: string } | undefined)?.role;
  const userId = params.id;

  try {
    const userToDelete = await prisma.user.findUnique({ where: { id: userId } });
    if (!userToDelete) {
      return NextResponse.json({ error: "L'utilisateur n'existe pas." }, { status: 404 });
    }

    // Admins peuvent supprimer n'importe qui
    if (userRole !== 'ADMIN') {
      // Pour les non-admins, vérifier si c'est un doublon
      if (!userToDelete.nom || !userToDelete.prenom || !userToDelete.dateNaissance) {
        return NextResponse.json({ error: 'Données manquantes pour vérifier les doublons.' }, { status: 400 });
      }

      const duplicates = await prisma.user.findMany({
        where: {
          nom: userToDelete.nom,
          prenom: userToDelete.prenom,
          dateNaissance: userToDelete.dateNaissance,
          id: { not: userId },
        },
      });

      if (duplicates.length === 0) {
        return NextResponse.json({ error: 'Seuls les doublons peuvent être supprimés.' }, { status: 403 });
      }
    }

    await prisma.user.delete({ where: { id: userId } });
    return NextResponse.json({ message: 'Utilisateur supprimé avec succès' });
  } catch (error) {
    return handleApiError(error);
  }
}

// ============================================
// FONCTIONS UTILITAIRES PRIVÉES
// ============================================

async function handleProblematiques(userId: string, problematiques?: UpdateUserRequestBody['problematiques']) {
  if (!problematiques) return;

  const existingIds = (await prisma.problematique.findMany({
    where: { userId },
    select: { id: true }
  })).map(p => p.id);

  const toUpdate = problematiques.filter(p => p.id && existingIds.includes(p.id));
  const toCreate = problematiques.filter(p => !p.id || !existingIds.includes(p.id));
  const toDelete = existingIds.filter(id => !problematiques.some(p => p.id === id));

  for (const p of toUpdate) {
    await prisma.problematique.update({
      where: { id: p.id },
      data: {
        type: p.type,
        description: p.description,
        dateSignalement: p.dateSignalement ? new Date(p.dateSignalement) : new Date(),
      }
    });
  }

  for (const p of toCreate) {
    await prisma.problematique.create({
      data: {
        type: p.type,
        description: p.description,
        dateSignalement: p.dateSignalement ? new Date(p.dateSignalement) : new Date(),
        userId,
      }
    });
  }

  for (const id of toDelete) {
    await prisma.problematique.delete({ where: { id } });
  }
}

async function handleActions(userId: string, actions?: ActionInput[]) {
  if (!actions) return;

  const existingIds = (await prisma.actionSuivi.findMany({
    where: { userId },
    select: { id: true }
  })).map(a => a.id);

  const toUpdate = actions.filter(a => a.id && isValidUUID(a.id) && existingIds.includes(a.id));
  const toCreate = actions.filter(a => !a.id || !isValidUUID(a.id));
  const toDelete = existingIds.filter(id => !actions.some(a => a.id === id));

  for (const a of toUpdate) {
    await prisma.actionSuivi.update({
      where: { id: a.id },
      data: {
        date: a.date ? new Date(a.date) : new Date(),
        type: a.type,
        partenaire: a.partenaire,
        description: a.description,
      }
    });
  }

  for (const a of toCreate) {
    await prisma.actionSuivi.create({
      data: {
        date: a.date ? new Date(a.date) : new Date(),
        type: a.type,
        partenaire: a.partenaire,
        description: a.description,
        userId,
      }
    });
  }

  for (const id of toDelete) {
    await prisma.actionSuivi.delete({ where: { id } });
  }
}

function buildUserUpdateData(body: UpdateUserRequestBody, session: any): Prisma.UserUpdateInput {
  return {
    updatedBy: session.user?.name || session.user?.email || null,
    nom: body.nom,
    prenom: body.prenom,
    dateNaissance: parseDateString(body.dateNaissance) ?? undefined,
    genre: body.genre,
    telephone: body.telephone,
    email: body.email,
    dateOuverture: parseDateString(body.dateOuverture) ?? undefined,
    dateCloture: parseDateString(body.dateCloture) ?? undefined,
    etat: body.etat,
    antenne: body.antenne,
    statutSejour: body.statutSejour,
    gestionnaire: body.gestionnaire
      ? { connect: { id: body.gestionnaire } }
      : { disconnect: true },
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
    donneesConfidentielles: body.donneesConfidentielles,
    partenaire: body.partenaire,
    hasPrevExp: body.hasPrevExp,
    prevExpDateReception: parseDateString(body.prevExpDateReception) ?? undefined,
    prevExpDateRequete: parseDateString(body.prevExpDateRequete) ?? undefined,
    prevExpDateVad: parseDateString(body.prevExpDateVad) ?? undefined,
    prevExpDateAudience: parseDateString(body.prevExpDateAudience) ?? undefined,
    prevExpDateSignification: parseDateString(body.prevExpDateSignification) ?? undefined,
    prevExpDateJugement: parseDateString(body.prevExpDateJugement) ?? undefined,
    prevExpDateExpulsion: parseDateString(body.prevExpDateExpulsion) ?? undefined,
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
    adresse: body.adresse ? {
      upsert: {
        create: {
          rue: body.adresse.rue || '',
          numero: body.adresse.numero || '',
          boite: body.adresse.boite || '',
          codePostal: body.adresse.codePostal || '',
          ville: body.adresse.ville || '',
        },
        update: {
          rue: body.adresse.rue || '',
          numero: body.adresse.numero || '',
          boite: body.adresse.boite || '',
          codePostal: body.adresse.codePostal || '',
          ville: body.adresse.ville || '',
        }
      }
    } : undefined,
  };
}
