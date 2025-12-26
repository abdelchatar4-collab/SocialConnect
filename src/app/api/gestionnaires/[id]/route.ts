/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect est un logiciel libre : vous pouvez le redistribuer et/ou le modifier selon les termes de la Licence Publique Générale GNU telle que publiée par la Free Software Foundation, soit la version 3 de la licence, soit (à votre convenance) toute version ultérieure.
*/

import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import { getServiceClient } from '@/lib/prisma-clients';
import { getDynamicServiceId } from '@/lib/auth-utils';

export const dynamic = 'force-dynamic';

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const serviceId = await getDynamicServiceId(session);
  const prisma = getServiceClient(serviceId);
  const { id } = params;

  try {
    const gestionnaire = await prisma.gestionnaire.findUnique({ where: { id } });
    if (!gestionnaire) return NextResponse.json({ error: 'Gestionnaire non trouvé' }, { status: 404 });
    return NextResponse.json(gestionnaire);
  } catch (error) {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const userRole = (session.user as any).role;
  if (userRole !== "ADMIN" && userRole !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Accès non autorisé." }, { status: 403 });
  }

  const serviceId = await getDynamicServiceId(session);
  const prisma = getServiceClient(serviceId);
  const gestionnaireId = params.id;

  try {
    const body = await request.json();
    const { email, prenom, nom, role, couleurMedaillon, isActive, isGestionnaireDossier } = body;

    const updateData: any = {};
    if (email !== undefined) updateData.email = email?.trim() || null;
    if (prenom !== undefined) updateData.prenom = prenom;
    if (nom !== undefined) updateData.nom = nom;
    if (couleurMedaillon !== undefined) updateData.couleurMedaillon = couleurMedaillon;
    if (isActive !== undefined) updateData.isActive = isActive;
    if (isGestionnaireDossier !== undefined) updateData.isGestionnaireDossier = isGestionnaireDossier;
    if (role !== undefined) updateData.role = role.toUpperCase();

    if (session.user.id === gestionnaireId && updateData.role && updateData.role !== "ADMIN") {
      return NextResponse.json({ error: "Vous ne pouvez pas retirer votre propre rôle ADMIN." }, { status: 403 });
    }

    const updated = await prisma.gestionnaire.update({
      where: { id: gestionnaireId },
      data: updateData,
    });
    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ error: "Erreur lors de la mise à jour." }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const userRole = (session.user as any).role;
  if (userRole !== "ADMIN" && userRole !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Accès non autorisé." }, { status: 403 });
  }

  const { id } = params;
  if ((session.user as any).id === id) {
    return NextResponse.json({ error: "Vous ne pouvez pas supprimer votre propre compte." }, { status: 403 });
  }

  const serviceId = await getDynamicServiceId(session);
  const prisma = getServiceClient(serviceId);

  try {
    // Le client isolé gérera l'isolation sur delete
    // Mais on doit d'abord détacher les usagers
    await prisma.user.updateMany({
      where: { gestionnaireId: id },
      data: { gestionnaireId: null }
    });

    await prisma.gestionnaire.delete({ where: { id } });
    return NextResponse.json({ message: "Gestionnaire supprimé" });
  } catch (error) {
    return NextResponse.json({ error: "Erreur lors de la suppression." }, { status: 500 });
  }
}
