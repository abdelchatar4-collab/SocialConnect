/*
Copyright (C) 2025 ABDEL KADER CHATAR
*/

import { NextResponse } from 'next/server';
import { getServiceClient } from '@/lib/prisma-clients';
import { getDynamicServiceId } from '@/lib/auth-utils';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/authOptions';

export async function GET(request: Request) {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const serviceId = await getDynamicServiceId(session);
    const prisma = getServiceClient(serviceId);

    const { searchParams } = new URL(request.url);
    const annee = parseInt(searchParams.get('annee') || '2026');
    const gestionnaireId = searchParams.get('gestionnaireId') || (session.user as any).id;

    // Sécurité : Un user lambda ne peut voir que ses propres soldes
    const userRole = (session.user as any).role;
    const currentUserId = (session.user as any).id;
    if (userRole !== 'ADMIN' && userRole !== 'SUPER_ADMIN' && gestionnaireId !== currentUserId) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    try {
        let solde = await prisma.soldeConge.findFirst({
            where: { gestionnaireId, annee }
        });

        if (!solde) {
            solde = {
                id: 'virtual',
                gestionnaireId,
                annee,
                vacancesAnnuelles: 0,
                consultationMedicale: 0,
                forceMajeure: 0,
                congesReglementaires: 0,
                creditHeures: 0,
                heuresSupplementaires: 0,
                updatedAt: new Date()
            } as any;
        }

        const stats = await prisma.prestation.findMany({
            where: {
                gestionnaireId,
                date: { gte: new Date(`${annee}-01-01`), lte: new Date(`${annee}-12-31`) }
            },
            select: { motif: true, dureeNet: true }
        });

        const consomme = { vacancesAnnuelles: 0, consultationMedicale: 0, forceMajeure: 0, congesReglementaires: 0, creditHeures: 0, maladie: 0 };
        stats.forEach(p => {
            if (p.motif === 'Congé VA') consomme.vacancesAnnuelles += p.dureeNet;
            else if (p.motif === 'Consultation médicale') consomme.consultationMedicale += p.dureeNet;
            else if (p.motif === 'Force majeure') consomme.forceMajeure += p.dureeNet;
            else if (p.motif.includes('règlementaire')) consomme.congesReglementaires += p.dureeNet;
            else if (p.motif === 'Congé CH') consomme.creditHeures += p.dureeNet;
            else if (p.motif === 'Maladie' || p.motif === 'Maladie (certificat)') consomme.maladie += p.dureeNet;
        });

        return NextResponse.json({
            quotas: solde,
            consomme,
            restant: {
                vacancesAnnuelles: (solde?.vacancesAnnuelles || 0) - consomme.vacancesAnnuelles,
                consultationMedicale: (solde?.consultationMedicale || 0) - consomme.consultationMedicale,
                forceMajeure: (solde?.forceMajeure || 0) - consomme.forceMajeure,
                congesReglementaires: (solde?.congesReglementaires || 0) - consomme.congesReglementaires,
                creditHeures: (solde?.creditHeures || 0) - consomme.creditHeures,
            }
        });
    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const userRole = (session.user as any).role;
    if (userRole !== 'ADMIN' && userRole !== 'SUPER_ADMIN') {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const serviceId = await getDynamicServiceId(session);
    const prisma = getServiceClient(serviceId);

    try {
        const body = await request.json();
        const { gestionnaireId, annee, vacancesAnnuelles, consultationMedicale, forceMajeure, congesReglementaires, creditHeures, heuresSupplementaires } = body;

        const solde = await prisma.soldeConge.upsert({
            where: { gestionnaireId_annee: { gestionnaireId, annee } },
            update: { vacancesAnnuelles, consultationMedicale, forceMajeure, congesReglementaires, creditHeures, heuresSupplementaires },
            create: { gestionnaireId, annee, vacancesAnnuelles, consultationMedicale, forceMajeure, congesReglementaires, creditHeures, heuresSupplementaires }
        });

        return NextResponse.json(solde);
    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
