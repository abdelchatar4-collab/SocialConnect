/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect est un logiciel libre : vous pouvez le redistribuer et/ou le modifier selon les termes de la Licence Publique Générale GNU telle que publiée par la Free Software Foundation, soit la version 3 de la licence, soit (à votre convenance) toute version ultérieure.

Ce programme est distribué dans l'espoir qu'il sera utile, mais SANS AUCUNE GARANTIE ; sans même la garantie implicite de COMMERCIALISATION ou d'ADÉQUATION À UN USAGE PARTICULIER. Voir la Licence Publique Générale GNU pour plus de détails.
*/

export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
// Assurez-vous que le chemin vers authOptions est correct, il est utilisé par getServerSession
import { authOptions } from "@/lib/authOptions";
import prisma from '@/lib/prisma';

// Définissez ou importez ce type si ce n'est pas déjà fait dans ce fichier
interface ExtendedSession {
  user?: {
    id?: string | null;
    name?: string | null;
    email?: string | null;
    role?: string | null;
    serviceId?: string | null;
  };
}

// --- GET /api/gestionnaires/[id] - Récupérer un gestionnaire ---
export async function GET(
  request: Request,
  context: { params: { id: string } }
) {
  const session = await getServerSession(authOptions) as ExtendedSession | null; // AJOUTÉ
  const { id } = context.params;

  // AJOUTÉ : Vérification des droits
  if (!session || !session.user || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
    return NextResponse.json({ message: "Accès non autorisé. Rôle ADMIN ou SUPER_ADMIN requis." }, { status: 403 });
  }

  try {
    // Get the current user's serviceId for multi-tenant filtering
    const currentServiceId = (session as any).user?.serviceId;

    // Récupérer le gestionnaire depuis la base de données
    const gestionnaire = await prisma.gestionnaire.findUnique({
      where: { id }
    });

    if (!gestionnaire) {
      return NextResponse.json({
        error: `Gestionnaire non trouvé`
      }, { status: 404 });
    }

    // Multi-tenant isolation: verify the gestionnaire belongs to the same service
    if (currentServiceId && gestionnaire.serviceId !== currentServiceId) {
      return NextResponse.json({
        error: `Accès non autorisé à ce gestionnaire`
      }, { status: 403 });
    }

    return NextResponse.json(gestionnaire);
  } catch (error) {
    console.error(`[API] Erreur GET /api/gestionnaires/${id}:`, error);
    return NextResponse.json({
      error: `Erreur lors de la récupération du gestionnaire: ${error instanceof Error ? error.message : 'Erreur inconnue'}`
    }, { status: 500 });
  }
}

// --- PUT /api/gestionnaires/[id] - Mettre à jour un gestionnaire ---
export async function PUT(
  request: Request,
  context: { params: { id: string } }
) {
  const session = await getServerSession(authOptions) as ExtendedSession | null;
  const gestionnaireId = context.params.id;

  if (!session || !session.user || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
    return NextResponse.json({ message: "Accès non autorisé. Rôle ADMIN ou SUPER_ADMIN requis." }, { status: 403 });
  }

  try {
    // Get the current user's serviceId for multi-tenant filtering
    const currentServiceId = (session as any).user?.serviceId;

    // First, check if the target gestionnaire belongs to the same service
    const existingGestionnaire = await prisma.gestionnaire.findUnique({
      where: { id: gestionnaireId },
      select: { serviceId: true }
    });

    if (!existingGestionnaire) {
      return NextResponse.json({ message: "Gestionnaire non trouvé." }, { status: 404 });
    }

    // Multi-tenant isolation: verify the gestionnaire belongs to the same service
    if (currentServiceId && existingGestionnaire.serviceId !== currentServiceId) {
      return NextResponse.json({ message: "Accès non autorisé à ce gestionnaire." }, { status: 403 });
    }

    const body = await request.json();
    // On ne récupère que les champs modifiables, y compris le rôle et la couleur
    const { email, prenom, nom, role, couleurMedaillon, isActive, isGestionnaireDossier } = body;

    const updateData: { email?: string; prenom?: string; nom?: string | null; role?: string; couleurMedaillon?: string | null; isActive?: boolean; isGestionnaireDossier?: boolean } = {};

    if (email !== undefined) updateData.email = (email && email.trim() !== "") ? email : null;
    if (prenom !== undefined) updateData.prenom = prenom;
    if (nom !== undefined) updateData.nom = nom; // Permet de mettre à null si nom est explicitement envoyé comme null
    if (couleurMedaillon !== undefined) updateData.couleurMedaillon = couleurMedaillon;
    if (isActive !== undefined) updateData.isActive = isActive;
    if (isGestionnaireDossier !== undefined) updateData.isGestionnaireDossier = isGestionnaireDossier;

    // Gérer la mise à jour du rôle
    if (role !== undefined) {
      const validRoles = ["USER", "ADMIN"];
      if (!validRoles.includes(role.toUpperCase())) {
        return NextResponse.json({ message: `Rôle invalide. Doit être USER ou ADMIN.` }, { status: 400 });
      }
      updateData.role = role.toUpperCase();
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ message: "Aucune donnée à mettre à jour." }, { status: 400 });
    }

    // Empêcher un admin de se retirer le rôle ADMIN si c'est son propre compte
    // et qu'il essaie de se mettre en USER.
    // Note: une logique plus complexe serait nécessaire pour "dernier admin".
    if (session.user.id === gestionnaireId && updateData.role && updateData.role !== "ADMIN") {
      const currentUser = await prisma.gestionnaire.findUnique({ where: { id: session.user.id } });
      if (currentUser?.role === "ADMIN") {
        return NextResponse.json({ message: "Vous ne pouvez pas retirer votre propre rôle ADMIN." }, { status: 403 });
      }
    }

    const gestionnaireModifie = await prisma.gestionnaire.update({
      where: { id: gestionnaireId },
      data: updateData,
    });
    return NextResponse.json(gestionnaireModifie);
  } catch (error: unknown) {
    console.error(`Erreur API PUT /gestionnaires/${gestionnaireId}:`, error);
    const prismaError = error as { code?: string; meta?: { target?: string[] } };
    if (prismaError.code === 'P2002' && prismaError.meta?.target?.includes('email')) {
      return NextResponse.json({ message: "Un autre gestionnaire utilise déjà cet email." }, { status: 409 });
    }
    if (prismaError.code === 'P2025') { // Record to update not found.
      return NextResponse.json({ message: "Gestionnaire non trouvé." }, { status: 404 });
    }
    return NextResponse.json({ message: "Erreur serveur lors de la mise à jour du gestionnaire." }, { status: 500 });
  }
}

