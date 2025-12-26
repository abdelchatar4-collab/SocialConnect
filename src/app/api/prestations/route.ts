/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect est un logiciel libre : vous pouvez le redistribuer et/ou le modifier selon les termes de la Licence Publique Générale GNU telle que publiée par la Free Software Foundation, soit la version 3 de la licence, soit (à votre convenance) toute version ultérieure.
*/

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { getServiceClient } from '@/lib/prisma-clients';
import { calculatePrestationBreakdown } from '@/utils/prestationUtils';
import { getDynamicServiceId } from '@/lib/auth-utils';
import { authOptions } from '@/lib/authOptions';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });

    const serviceId = await getDynamicServiceId(session);
    const prisma = getServiceClient(serviceId);

    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const gestionnaireId = searchParams.get('gestionnaireId');

    const currentUser = await prisma.gestionnaire.findUnique({
        where: { email: session.user.email as string }
    });

    // Si l'utilisateur n'est pas en base (ex: dev-admin virtuel), il est SUPER_ADMIN par défaut
    const isAdmin = currentUser?.role === 'ADMIN' || currentUser?.role === 'SUPER_ADMIN' || (!currentUser && session.user.role === 'SUPER_ADMIN');
    const where: any = {};

    if (!isAdmin && currentUser) {
        where.gestionnaireId = currentUser.id;
    } else if (gestionnaireId) {
        where.gestionnaireId = gestionnaireId;
    } else if (!isAdmin && !currentUser) {
        // Cas improbable mais sécurisant : si non admin et non en DB, on ne montre rien
        return NextResponse.json([]);
    }

    if (startDate || endDate) {
        where.date = {};
        if (startDate) where.date.gte = new Date(startDate);
        if (endDate) where.date.lte = new Date(endDate);
    }

    try {
        const prestations = await prisma.prestation.findMany({
            where,
            include: { gestionnaire: { select: { prenom: true, nom: true, couleurMedaillon: true } } },
            orderBy: { date: 'desc' }
        });
        return NextResponse.json(prestations);
    } catch (error) {
        return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });

    const serviceId = await getDynamicServiceId(session);
    const prisma = getServiceClient(serviceId);

    const currentUser = await prisma.gestionnaire.findUnique({
        where: { email: session.user.email as string }
    });

    if (!currentUser) return NextResponse.json({ error: 'Gestionnaire non trouvé' }, { status: 404 });

    try {
        const data = await request.json();
        const { date, heureDebut, heureFin, pause, motif, commentaire } = data;

        if (motif === '1 jour sans certificat' || motif === 'jour_sans_certificat') {
            const targetDate = new Date(date);
            const year = targetDate.getFullYear();

            const existingCount = await prisma.prestation.count({
                where: {
                    gestionnaireId: currentUser.id,
                    motif: { in: ['1 jour sans certificat', 'jour_sans_certificat'] },
                    date: { gte: new Date(year, 0, 1), lte: new Date(year, 11, 31) }
                }
            });

            if (existingCount >= 3) return NextResponse.json({ error: `Limite atteinte : 3 jours max pour ${year}.` }, { status: 400 });

            const prevDay = new Date(targetDate); prevDay.setDate(prevDay.getDate() - 1);
            const nextDay = new Date(targetDate); nextDay.setDate(nextDay.getDate() + 1);

            const adjacent = await prisma.prestation.findFirst({
                where: {
                    gestionnaireId: currentUser.id,
                    motif: { in: ['1 jour sans certificat', 'jour_sans_certificat'] },
                    date: { in: [prevDay, nextDay] }
                }
            });

            if (adjacent) return NextResponse.json({ error: 'Les jours sans certificat ne peuvent pas être consécutifs.' }, { status: 400 });
        }

        const breakdown = calculatePrestationBreakdown(heureDebut, heureFin, pause);
        const prestation = await prisma.prestation.create({
            data: {
                date: new Date(date),
                heureDebut, heureFin, pause,
                dureeNet: breakdown.totalMinutes,
                isOvertime: breakdown.overtimeMinutes > 0,
                bonis: breakdown.bonisMinutes,
                motif, commentaire,
                gestionnaireId: currentUser.id
            }
        });

        return NextResponse.json(prestation);
    } catch (error) {
        return NextResponse.json({ error: 'Erreur lors de la création' }, { status: 500 });
    }
}

export async function PUT(request: Request) {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });

    const serviceId = await getDynamicServiceId(session);
    const prisma = getServiceClient(serviceId);

    try {
        const data = await request.json();
        const { id, date, heureDebut, heureFin, pause, motif, commentaire } = data;
        if (!id) return NextResponse.json({ error: 'ID manquant' }, { status: 400 });

        const currentUser = await prisma.gestionnaire.findUnique({ where: { email: session.user.email as string } });
        if (!currentUser || (currentUser.role !== 'ADMIN' && currentUser.role !== 'SUPER_ADMIN')) {
            return NextResponse.json({ error: 'Accès réservé aux administrateurs' }, { status: 403 });
        }

        const breakdown = calculatePrestationBreakdown(heureDebut, heureFin, pause);
        const updated = await prisma.prestation.update({
            where: { id },
            data: {
                date: new Date(date),
                heureDebut, heureFin, pause,
                dureeNet: breakdown.totalMinutes,
                isOvertime: breakdown.overtimeMinutes > 0,
                bonis: breakdown.bonisMinutes,
                motif, commentaire
            }
        });

        return NextResponse.json(updated);
    } catch (error) {
        return NextResponse.json({ error: 'Erreur lors de la mise à jour' }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });

    const serviceId = await getDynamicServiceId(session);
    const prisma = getServiceClient(serviceId);

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'ID manquant' }, { status: 400 });

    try {
        const prestation = await prisma.prestation.findUnique({ where: { id } });
        if (!prestation) return NextResponse.json({ error: 'Prestation non trouvée' }, { status: 404 });

        const currentUser = await prisma.gestionnaire.findUnique({ where: { email: session.user.email as string } });
        if (!currentUser || (currentUser.id !== prestation.gestionnaireId && currentUser.role !== 'ADMIN' && currentUser.role !== 'SUPER_ADMIN')) {
            return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
        }

        await prisma.prestation.delete({ where: { id } });
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: 'Erreur lors de la suppression' }, { status: 500 });
    }
}
