/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect est un logiciel libre : vous pouvez le redistribuer et/ou le modifier selon les termes de la Licence Publique Générale GNU telle que publiée par la Free Software Foundation, soit la version 3 de la licence, soit (à votre convenance) toute version ultérieure.
*/

import { NextResponse } from 'next/server';
import { getServiceClient } from '@/lib/prisma-clients';
import { getServerSession } from 'next-auth/next';
import { getDynamicServiceId } from '@/lib/auth-utils';
import { authOptions } from '@/lib/authOptions';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const userRole = (session.user as any).role;
  const isDev = process.env.NODE_ENV === 'development';
  if (!isDev && userRole !== 'SUPER_ADMIN') return NextResponse.json({ error: 'Debug route disabled' }, { status: 403 });

  const serviceId = await getDynamicServiceId(session);
  const prisma = getServiceClient(serviceId);

  try {
    const partenaires = await prisma.dropdownOption.findMany({ where: { type: 'partenaire' } });
    return NextResponse.json({
      message: 'Debug des options partenaires',
      serviceId,
      count: partenaires.length,
      data: partenaires
    });
  } catch (error) {
    return NextResponse.json({ error: 'Erreur debug' }, { status: 500 });
  }
}
