/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect est un logiciel libre : vous pouvez le redistribuer et/ou le modifier selon les termes de la Licence Publique Générale GNU telle que publiée par la Free Software Foundation, soit la version 3 de la licence, soit (à votre convenance) toute version ultérieure.

Ce programme est distribué dans l'espoir qu'il sera utile, mais SANS AUCUNE GARANTIE ; sans même la garantie implicite de COMMERCIALISATION ou d'ADÉQUATION À UN USAGE PARTICULIER. Voir la Licence Publique Générale GNU pour plus de détails.
*/

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/authOptions';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const partenaires = await prisma.dropdownOption.findMany({
      where: { type: 'partenaire' },
      orderBy: { value: 'asc' }
    });
    return NextResponse.json(partenaires);
  } catch (error) {
    console.error('Erreur lors de la récupération des partenaires:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { value } = await request.json();

    if (!value || value.trim() === '') {
      return NextResponse.json({ error: 'Le nom du partenaire est requis' }, { status: 400 });
    }

    // Vérifier si le partenaire existe déjà
    const existing = await prisma.dropdownOption.findFirst({
      where: {
        type: 'partenaire',
        value: value.trim()
      }
    });

    if (existing) {
      return NextResponse.json({ error: 'Ce partenaire existe déjà' }, { status: 409 });
    }

    const partenaire = await prisma.dropdownOption.create({
      data: {
        type: 'partenaire',
        value: value.trim(),
        label: value.trim()
      }
    });

    return NextResponse.json(partenaire, { status: 201 });
  } catch (error) {
    console.error('Erreur lors de la création du partenaire:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