// --- DELETE /api/gestionnaires/[id] - Supprimer un gestionnaire ---
export async function DELETE(
  request: Request,
  context: { params: { id: string } }
) {
  const session = await getServerSession(authOptions) as ExtendedSession | null; // AJOUTÉ
  const { id } = context.params;

  // AJOUTÉ : Vérification des droits
  if (!session || !session.user || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
    return NextResponse.json({ message: "Accès non autorisé. Rôle ADMIN ou SUPER_ADMIN requis." }, { status: 403 });
  }

  // AJOUTÉ : Empêcher un admin de supprimer son propre compte
  if (session.user.id === id) {
    return NextResponse.json({ message: "Vous ne pouvez pas supprimer votre propre compte administrateur." }, { status: 403 });
  }

  try {
    // Get the current user's serviceId for multi-tenant filtering
    const currentServiceId = (session as any).user?.serviceId;

    // First, check if the target gestionnaire belongs to the same service
    const existingGestionnaire = await prisma.gestionnaire.findUnique({
      where: { id },
      select: { serviceId: true }
    });

    if (!existingGestionnaire) {
      return NextResponse.json({ error: "Gestionnaire non trouvé." }, { status: 404 });
    }

    // Multi-tenant isolation: verify the gestionnaire belongs to the same service
    if (currentServiceId && existingGestionnaire.serviceId !== currentServiceId) {
      return NextResponse.json({ error: "Accès non autorisé à ce gestionnaire." }, { status: 403 });
    }

    // D'abord, mettre à jour tous les utilisateurs qui référencent ce gestionnaire
    const result = await prisma.user.updateMany({
      where: { gestionnaireId: id }, // Utiliser le champ de clé étrangère directement
      data: { gestionnaireId: null } // Mettre à null plutôt qu'à "Non assigné"
    });

    // Ensuite, supprimer le gestionnaire de la base de données
    await prisma.gestionnaire.delete({
      where: { id }
    });

    console.log(`[API] Suppression du gestionnaire ${id}: ${result.count} utilisateurs affectés`);

    return NextResponse.json({
      message: `Gestionnaire supprimé et ${result.count} utilisateurs mis à jour`
    });
  } catch (error) {
    console.error(`[API] Erreur DELETE /api/gestionnaires/${id}:`, error);
    // Gérer le cas où le gestionnaire n'existe pas (P2025)
    const prismaError = error as { code?: string };
    if (prismaError.code === 'P2025') {
      return NextResponse.json({ error: "Gestionnaire non trouvé." }, { status: 404 });
    }
    return NextResponse.json({
      error: `Erreur lors de la suppression du gestionnaire: ${error instanceof Error ? error.message : 'Erreur inconnue'}`
    }, { status: 500 });
  }
}
