/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect est un logiciel libre : vous pouvez le redistribuer et/ou le modifier selon les termes de la Licence Publique Générale GNU telle que publiée par la Free Software Foundation, soit la version 3 de la licence, soit (à votre convenance) toute version ultérieure.

Ce programme est distribué dans l'espoir qu'il sera utile, mais SANS AUCUNE GARANTIE ; sans même la garantie implicite de COMMERCIALISATION ou d'ADÉQUATION À UN USAGE PARTICULIER. Voir la Licence Publique Générale GNU pour plus de détails.
*/

import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { NextRequest } from 'next/server';

// Force cette route à être dynamique
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    // Utiliser nextUrl pour éviter le dynamic server warning
    const { searchParams } = request.nextUrl;
    const gestionnaireId = searchParams.get('gestionnaireId');

    if (!gestionnaireId) {
      return NextResponse.json({ error: 'ID du gestionnaire requis' }, { status: 400 });
    }

    // Récupérer le dernier utilisateur ajouté par ce gestionnaire
    const lastUser = await prisma.user.findFirst({
      where: {
        gestionnaireId: gestionnaireId,
      },
      orderBy: {
        dateOuverture: 'desc',
      },
      include: {
        adresse: true,
      },
    });

    return NextResponse.json(lastUser);
  } catch (error) {
    console.error("Erreur lors de la récupération du dernier utilisateur:", error);
    return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 });
  }
}
