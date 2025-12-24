/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect est un logiciel libre : vous pouvez le redistribuer et/ou le modifier selon les termes de la Licence Publique Générale GNU telle que publiée par la Free Software Foundation, soit la version 3 de la licence, soit (à votre convenance) toute version ultérieure.
*/

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { calculatePrestationBreakdown } from '@/utils/prestationUtils';

export const dynamic = 'force-dynamic';

/**
 * GET /api/prestations
 * Lists prestations. Admins see all, users see their own.
 * Supports filters: startDate, endDate, gestionnaireId
 */
export async function GET(request: Request) {
    const session = await getServerSession();
    if (!session || !session.user) {
        return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const gestionnaireId = searchParams.get('gestionnaireId');

    // Check if user is admin/gestionnaire
    const currentUser = await prisma.gestionnaire.findUnique({
        where: { email: session.user.email as string }
    });

    if (!currentUser) {
        return NextResponse.json({ error: 'Utilisateur non trouvé' }, { status: 404 });
    }

    const isAdmin = currentUser.role === 'ADMIN' || currentUser.role === 'SUPER_ADMIN';

    // Build query
    const where: any = {};

    if (!isAdmin) {
        // Non-admins only see their own prestations
        where.gestionnaireId = currentUser.id;
    } else {
        // Admins see all prestations from their service
        where.serviceId = currentUser.serviceId;
        if (gestionnaireId) {
            where.gestionnaireId = gestionnaireId;
        }
    }

    if (startDate || endDate) {
        where.date = {};
        if (startDate) where.date.gte = new Date(startDate);
        if (endDate) where.date.lte = new Date(endDate);
    }

    try {
        const prestations = await prisma.prestation.findMany({
            where,
            include: {
                gestionnaire: {
                    select: { prenom: true, nom: true, couleurMedaillon: true }
                }
            },
            orderBy: { date: 'desc' }
        });

        return NextResponse.json(prestations);
    } catch (error) {
        console.error('Error fetching prestations:', error);
        return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
    }
}

/**
 * POST /api/prestations
 * Creates a new prestation entry.
 */
export async function POST(request: Request) {
    const session = await getServerSession();
    if (!session || !session.user) {
        return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const currentUser = await prisma.gestionnaire.findUnique({
        where: { email: session.user.email as string }
    });

    if (!currentUser) {
        return NextResponse.json({ error: 'Gestionnaire non trouvé' }, { status: 404 });
    }

    try {
        const data = await request.json();
        const { date, heureDebut, heureFin, pause, motif, commentaire } = data;

        // Calculate breakdown on server side for safety
        const breakdown = calculatePrestationBreakdown(heureDebut, heureFin, pause);

        const prestation = await prisma.prestation.create({
            data: {
                date: new Date(date),
                heureDebut,
                heureFin,
                pause,
                dureeNet: breakdown.totalMinutes,
                isOvertime: breakdown.overtimeMinutes > 0,
                bonis: breakdown.bonisMinutes,
                motif,
                commentaire,
                gestionnaireId: currentUser.id,
                serviceId: currentUser.serviceId || 'default'
            }
        });

        return NextResponse.json(prestation);
    } catch (error) {
        console.error('Error creating prestation:', error);
        return NextResponse.json({ error: 'Erreur lors de la création' }, { status: 500 });
    }
}

/**
 * DELETE /api/prestations
 * Deletes a prestation.
 */
export async function DELETE(request: Request) {
    const session = await getServerSession();
    if (!session || !session.user) {
        return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
        return NextResponse.json({ error: 'ID manquant' }, { status: 400 });
    }

    try {
        // Check ownership or admin
        const prestation = await prisma.prestation.findUnique({
            where: { id },
            include: { gestionnaire: true }
        });

        if (!prestation) {
            return NextResponse.json({ error: 'Prestation non trouvée' }, { status: 404 });
        }

        const currentUser = await prisma.gestionnaire.findUnique({
            where: { email: session.user.email as string }
        });

        if (!currentUser || (currentUser.id !== prestation.gestionnaireId && currentUser.role !== 'ADMIN' && currentUser.role !== 'SUPER_ADMIN')) {
            return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
        }

        await prisma.prestation.delete({
            where: { id }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting prestation:', error);
        return NextResponse.json({ error: 'Erreur lors de la suppression' }, { status: 500 });
    }
}

/**
 * PUT /api/prestations
 * Updates an existing prestation (admin only).
 */
export async function PUT(request: Request) {
    const session = await getServerSession();
    if (!session || !session.user) {
        return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    try {
        const data = await request.json();
        const { id, date, heureDebut, heureFin, pause, motif, commentaire } = data;

        if (!id) {
            return NextResponse.json({ error: 'ID manquant' }, { status: 400 });
        }

        // Check admin rights
        const currentUser = await prisma.gestionnaire.findUnique({
            where: { email: session.user.email as string }
        });

        if (!currentUser || (currentUser.role !== 'ADMIN' && currentUser.role !== 'SUPER_ADMIN')) {
            return NextResponse.json({ error: 'Accès réservé aux administrateurs' }, { status: 403 });
        }

        // Calculate breakdown
        const breakdown = calculatePrestationBreakdown(heureDebut, heureFin, pause);

        const updatedPrestation = await prisma.prestation.update({
            where: { id },
            data: {
                date: new Date(date),
                heureDebut,
                heureFin,
                pause,
                dureeNet: breakdown.totalMinutes,
                isOvertime: breakdown.overtimeMinutes > 0,
                bonis: breakdown.bonisMinutes,
                motif,
                commentaire
            }
        });

        return NextResponse.json(updatedPrestation);
    } catch (error) {
        console.error('Error updating prestation:', error);
        return NextResponse.json({ error: 'Erreur lors de la mise à jour' }, { status: 500 });
    }
}
