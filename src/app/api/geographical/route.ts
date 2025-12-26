/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect est un logiciel libre : vous pouvez le redistribuer et/ou le modifier selon les termes de la Licence Publique Générale GNU telle que publiée par la Free Software Foundation, soit la version 3 de la licence, soit (à votre convenance) toute version ultérieure.
*/

import { NextResponse } from 'next/server';
import { getServiceClient } from '@/lib/prisma-clients';
import mappingData from '@/config/mapping.json';
import { getServerSession } from 'next-auth/next';
import { getDynamicServiceId } from '@/lib/auth-utils';
import { authOptions } from '@/lib/authOptions';

async function initializeGeographicalData(prisma: any) {
  try {
    const existingSectors = await prisma.geographicalSector.count();
    if (existingSectors === 0) {
      console.log('Initialisation des données géographiques depuis mapping.json...');
      for (const [sectorName, streets] of Object.entries(mappingData)) {
        const sector = await prisma.geographicalSector.create({ data: { nom: sectorName } });
        if (Array.isArray(streets)) {
          for (const streetName of streets) {
            await prisma.street.create({ data: { nom: streetName, geographicalSectorId: sector.id } });
          }
        }
      }
      console.log('Données géographiques initialisées avec succès.');
    }
  } catch (error) {
    console.error('Erreur lors de l\'initialisation des données géographiques:', error);
  }
}

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const serviceId = await getDynamicServiceId(session);
  const prisma = getServiceClient(serviceId);

  try {
    await initializeGeographicalData(prisma);
    const sectors = await prisma.geographicalSector.findMany({ include: { streets: true }, orderBy: { nom: 'asc' } });
    const transformedSectors = sectors.map((sector: any) => ({
      id: sector.id.toString(),
      name: sector.nom,
      streets: sector.streets.map((street: any) => ({
        id: street.id.toString(),
        name: street.nom,
        sectorId: street.geographicalSectorId.toString(),
        createdAt: street.createdAt.toISOString(),
        updatedAt: street.updatedAt.toISOString()
      })),
      createdAt: sector.createdAt.toISOString(),
      updatedAt: sector.updatedAt.toISOString()
    }));
    return NextResponse.json(transformedSectors);
  } catch (error) {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const serviceId = await getDynamicServiceId(session);
  const prisma = getServiceClient(serviceId);

  try {
    const body = await request.json();
    const { action, sectorName, streetName, sectorId } = body;

    if (action === 'addSector') {
      const sector = await prisma.geographicalSector.create({ data: { nom: sectorName }, include: { streets: true } });
      return NextResponse.json({
        id: sector.id.toString(),
        name: sector.nom,
        streets: [],
        createdAt: sector.createdAt.toISOString(),
        updatedAt: sector.updatedAt.toISOString()
      });
    }

    if (action === 'addStreet') {
      const street = await prisma.street.create({ data: { nom: streetName, geographicalSectorId: parseInt(sectorId) } });
      return NextResponse.json({
        id: street.id.toString(),
        name: street.nom,
        sectorId: street.geographicalSectorId.toString(),
        createdAt: street.createdAt.toISOString(),
        updatedAt: street.updatedAt.toISOString()
      });
    }
    return NextResponse.json({ error: 'Action non reconnue' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const serviceId = await getDynamicServiceId(session);
  const prisma = getServiceClient(serviceId);

  try {
    const body = await request.json();
    const { action, sectorId, streetId, newName } = body;

    if (action === 'updateSector') {
      const sector = await prisma.geographicalSector.update({ where: { id: parseInt(sectorId) }, data: { nom: newName }, include: { streets: true } });
      return NextResponse.json({
        id: sector.id.toString(),
        name: sector.nom,
        streets: sector.streets.map((s: any) => ({ id: s.id.toString(), name: s.nom })),
        createdAt: sector.createdAt.toISOString(),
        updatedAt: sector.updatedAt.toISOString()
      });
    }

    if (action === 'updateStreet') {
      const street = await prisma.street.update({ where: { id: parseInt(streetId) }, data: { nom: newName } });
      return NextResponse.json({
        id: street.id.toString(),
        name: street.nom,
        sectorId: street.geographicalSectorId.toString(),
        createdAt: street.createdAt.toISOString(),
        updatedAt: street.updatedAt.toISOString()
      });
    }
    return NextResponse.json({ error: 'Action non reconnue' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const serviceId = await getDynamicServiceId(session);
  const prisma = getServiceClient(serviceId);

  try {
    const body = await request.json();
    const { action, sectorId, streetId } = body;
    if (action === 'deleteSector') {
      await prisma.geographicalSector.delete({ where: { id: parseInt(sectorId) } });
      return NextResponse.json({ success: true });
    }
    if (action === 'deleteStreet') {
      await prisma.street.delete({ where: { id: parseInt(streetId) } });
      return NextResponse.json({ success: true });
    }
    return NextResponse.json({ error: 'Action non reconnue' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
