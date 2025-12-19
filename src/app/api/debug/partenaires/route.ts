/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect est un logiciel libre : vous pouvez le redistribuer et/ou le modifier selon les termes de la Licence Publique Générale GNU telle que publiée par la Free Software Foundation, soit la version 3 de la licence, soit (à votre convenance) toute version ultérieure.

Ce programme est distribué dans l'espoir qu'il sera utile, mais SANS AUCUNE GARANTIE ; sans même la garantie implicite de COMMERCIALISATION ou d'ADÉQUATION À UN USAGE PARTICULIER. Voir la Licence Publique Générale GNU pour plus de détails.
*/

import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    // Vérifier toutes les entrées DropdownOption
    const allOptions = await prisma.dropdownOption.findMany();

    // Vérifier spécifiquement les partenaires
    const partenaires = await prisma.dropdownOption.findMany({
      where: { type:'partenaire' }
    });

    // Vérifier les types uniques
    const uniqueTypes = await prisma.dropdownOption.findMany({
      select: { type: true },
      distinct: ['type']
    });

    return NextResponse.json({
      message: 'Debug des options partenaires',
      totalCount: allOptions.length,
      sampleData: allOptions.slice(0, 5)
    });
  } catch (error) {
    console.error('Erreur debug:', error);
    const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
