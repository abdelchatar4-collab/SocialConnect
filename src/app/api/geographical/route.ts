/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect est un logiciel libre : vous pouvez le redistribuer et/ou le modifier selon les termes de la Licence Publique Générale GNU telle que publiée par la Free Software Foundation, soit la version 3 de la licence, soit (à votre convenance) toute version ultérieure.

Ce programme est distribué dans l'espoir qu'il sera utile, mais SANS AUCUNE GARANTIE ; sans même la garantie implicite de COMMERCIALISATION ou d'ADÉQUATION À UN USAGE PARTICULIER. Voir la Licence Publique Générale GNU pour plus de détails.
*/

import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import mappingData from '@/config/mapping.json';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/authOptions';

// Fonction pour initialiser la base de données avec les données du mapping.json
async function initializeGeographicalData() {
  try {
    // Vérifier si des secteurs existent déjà
    const existingSectors = await prisma.geographicalSector.count();

    if (existingSectors === 0) {
      console.log('Initialisation des données géographiques depuis mapping.json...');

      // Insérer les secteurs et rues depuis mapping.json
      for (const [sectorName, streets] of Object.entries(mappingData)) {
        const sector = await prisma.geographicalSector.create({
          data: {
            nom: sectorName
          }
        });

        if (Array.isArray(streets)) {
          for (const streetName of streets) {
            await prisma.street.create({
              data: {
                nom: streetName,
                geographicalSectorId: sector.id
              }
            });
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
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Initialiser les données si nécessaire
    await initializeGeographicalData();

    const sectors = await prisma.geographicalSector.findMany({
      include: {
        streets: true
      },
      orderBy: {
        nom: 'asc'
      }
    });

    // Transformer les données pour correspondre à l'interface attendue
    const transformedSectors = sectors.map(sector => ({
      id: sector.id.toString(),
      name: sector.nom,
      streets: sector.streets.map(street => ({
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
    console.error('Erreur API geographical:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { action, sectorName, streetName, sectorId } = body;

    if (action === 'addSector') {
      const sector = await prisma.geographicalSector.create({
        data: {
          nom: sectorName
        },
        include: {
          streets: true
        }
      });

      const transformedSector = {
        id: sector.id.toString(),
        name: sector.nom,
        streets: sector.streets.map(street => ({
          id: street.id.toString(),
          name: street.nom,
          sectorId: street.geographicalSectorId.toString(),
          createdAt: street.createdAt.toISOString(),
          updatedAt: street.updatedAt.toISOString()
        })),
        createdAt: sector.createdAt.toISOString(),
        updatedAt: sector.updatedAt.toISOString()
      };

      return NextResponse.json(transformedSector);
    }

    if (action === 'addStreet') {
      const street = await prisma.street.create({
        data: {
          nom: streetName,
          geographicalSectorId: parseInt(sectorId)
        }
      });

      const transformedStreet = {
        id: street.id.toString(),
        name: street.nom,
        sectorId: street.geographicalSectorId.toString(),
        createdAt: street.createdAt.toISOString(),
        updatedAt: street.updatedAt.toISOString()
      };

      return NextResponse.json(transformedStreet);
    }

    return NextResponse.json({ error: 'Action non reconnue' }, { status: 400 });
  } catch (error) {
    console.error('Erreur API geographical POST:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { action, sectorId, streetId, newName } = body;

    if (action === 'updateSector') {
      const sector = await prisma.geographicalSector.update({
        where: { id: parseInt(sectorId) },
        data: { nom: newName },
        include: { streets: true }
      });

      const transformedSector = {
        id: sector.id.toString(),
        name: sector.nom,
        streets: sector.streets.map(street => ({
          id: street.id.toString(),
          name: street.nom,
          sectorId: street.geographicalSectorId.toString(),
          createdAt: street.createdAt.toISOString(),
          updatedAt: street.updatedAt.toISOString()
        })),
        createdAt: sector.createdAt.toISOString(),
        updatedAt: sector.updatedAt.toISOString()
      };

      return NextResponse.json(transformedSector);
    }

    if (action === 'updateStreet') {
      const street = await prisma.street.update({
        where: { id: parseInt(streetId) },
        data: { nom: newName }
      });

      const transformedStreet = {
        id: street.id.toString(),
        name: street.nom,
        sectorId: street.geographicalSectorId.toString(),
        createdAt: street.createdAt.toISOString(),
        updatedAt: street.updatedAt.toISOString()
      };

      return NextResponse.json(transformedStreet);
    }

    return NextResponse.json({ error: 'Action non reconnue' }, { status: 400 });
  } catch (error) {
    console.error('Erreur PUT geographical:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { action, sectorId, streetId } = body;

    if (action === 'deleteSector') {
      await prisma.geographicalSector.delete({
        where: { id: parseInt(sectorId) }
      });
      return NextResponse.json({ success: true });
    }

    if (action === 'deleteStreet') {
      await prisma.street.delete({
        where: { id: parseInt(streetId) }
      });
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Action non reconnue' }, { status: 400 });
  } catch (error) {
    console.error('Erreur DELETE geographical:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
