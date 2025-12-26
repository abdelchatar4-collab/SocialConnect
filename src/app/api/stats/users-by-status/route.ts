/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect est un logiciel libre : vous pouvez le redistribuer et/ou le modifier selon les termes de la Licence Publique Générale GNU telle que publiée par la Free Software Foundation, soit la version 3 de la licence, soit (à votre convenance) toute version ultérieure.

Ce programme est distribué dans l'espoir qu'il sera utile, mais SANS AUCUNE GARANTIE ; sans même la garantie implicite de COMMERCIALISATION ou d'ADÉQUATION À UN USAGE PARTICULIER. Voir la Licence Publique Générale GNU pour plus de détails.
*/

import { NextRequest, NextResponse } from 'next/server';
import { getServiceClient } from '@/lib/prisma-clients';
import { getDynamicServiceId } from '@/lib/auth-utils';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/authOptions';

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const serviceId = await getDynamicServiceId(session);
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

    const stats = await prisma.user.groupBy({
      by: ['etat'],
      where, // On ajoute le filtrage par année ici
      _count: {
        id: true,
      },
      orderBy: {
        _count: {
          id: 'desc',
        },
      },
    });

    // Transformer les données pour le format attendu (ex: { name: etat, value: count })
    const formattedStats = stats.map(stat => ({
      name: stat.etat ?? 'Non défini', // Gérer le cas où etat pourrait être null
      value: stat._count.id, // Utiliser le champ compté (ici 'id')
    }));

    return NextResponse.json(formattedStats);

  } catch (error) {
    console.error("Erreur lors de la récupération des stats par statut:", error);
    // Renvoyer une réponse d'erreur générique
    return NextResponse.json({ error: "Impossible de récupérer les statistiques" }, { status: 500 });
  }
}

// Ajouter 'export const dynamic = 'force-dynamic';' si cette route doit toujours être dynamique
export const dynamic = 'force-dynamic';
