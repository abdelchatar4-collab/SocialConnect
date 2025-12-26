/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect est un logiciel libre : vous pouvez le redistribuer et/ou le modifier selon les termes de la Licence Publique Générale GNU telle que publiée par la Free Software Foundation, soit la version 3 de la licence, soit (à votre convenance) toute version ultérieure.
*/

import { NextRequest, NextResponse } from 'next/server';
import { getServiceClient } from '@/lib/prisma-clients';
import { getDynamicServiceId } from '@/lib/auth-utils';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/authOptions';

const cache = new Map<string, { data: any[], timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000;

export async function GET(request: NextRequest, { params }: { params: { category: string } }) {
  const session = await getServerSession(authOptions);
  const serviceId = await getDynamicServiceId(session);
  const category = params?.category;

  const cacheKey = `${serviceId}:${category}`;
  const cached = cache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) return NextResponse.json(cached.data);

  const prisma = getServiceClient(serviceId);
  try {
    const options = await prisma.dropdownOption.findMany({
      where: { type: category },
      orderBy: { value: 'asc' }
    });
    cache.set(cacheKey, { data: options, timestamp: Date.now() });
    return NextResponse.json(options);
  } catch (error) {
    return NextResponse.json([]);
  }
}

export async function POST(request: NextRequest, { params }: { params: { category: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const serviceId = await getDynamicServiceId(session);
  const category = params.category;
  const { value, label } = await request.json();
  if (!value?.trim()) return NextResponse.json({ error: 'La valeur est requise' }, { status: 400 });

  const prisma = getServiceClient(serviceId);
  try {
    const existing = await prisma.dropdownOption.findFirst({ where: { type: category, value: value.trim() } });
    if (existing) return NextResponse.json({ error: 'Cette option existe déjà' }, { status: 409 });

    const option = await prisma.dropdownOption.create({
      data: { type: category, value: value.trim(), label: label?.trim() || value.trim() }
    });
    cache.delete(`${serviceId}:${category}`);
    return NextResponse.json(option, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: { category: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const serviceId = await getDynamicServiceId(session);
  const category = params.category;
  const { id, value, label } = await request.json();
  if (!id || !value?.trim()) return NextResponse.json({ error: 'ID et valeur requis' }, { status: 400 });

  const prisma = getServiceClient(serviceId);
  try {
    const option = await prisma.dropdownOption.update({
      where: { id },
      data: { value: value.trim(), label: label?.trim() || value.trim() }
    });
    cache.delete(`${serviceId}:${category}`);
    return NextResponse.json(option);
  } catch (error) {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { category: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const serviceId = await getDynamicServiceId(session);
  const category = params.category;
  const url = new URL(request.url);
  const id = url.searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'ID requis' }, { status: 400 });

  const prisma = getServiceClient(serviceId);
  try {
    await prisma.dropdownOption.delete({ where: { id } });
    cache.delete(`${serviceId}:${category}`);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
