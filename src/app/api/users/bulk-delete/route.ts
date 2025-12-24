/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect est un logiciel libre : vous pouvez le redistribuer et/ou le modifier selon les termes de la Licence Publique Générale GNU telle que publiée par la Free Software Foundation, soit la version 3 de la licence, soit (à votre convenance) toute version ultérieure.

Ce programme est distribué dans l'espoir qu'il sera utile, mais SANS AUCUNE GARANTIE ; sans même la garantie implicite de COMMERCIALISATION ou d'ADÉQUATION À UN USAGE PARTICULIER. Voir la Licence Publique Générale GNU pour plus de détails.
*/

import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/authOptions';
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: 'Accès non autorisé.' }, { status: 401 });
  }

  const userRole = (session.user as { role?: string } | undefined)?.role;

  try {
    const { ids } = await req.json();
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: 'Liste d\'IDs manquante ou invalide.' }, { status: 400 });
    }

    if (userRole !== 'ADMIN' && userRole !== 'SUPER_ADMIN') {
      // For non-admins, verify every user is a duplicate before deleting
      for (const userId of ids) {
        const userToDelete = await prisma.user.findUnique({
          where: { id: userId },
        });

        if (!userToDelete) {
          return NextResponse.json({ error: `Utilisateur avec ID ${userId} non trouvé.` }, { status: 404 });
        }

        if (!userToDelete.nom || !userToDelete.prenom || !userToDelete.dateNaissance) {
          return NextResponse.json({ error: `Impossible de vérifier si l'utilisateur ${userToDelete.id} est un doublon (données manquantes).` }, { status: 400 });
        }

        // Fetch potential duplicates based on NOM only (case insensitive via finding many)
        // Then filter in JS for precise match (ignoring case) on prenom and date
        const potentialDuplicates = await prisma.user.findMany({
          where: {
            nom: userToDelete.nom, // Prisma might be case sensitive depending on DB collation
            id: { not: userId },
          },
        });

        const targetNom = userToDelete.nom.toLowerCase();
        const targetPrenom = userToDelete.prenom.toLowerCase();
        const targetDate = new Date(userToDelete.dateNaissance).toDateString(); // Compare date part only

        const duplicateCount = potentialDuplicates.filter(u => {
          const uNom = u.nom?.toLowerCase() || '';
          const uPrenom = u.prenom?.toLowerCase() || '';
          const uDate = u.dateNaissance ? new Date(u.dateNaissance).toDateString() : '';

          return uNom === targetNom && uPrenom === targetPrenom && uDate === targetDate;
        }).length;

        if (duplicateCount === 0) {
          // Fallback: Check if strict match works (in case DB had strict collation but JS normalization differs? unlikely but safe)
          const strictCount = await prisma.user.count({
            where: {
              nom: userToDelete.nom,
              prenom: userToDelete.prenom,
              dateNaissance: userToDelete.dateNaissance,
              id: { not: userId },
            }
          });

          if (strictCount === 0) {
            return NextResponse.json({ error: `Accès non autorisé. L'utilisateur ${userToDelete.prenom} ${userToDelete.nom} n'est pas identifié comme un doublon.` }, { status: 403 });
          }
        }
      }
    }

    await prisma.user.deleteMany({
      where: {
        id: { in: ids },
      },
    });

    return NextResponse.json({ message: 'Utilisateurs sélectionnés supprimés avec succès.' }, { status: 200 });
  } catch (error) {
    console.error("Erreur lors de la suppression en bloc des utilisateurs:", error);
    return NextResponse.json({ error: "Erreur lors de la suppression en bloc des utilisateurs." }, { status: 500 });
  }
}
