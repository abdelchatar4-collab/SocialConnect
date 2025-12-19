/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect est un logiciel libre : vous pouvez le redistribuer et/ou le modifier selon les termes de la Licence Publique Générale GNU telle que publiée par la Free Software Foundation, soit la version 3 de la licence, soit (à votre convenance) toute version ultérieure.

Ce programme est distribué dans l'espoir qu'il sera utile, mais SANS AUCUNE GARANTIE ; sans même la garantie implicite de COMMERCIALISATION ou d'ADÉQUATION À UN USAGE PARTICULIER. Voir la Licence Publique Générale GNU pour plus de détails.
*/

export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/authOptions';

// --- GET /api/gestionnaires - Récupérer tous les gestionnaires ---
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const gestionnaires = await prisma.gestionnaire.findMany({
      orderBy: { prenom: 'asc' },
      select: {
        id: true,
        nom: true,
        prenom: true,
        email: true,
        role: true,
        couleurMedaillon: true
      }
    });

    return NextResponse.json(gestionnaires);
  } catch (error) {
    console.error('Erreur lors de la récupération des gestionnaires:', error);
    return NextResponse.json(
      { error: 'Erreur serveur lors de la récupération des gestionnaires' },
      { status: 500 }
    );
  }
}

// --- POST /api/gestionnaires - Créer un nouveau gestionnaire ---
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await request.json();

    if (!data.prenom) {
      return NextResponse.json(
        { error: 'Le prénom est requis' },
        { status: 400 }
      );
    }

    const gestionnaire = await prisma.gestionnaire.create({
      data: {
        nom: data.nom || "",
        prenom: data.prenom,
        email: data.email || null,
        couleurMedaillon: data.couleurMedaillon || null,
      }
    });

    return NextResponse.json(gestionnaire);
  } catch (error) {
    console.error('Erreur lors de la création du gestionnaire:', error);
    return NextResponse.json(
      { error: "Erreur lors de la création du gestionnaire" },
      { status: 500 }
    );
  }
}

// --- DELETE /api/gestionnaires - Supprimer un gestionnaire ---
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const id = request.nextUrl.searchParams.get('id');
    if (!id) {
      return NextResponse.json(
        { error: 'ID non fourni' },
        { status: 400 }
      );
    }

    await prisma.gestionnaire.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erreur lors de la suppression du gestionnaire:', error);
    return NextResponse.json(
      { error: "Erreur lors de la suppression du gestionnaire" },
      { status: 500 }
    );
  }
}

