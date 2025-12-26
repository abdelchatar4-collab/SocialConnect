/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect est un logiciel libre : vous pouvez le redistribuer et/ou le modifier selon les termes de la Licence Publique Générale GNU telle que publiée par la Free Software Foundation, soit la version 3 de la licence, soit (à votre convenance) toute version ultérieure.

Ce programme est distribué dans l'espoir qu'il sera utile, mais SANS AUCUNE GARANTIE ; sans même la garantie implicite de COMMERCIALISATION ou d'ADÉQUATION À UN USAGE PARTICULIER. Voir la Licence Publique Générale GNU pour plus de détails.
*/

import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/authOptions';

export async function GET() {
  // SECURITY: Only allow in development OR for SUPER_ADMIN
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const userRole = (session.user as any).role;
  const isDev = process.env.NODE_ENV === 'development';

  if (!isDev && userRole !== 'SUPER_ADMIN') {
    return NextResponse.json({ error: 'Debug route disabled in production' }, { status: 403 });
  }

  // Multi-tenant: only show data from current service
  const serviceId = (session.user as any).serviceId || 'default';

  try {
    // Only show partenaires from current service
    const partenaires = await prisma.dropdownOption.findMany({
      where: {
        type: 'partenaire',
        serviceId: serviceId
      }
    });

    return NextResponse.json({
      message: 'Debug des options partenaires',
      serviceId: serviceId,
      count: partenaires.length,
      data: partenaires
    });
  } catch (error) {
    console.error('Erreur debug:', error);
    const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

