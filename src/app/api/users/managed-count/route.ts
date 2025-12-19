/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect est un logiciel libre : vous pouvez le redistribuer et/ou le modifier selon les termes de la Licence Publique Générale GNU telle que publiée par la Free Software Foundation, soit la version 3 de la licence, soit (à votre convenance) toute version ultérieure.

Ce programme est distribué dans l'espoir qu'il sera utile, mais SANS AUCUNE GARANTIE ; sans même la garantie implicite de COMMERCIALISATION ou d'ADÉQUATION À UN USAGE PARTICULIER. Voir la Licence Publique Générale GNU pour plus de détails.
*/

// src/app/api/users/managed-count/route.ts
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

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

    const count = await prisma.user.count({
      where: {
        gestionnaireId: gestionnaireId
      }
    });

    return NextResponse.json({ count });
  } catch (error: unknown) {
    console.error('Erreur lors du comptage des utilisateurs gérés:', error);
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Erreur inconnue' }, { status: 500 });
  }
}
