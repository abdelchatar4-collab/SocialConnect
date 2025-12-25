/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect est un logiciel libre : vous pouvez le redistribuer et/ou le modifier selon les termes de la Licence Publique Générale GNU telle que publiée par la Free Software Foundation, soit la version 3 de la licence, soit (à votre convenance) toute version ultérieure.

Ce programme est distribué dans l'espoir qu'il sera utile, mais SANS AUCUNE GARANTIE ; sans même la garantie implicite de COMMERCIALISATION ou d'ADÉQUATION À UN USAGE PARTICULIER. Voir la Licence Publique Générale GNU pour plus de détails.
*/

import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/authOptions';
import { NextRequest, NextResponse } from 'next/server';
import { getServiceClient } from '@/lib/prisma-clients';

export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: 'Accès non autorisé.' }, { status: 401 });
  }

  const userRole = (session.user as { role?: string } | undefined)?.role;
  const serviceId = (session.user as any).serviceId || 'default';
  const prisma = getServiceClient(serviceId);

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

        if (!userToDelete.nom || !userToDelete.prenom) {
          return NextResponse.json({
            error: `Impossible de vérifier si l'utilisateur ${userToDelete.prenom || ''} ${userToDelete.nom || ''} est un doublon (données manquantes).`
          }, { status: 400 });
        }

        const targetNom = userToDelete.nom.toLowerCase();
        const targetPrenom = userToDelete.prenom.toLowerCase();
        const targetDate = userToDelete.dateNaissance ? new Date(userToDelete.dateNaissance).toISOString().split('T')[0] : null;

        // Fetch potential duplicates based on NOM and PRENOM
        const potentialDuplicates = await prisma.user.findMany({
          where: {
            AND: [
              { nom: { contains: userToDelete.nom } },
              { prenom: { contains: userToDelete.prenom } },
            ],
            id: { not: userId },
          },
        });

        const isActualDuplicate = potentialDuplicates.some((u: any) => {
          const uNom = u.nom?.toLowerCase() || '';
          const uPrenom = u.prenom?.toLowerCase() || '';
          const uDate = u.dateNaissance ? new Date(u.dateNaissance).toISOString().split('T')[0] : null;

          const namesMatch = uNom === targetNom && uPrenom === targetPrenom;

          // If both have dates, they must match. If one is missing, we consider name match sufficient for duplication check
          if (targetDate && uDate) {
            return namesMatch && uDate === targetDate;
          }

          return namesMatch;
        });

        if (!isActualDuplicate) {
          return NextResponse.json({
            error: `Accès non autorisé. L'utilisateur ${userToDelete.prenom} ${userToDelete.nom} n'est pas identifié comme un doublon par le système.`
          }, { status: 403 });
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
