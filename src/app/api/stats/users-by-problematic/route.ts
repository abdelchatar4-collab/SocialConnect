/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect est un logiciel libre : vous pouvez le redistribuer et/ou le modifier selon les termes de la Licence Publique Générale GNU telle que publiée par la Free Software Foundation, soit la version 3 de la licence, soit (à votre convenance) toute version ultérieure.

Ce programme est distribué dans l'espoir qu'il sera utile, mais SANS AUCUNE GARANTIE ; sans même la garantie implicite de COMMERCIALISATION ou d'ADÉQUATION À UN USAGE PARTICULIER. Voir la Licence Publique Générale GNU pour plus de détails.
*/

import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/authOptions';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Agrégation des données pour compter les utilisateurs par type de problématique
    const users = await prisma.user.findMany({
      include: {
        problematiques: true
      }
    });

    // Compter manuellement les problématiques et les utilisateurs uniques pour certaines problématiques
    const problematicCounts: Record<string, number> = {};
    const problematiquesSet = new Set(); // Pour compter les utilisateurs uniques avec problématiques spécifiques

    users.forEach(user => {
      user.problematiques?.forEach(prob => {
        // Exclure les types spécifiés et compter les occurrences pour le graphique
        if (prob.type) {
          problematicCounts[prob.type] = (problematicCounts[prob.type] || 0) + 1;
        }

        // Compter les utilisateurs uniques avec problématiques "Administratif" ou "Logement"
        if (prob.type === "Administratif" || prob.type === "Logement") {
          problematiquesSet.add(user.id);
        }
      });
    });

    // Formater les données pour le frontend
    const formattedStats = Object.entries(problematicCounts).map(([name, value]) => ({
      name,
      value
    })).sort((a, b) => b.value - a.value);

    // Inclure le total des utilisateurs uniques avec problématiques spécifiques
    const totalProblematiquesUniques = problematiquesSet.size;

    return NextResponse.json({
      problematiqueStats: formattedStats,
      totalProblematiquesUniques: totalProblematiquesUniques
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des statistiques par problématique:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des données' },
      { status: 500 }
    );
  }
}
