/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect est un logiciel libre : vous pouvez le redistribuer et/ou le modifier selon les termes de la Licence Publique Générale GNU telle que publiée par la Free Software Foundation, soit la version 3 de la licence, soit (à votre convenance) toute version ultérieure.
*/

import { NextResponse } from 'next/server';
import { getServiceClient } from '@/lib/prisma-clients';
import { getDynamicServiceId } from '@/lib/auth-utils';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/authOptions';
import { v4 as uuidv4 } from 'uuid';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const serviceId = await getDynamicServiceId(session);
  const prisma = getServiceClient(serviceId);
  const userRole = (session.user as any).role;
  const isAdmin = userRole === 'ADMIN' || userRole === 'SUPER_ADMIN';

  try {
    if (!isAdmin) {
      const gestionnaireId = (session.user as any).id;
      if (!gestionnaireId) return NextResponse.json([]);
      const self = await prisma.gestionnaire.findUnique({ where: { id: gestionnaireId } });
      return NextResponse.json(self ? [self] : []);
    }

    const gestionnaires = await prisma.gestionnaire.findMany({
      where: { isActive: true },
      orderBy: { nom: 'asc' }
    });
    return NextResponse.json(gestionnaires);
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const userRole = (session.user as any).role;
  if (userRole !== 'ADMIN' && userRole !== 'SUPER_ADMIN') {
    return NextResponse.json({ error: 'Accès non autorisé.' }, { status: 403 });
  }

  const serviceId = await getDynamicServiceId(session);
  const prisma = getServiceClient(serviceId);

  try {
    const body = await request.json();
    const { email, prenom, nom, role, couleurMedaillon, isGestionnaireDossier } = body;

    if (!prenom) return NextResponse.json({ error: 'Le prénom est obligatoire.' }, { status: 400 });

    if (email) {
      const existing = await prisma.gestionnaire.findFirst({ where: { email } });
      if (existing) return NextResponse.json({ error: 'Un gestionnaire avec cet email existe déjà.' }, { status: 409 });
    }

    const newGestionnaire = await prisma.gestionnaire.create({
      data: {
        id: uuidv4(),
        email: email || null,
        prenom,
        nom: nom || null,
        role: role?.toUpperCase() || 'USER',
        couleurMedaillon: couleurMedaillon || null,
        isActive: true,
        isGestionnaireDossier: isGestionnaireDossier ?? false
      }
    });

    return NextResponse.json(newGestionnaire, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Erreur serveur lors de la création.' }, { status: 500 });
  }
}
