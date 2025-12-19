/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect est un logiciel libre : vous pouvez le redistribuer et/ou le modifier selon les termes de la Licence Publique Générale GNU telle que publiée par la Free Software Foundation, soit la version 3 de la licence, soit (à votre convenance) toute version ultérieure.

Ce programme est distribué dans l'espoir qu'il sera utile, mais SANS AUCUNE GARANTIE ; sans même la garantie implicite de COMMERCIALISATION ou d'ADÉQUATION À UN USAGE PARTICULIER. Voir la Licence Publique Générale GNU pour plus de détails.
*/

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/authOptions';

// Interface for cached dropdown options
interface DropdownOption {
  id: string;
  type: string;
  value: string;
  label: string;
}

// Cache pour les options
const cache = new Map<string, { data: DropdownOption[], timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export async function GET(request: NextRequest, { params }: { params: { category: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { category } = params; // Utiliser 'category' au lieu de 'type'

    // Vérifier le cache
    const cached = cache.get(category);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return NextResponse.json(cached.data);
    }

    // Récupérer les options par type
    const options = await prisma.dropdownOption.findMany({
      where: { type: category }, // Utiliser category comme type
      orderBy: { value: 'asc' }
    });

    // Mettre en cache
    cache.set(category, { data: options, timestamp: Date.now() });

    return NextResponse.json(options);
  } catch (error) {
    console.error('Erreur lors de la récupération des options:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

export async function POST(request: NextRequest, { params }: { params: { category: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { category } = params; // Utiliser 'category' au lieu de 'type'
    const { value, label } = await request.json();

    if (!value || value.trim() === '') {
      return NextResponse.json({ error: 'La valeur est requise' }, { status: 400 });
    }

    // Vérifier si l'option existe déjà
    const existing = await prisma.dropdownOption.findFirst({
      where: {
        type: category, // Utiliser category comme type
        value: value.trim()
      }
    });

    if (existing) {
      return NextResponse.json({ error: 'Cette option existe déjà' }, { status: 409 });
    }

    const option = await prisma.dropdownOption.create({
      data: {
        type: category, // Utiliser category au lieu de type
        value: value.trim(),
        label: label?.trim() || value.trim()
      }
    });

    // Invalider le cache
    cache.delete(category); // Utiliser category au lieu de type

    return NextResponse.json(option, { status: 201 });
  } catch (error) {
    console.error('Erreur lors de la création de l\'option:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: { category: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { category } = params;
    const { id, value, label } = await request.json();

    if (!id || !value || value.trim() === '') {
      return NextResponse.json({ error: 'ID et valeur sont requis' }, { status: 400 });
    }

    const existing = await prisma.dropdownOption.findFirst({
      where: {
        type: category,
        value: value.trim(),
        id: { not: id }
      }
    });

    if (existing) {
      return NextResponse.json({ error: 'Cette valeur est déjà utilisée' }, { status: 409 });
    }

    const option = await prisma.dropdownOption.update({
      where: { id },
      data: {
        value: value.trim(),
        label: label?.trim() || value.trim()
      }
    });

    cache.delete(category);

    return NextResponse.json(option);
  } catch (error) {
    console.error('Erreur lors de la mise à jour de l\'option:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { category: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { category } = params;
    const url = new URL(request.url);
    const id = url.searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID requis' }, { status: 400 });
    }

    await prisma.dropdownOption.delete({
      where: { id }
    });

    cache.delete(category);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erreur lors de la suppression de l\'option:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
