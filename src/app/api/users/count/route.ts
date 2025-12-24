/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect est un logiciel libre : vous pouvez le redistribuer et/ou le modifier selon les termes de la Licence Publique Générale GNU telle que publiée par la Free Software Foundation, soit la version 3 de la licence, soit (à votre convenance) toute version ultérieure.

Ce programme est distribué dans l'espoir qu'il sera utile, mais SANS AUCUNE GARANTIE ; sans même la garantie implicite de COMMERCIALISATION ou d'ADÉQUATION À UN USAGE PARTICULIER. Voir la Licence Publique Générale GNU pour plus de détails.
*/

// filepath: /Users/abdelchatar/Desktop/Projet-Gestion-Usagers/app-gestion-usagers/src/app/api/users/count/route.ts
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
    // Get year filter from query parameters
    const { searchParams } = new URL(request.url);
    const annee = searchParams.get('annee');

    // Build where clause
    const where: { annee?: number } = {};
    if (annee) {
      where.annee = parseInt(annee);
    }

    const userCount = await prisma.user.count({
      where,
    });

    // Renvoie le compte dans un objet JSON
    return NextResponse.json({ count: userCount });

  } catch (error) {
    console.error("Erreur lors du comptage des utilisateurs:", error);
    const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
    // CORRECT: Gestion d'erreur
    return NextResponse.json({ message: 'Erreur serveur lors du comptage des utilisateurs.', details: errorMessage }, { status: 500 });
  }
}
