/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect est un logiciel libre : vous pouvez le redistribuer et/ou le modifier selon les termes de la Licence Publique Générale GNU telle que publiée par la Free Software Foundation, soit la version 3 de la licence, soit (à votre convenance) toute version ultérieure.

Ce programme est distribué dans l'espoir qu'il sera utile, mais SANS AUCUNE GARANTIE ; sans même la garantie implicite de COMMERCIALISATION ou d'ADÉQUATION À UN USAGE PARTICULIER. Voir la Licence Publique Générale GNU pour plus de détails.
*/

import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/authOptions';
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function DELETE() {
  const session = await getServerSession(authOptions);

  // SÉCURITÉ : Vérifier si l'utilisateur est authentifié ET a le rôle ADMIN
  const userRole = (session?.user as { role?: string } | undefined)?.role;
  if (!session || userRole !== 'ADMIN') {
    return NextResponse.json(
      { error: 'Accès non autorisé. Droits administrateur requis.' },
      { status: 403 }
    );
  }

  // Le reste de ta logique de suppression
  try {
    await prisma.user.deleteMany({});
    // ... (gestion des adresses orphelines ou autres si besoin)
    return NextResponse.json(
      { message: 'Tous les utilisateurs ont été supprimés avec succès.' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Erreur lors de la suppression de tous les utilisateurs:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la suppression de tous les utilisateurs.' },
      { status: 500 }
    );
  }
}
