/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect est un logiciel libre : vous pouvez le redistribuer et/ou le modifier selon les termes de la Licence Publique Générale GNU telle que publiée par la Free Software Foundation, soit la version 3 de la licence, soit (à votre convenance) toute version ultérieure.

Ce programme est distribué dans l'espoir qu'il sera utile, mais SANS AUCUNE GARANTIE ; sans même la garantie implicite de COMMERCIALISATION ou d'ADÉQUATION À UN USAGE PARTICULIER. Voir la Licence Publique Générale GNU pour plus de détails.
*/

import { NextRequest, NextResponse } from 'next/server';
import { getServiceClient } from '@/lib/prisma-clients';
import { getDynamicServiceId } from '@/lib/auth-utils';
import { Prisma } from '@prisma/client';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/authOptions';
import { CreateUserRequestBody } from '@/types/api/userApi';
import { mapToUserCreateInput } from '@/lib/api/userApiUtils';

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const serviceId = await getDynamicServiceId(session);
  const prisma = getServiceClient(serviceId);

  try {
    const { searchParams } = new URL(request.url);
    const anneeParam = searchParams.get('annee');
    const whereClause: Prisma.UserWhereInput = anneeParam ? { annee: parseInt(anneeParam, 10) } : {};

    const users = await prisma.user.findMany({
      where: whereClause,
      include: { adresse: true, problematiques: true, actions: true, gestionnaire: true }
    });

    return NextResponse.json(users);
  } catch (error: unknown) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Erreur inconnue' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const serviceId = await getDynamicServiceId(session);
  const prisma = getServiceClient(serviceId);

  try {
    const body = await request.json() as CreateUserRequestBody & { annee?: number; dossierPrecedentId?: string };
    const finalPayload = mapToUserCreateInput(body, session.user, serviceId);

    const newUser = await prisma.user.create({
      data: finalPayload,
      include: { adresse: true, problematiques: true, actions: true },
    });

    return NextResponse.json(newUser, { status: 201 });
  } catch (error: unknown) {
    console.error("[API POST /api/users] Erreur:", error);
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      return NextResponse.json({ error: "Une valeur unique existe déjà." }, { status: 409 });
    }
    return NextResponse.json({ error: error instanceof Error ? error.message : "Erreur interne" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const serviceId = await getDynamicServiceId(session);
  const prisma = getServiceClient(serviceId);
  const userRole = (session.user as any).role;

  try {
    const { ids } = await request.json();
    if (!Array.isArray(ids) || ids.length === 0) return NextResponse.json({ error: 'IDs invalides' }, { status: 400 });

    if (userRole === 'ADMIN' || userRole === 'SUPER_ADMIN') {
      const { count } = await prisma.user.deleteMany({ where: { id: { in: ids } } });
      return NextResponse.json({ message: `${count} utilisateur(s) supprimé(s).` });
    }

    // Role non-admin : Seulement les doublons
    const usersToDelete = await prisma.user.findMany({ where: { id: { in: ids } } });
    const deletableIds: string[] = [];

    for (const user of usersToDelete) {
      if (!user.nom || !user.prenom || !user.dateNaissance) continue;
      const duplicates = await prisma.user.findMany({
        where: { nom: user.nom, prenom: user.prenom, dateNaissance: user.dateNaissance, id: { not: user.id } }
      });
      if (duplicates.length > 0) deletableIds.push(user.id);
    }

    if (deletableIds.length > 0) {
      const { count } = await prisma.user.deleteMany({ where: { id: { in: deletableIds } } });
      return NextResponse.json({ message: `${count} doublon(s) supprimé(s).` });
    }

    return NextResponse.json({ error: "Aucun doublon trouvé." }, { status: 403 });
  } catch (error: unknown) {
    return NextResponse.json({ error: "Erreur lors de la suppression." }, { status: 500 });
  }
}
