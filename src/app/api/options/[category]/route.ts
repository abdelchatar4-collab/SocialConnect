/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect est un logiciel libre : vous pouvez le redistribuer et/ou le modifier selon les termes de la Licence Publique Générale GNU telle que publiée par la Free Software Foundation, soit la version 3 de la licence, soit (à votre convenance) toute version ultérieure.

Ce programme est distribué dans l'espoir qu'il sera utile, mais SANS AUCUNE GARANTIE ; sans même la garantie implicite de COMMERCIALISATION ou d'ADÉQUATION À UN USAGE PARTICULIER. Voir la Licence Publique Générale GNU pour plus de détails.
*/

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/authOptions';

// Cache pour les options
const cache = new Map<string, { data: any[], timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export async function GET(request: NextRequest, { params }: { params: { category: string } }) {
  const category = params?.category;
  console.log(`[API OPTIONS] GET pour: ${category}`);

  try {
    const session = await getServerSession(authOptions);
    const serviceId = (session?.user as any)?.serviceId || 'default';

    console.log(`[API OPTIONS] Session: ${!!session}, User: ${session?.user?.email || 'N/A'}, ServiceId: ${serviceId}`);

    const cacheKey = `${serviceId}:${category}`;
    const cached = cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      console.log(`[API OPTIONS] Cache hit: ${cached.data.length} options`);
      return NextResponse.json(cached.data);
    }

    // Requête avec filtrage SQL brut pour bypass le problème de types Prisma
    const options = await prisma.$queryRaw`
      SELECT id, value, label, type, serviceId
      FROM dropdown_options
      WHERE type = ${category} AND serviceId = ${serviceId}
      ORDER BY value ASC
    `;

    const optionsArray = Array.isArray(options) ? options : [];
    console.log(`[API OPTIONS] DB: ${optionsArray.length} options trouvées pour serviceId=${serviceId}`);
    cache.set(cacheKey, { data: optionsArray, timestamp: Date.now() });

    return NextResponse.json(optionsArray);
  } catch (error) {
    console.error(`[API OPTIONS] Erreur:`, error);
    return NextResponse.json([]);
  }
}

export async function POST(request: NextRequest, { params }: { params: { category: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { category } = params;
    const { value, label } = await request.json();
    const serviceId = (session.user as any).serviceId || 'default';

    if (!value?.trim()) {
      return NextResponse.json({ error: 'La valeur est requise' }, { status: 400 });
    }

    // Vérifier si l'option existe déjà
    const existing = await prisma.$queryRaw`
      SELECT id FROM dropdown_options
      WHERE type = ${category} AND value = ${value.trim()} AND serviceId = ${serviceId}
      LIMIT 1
    `;

    if (Array.isArray(existing) && existing.length > 0) {
      return NextResponse.json({ error: 'Cette option existe déjà' }, { status: 409 });
    }

    const option = await prisma.dropdownOption.create({
      data: {
        type: category,
        value: value.trim(),
        label: label?.trim() || value.trim(),
        service: { connect: { id: serviceId } }
      }
    });

    cache.delete(`${serviceId}:${category}`);
    return NextResponse.json(option, { status: 201 });
  } catch (error) {
    console.error('Erreur création option:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: { category: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { category } = params;
    const { id, value, label } = await request.json();
    const serviceId = (session.user as any).serviceId || 'default';

    if (!id || !value?.trim()) {
      return NextResponse.json({ error: 'ID et valeur requis' }, { status: 400 });
    }

    // Multi-tenant isolation: verify the option belongs to the same service
    const existingOption = await prisma.dropdownOption.findUnique({
      where: { id },
      select: { serviceId: true }
    });

    if (!existingOption) {
      return NextResponse.json({ error: 'Option non trouvée' }, { status: 404 });
    }

    if (existingOption.serviceId !== serviceId) {
      return NextResponse.json({ error: 'Accès non autorisé à cette option' }, { status: 403 });
    }

    const option = await prisma.dropdownOption.update({
      where: { id },
      data: { value: value.trim(), label: label?.trim() || value.trim() }
    });

    cache.delete(`${serviceId}:${category}`);
    return NextResponse.json(option);
  } catch (error) {
    console.error('Erreur mise à jour option:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { category: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { category } = params;
    const url = new URL(request.url);
    const id = url.searchParams.get('id');
    const serviceId = (session.user as any).serviceId || 'default';

    if (!id) {
      return NextResponse.json({ error: 'ID requis' }, { status: 400 });
    }

    // Multi-tenant isolation: verify the option belongs to the same service
    const existingOption = await prisma.dropdownOption.findUnique({
      where: { id },
      select: { serviceId: true }
    });

    if (!existingOption) {
      return NextResponse.json({ error: 'Option non trouvée' }, { status: 404 });
    }

    if (existingOption.serviceId !== serviceId) {
      return NextResponse.json({ error: 'Accès non autorisé à cette option' }, { status: 403 });
    }

    await prisma.dropdownOption.delete({ where: { id } });
    cache.delete(`${serviceId}:${category}`);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erreur suppression option:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
