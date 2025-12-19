/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect est un logiciel libre : vous pouvez le redistribuer et/ou le modifier selon les termes de la Licence Publique Générale GNU telle que publiée par la Free Software Foundation, soit la version 3 de la licence, soit (à votre convenance) toute version ultérieure.

Ce programme est distribué dans l'espoir qu'il sera utile, mais SANS AUCUNE GARANTIE ; sans même la garantie implicite de COMMERCIALISATION ou d'ADÉQUATION À UN USAGE PARTICULIER. Voir la Licence Publique Générale GNU pour plus de détails.
*/

// filepath: /Users/abdelchatar/Desktop/Projet-Gestion-Usagers/app-gestion-usagers/src/app/api/users/count/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma'; // CORRECT: Utilise l'instance partagée

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const userCount = await prisma.user.count({
      // Optionnel: Ajoutez une clause 'where' si vous voulez compter
      // seulement certains utilisateurs (ex: actifs)
      // where: {
      //   etat: 'En cours',
      // }
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