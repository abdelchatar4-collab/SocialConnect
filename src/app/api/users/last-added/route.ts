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
    // Trouver le dernier utilisateur basé sur la dateOuverture
    const lastAddedUser = await prisma.user.findFirst({
      orderBy: {
        dateOuverture: 'desc',
      },
      select: {
        id: true,
        nom: true,
        prenom: true,
        dateOuverture: true,
        gestionnaire: true, // Sélectionne le champ gestionnaire (string)
      },
    });

    if (!lastAddedUser) {
      return NextResponse.json({ message: 'Aucun utilisateur trouvé' }, { status: 404 });
    }

    return NextResponse.json(lastAddedUser);

  } catch (error) {
    console.error('Erreur lors de la récupération du dernier utilisateur:', error);
    return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 });
  }
}
