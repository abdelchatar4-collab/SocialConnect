/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect est un logiciel libre : vous pouvez le redistribuer et/ou le modifier selon les termes de la Licence Publique Générale GNU telle que publiée par la Free Software Foundation, soit la version 3 de la licence, soit (à votre convenance) toute version ultérieure.

Ce programme est distribué dans l'espoir qu'il sera utile, mais SANS AUCUNE GARANTIE ; sans même la garantie implicite de COMMERCIALISATION ou d'ADÉQUATION À UN USAGE PARTICULIER. Voir la Licence Publique Générale GNU pour plus de détails.
*/

import { NextRequest, NextResponse } from 'next/server';
import { getServiceClient } from '@/lib/prisma-clients';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/authOptions';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const serviceId = (session.user as any).serviceId || 'default';
  const prisma = getServiceClient(serviceId);

  try {
    const { searchParams } = new URL(request.url);
    const anneeParam = searchParams.get('annee');

    const where: any = {};
    if (anneeParam) {
      const annee = parseInt(anneeParam, 10);
      if (!isNaN(annee)) {
        where.annee = annee;
      }
    }

    const nationalityStats = await prisma.user.groupBy({
      by: ['nationalite'],
      where,
      _count: {
        id: true
      },
      orderBy: {
        _count: {
          id: 'desc'
        }
      }
    });

    // Formater les données pour le frontend
    const formattedStats = nationalityStats.map(group => ({
      name: group.nationalite || 'Non spécifié',
      value: group._count.id
    }));

    return NextResponse.json(formattedStats);
  } catch (error) {
    console.error('Erreur lors de la récupération des statistiques par nationalité:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des données' },
      { status: 500 }
    );
  }
}
