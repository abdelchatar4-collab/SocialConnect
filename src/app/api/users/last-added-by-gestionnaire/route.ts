/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect est un logiciel libre : vous pouvez le redistribuer et/ou le modifier selon les termes de la Licence Publique Générale GNU telle que publiée par la Free Software Foundation, soit la version 3 de la licence, soit (à votre convenance) toute version ultérieure.
*/

import { NextResponse } from 'next/server';
import { getServiceClient } from '@/lib/prisma-clients';
import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/authOptions';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const serviceId = (session.user as any).serviceId || 'default';
  const prisma = getServiceClient(serviceId);
  const gestionnaireId = request.nextUrl.searchParams.get('gestionnaireId');

  if (!gestionnaireId) return NextResponse.json({ error: 'ID du gestionnaire requis' }, { status: 400 });

  try {
    const lastUser = await prisma.user.findFirst({
      where: { gestionnaireId },
      orderBy: { dateOuverture: 'desc' },
      include: { adresse: true }
    });
    return NextResponse.json(lastUser);
  } catch (error) {
    return NextResponse.json({ error: 'Erreur interne' }, { status: 500 });
  }
}
