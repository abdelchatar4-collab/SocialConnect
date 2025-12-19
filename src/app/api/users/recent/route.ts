/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect est un logiciel libre : vous pouvez le redistribuer et/ou le modifier selon les termes de la Licence Publique Générale GNU telle que publiée par la Free Software Foundation, soit la version 3 de la licence, soit (à votre convenance) toute version ultérieure.

Ce programme est distribué dans l'espoir qu'il sera utile, mais SANS AUCUNE GARANTIE ; sans même la garantie implicite de COMMERCIALISATION ou d'ADÉQUATION À UN USAGE PARTICULIER. Voir la Licence Publique Générale GNU pour plus de détails.
*/

import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Fetch the 10 most recent users ordered by dateOuverture
    const recentUsers = await prisma.user.findMany({
      orderBy: [
        { dateOuverture: 'desc' }, // Primary sort by dateOuverture
        { id: 'desc' } // Secondary sort by id for consistent ordering
      ],
      take: 10, // Limit to the 10 most recent users
      select: {
        id: true,
        nom: true,
        prenom: true,
        etat: true,
        dateOuverture: true,
        secteur: true,
        telephone: true,
        email: true,
        antenne: true,
        gestionnaire: { // Include gestionnaire information
          select: {
            nom: true,
            prenom: true,
            email: true
          }
        },
        problematiques: {
          select: {
            type: true,
          },
        },
        adresse: {
          select: {
            rue: true,
          },
        },
      }
    });

    // Format the dates for display with correct French format (DD/MM/YYYY)
    const formattedUsers = recentUsers.map(user => ({
      ...user,
      dateOuverture: user.dateOuverture
        ? new Date(user.dateOuverture).toLocaleDateString('fr-FR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
          })
        : 'N/A',
    }));

    return NextResponse.json(formattedUsers);
  } catch (error) {
    console.error('Erreur lors de la récupération des derniers utilisateurs:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des derniers utilisateurs', details: errorMessage },
      { status: 500 }
    );
  }
}
