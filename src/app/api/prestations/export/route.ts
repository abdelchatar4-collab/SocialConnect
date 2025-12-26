/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect est un logiciel libre : vous pouvez le redistribuer et/ou le modifier
*/

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { getServiceClient } from '@/lib/prisma-clients';
import { getDynamicServiceId } from '@/lib/auth-utils';
import { authOptions } from '@/lib/authOptions';
import ExcelJS from 'exceljs';

export async function GET(request: Request) {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });

    const serviceId = await getDynamicServiceId(session);
    const prisma = getServiceClient(serviceId);
    const userRole = (session.user as any).role;

    if (userRole !== 'ADMIN' && userRole !== 'SUPER_ADMIN') {
        return NextResponse.json({ error: 'Accès réservé aux administrateurs' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const gestionnaireId = searchParams.get('gestionnaireId');

    const where: any = {};
    if (gestionnaireId) where.gestionnaireId = gestionnaireId;
    if (startDate || endDate) {
        where.date = {};
        if (startDate) where.date.gte = new Date(startDate);
        if (endDate) where.date.lte = new Date(endDate);
    }

    try {
        const prestations = await prisma.prestation.findMany({
            where,
            include: { gestionnaire: { select: { prenom: true, nom: true } } },
            orderBy: [
                { gestionnaire: { prenom: 'asc' } },
                { date: 'desc' }
            ]
        });

        const workbook = new ExcelJS.Workbook();
        workbook.creator = 'SocialConnect';
        workbook.created = new Date();

        const detailSheet = workbook.addWorksheet('Prestations Détaillées', { views: [{ state: 'frozen', ySplit: 1 }] });
        detailSheet.columns = [
            { header: 'Date', key: 'date', width: 12 },
            { header: 'Gestionnaire', key: 'gestionnaire', width: 20 },
            { header: 'Début', key: 'debut', width: 8 },
            { header: 'Fin', key: 'fin', width: 8 },
            { header: 'Pause (min)', key: 'pause', width: 12 },
            { header: 'Durée Nette (min)', key: 'dureeNet', width: 16 },
            { header: 'Bonis (min)', key: 'bonis', width: 12 },
            { header: 'Motif', key: 'motif', width: 25 },
            { header: 'Commentaire', key: 'commentaire', width: 35 },
        ];

        const headerRow = detailSheet.getRow(1);
        headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
        headerRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1E3A5F' } };
        headerRow.alignment = { vertical: 'middle', horizontal: 'center' };
        headerRow.height = 25;

        prestations.forEach((p, index) => {
            const row = detailSheet.addRow({
                date: new Date(p.date).toLocaleDateString('fr-BE'),
                gestionnaire: `${p.gestionnaire.prenom} ${p.gestionnaire.nom || ''}`.trim(),
                debut: p.heureDebut,
                fin: p.heureFin,
                pause: p.pause,
                dureeNet: p.dureeNet,
                bonis: p.bonis,
                motif: p.motif,
                commentaire: p.commentaire || ''
            });
            if (index % 2 === 1) row.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF5F5F5' } };
        });

        const summarySheet = workbook.addWorksheet('Synthèse par Gestionnaire');
        summarySheet.columns = [
            { header: 'Gestionnaire', key: 'gestionnaire', width: 25 },
            { header: 'Total Heures', key: 'totalHeures', width: 15 },
            { header: 'Total Bonis (min)', key: 'totalBonis', width: 18 },
            { header: 'Nb Prestations', key: 'nbPrestations', width: 15 },
        ];

        const summaryHeader = summarySheet.getRow(1);
        summaryHeader.font = { bold: true, color: { argb: 'FFFFFFFF' } };
        summaryHeader.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF2E7D32' } };
        summaryHeader.alignment = { vertical: 'middle', horizontal: 'center' };
        summaryHeader.height = 25;

        const summaryMap = new Map<string, { totalMinutes: number; totalBonis: number; count: number }>();
        prestations.forEach(p => {
            const name = `${p.gestionnaire.prenom} ${p.gestionnaire.nom || ''}`.trim();
            const existing = summaryMap.get(name) || { totalMinutes: 0, totalBonis: 0, count: 0 };
            summaryMap.set(name, { totalMinutes: existing.totalMinutes + p.dureeNet, totalBonis: existing.totalBonis + p.bonis, count: existing.count + 1 });
        });

        let rowIndex = 0;
        summaryMap.forEach((data, name) => {
            const hours = Math.floor(data.totalMinutes / 60);
            const minutes = data.totalMinutes % 60;
            const row = summarySheet.addRow({
                gestionnaire: name,
                totalHeures: `${hours}h${minutes.toString().padStart(2, '0')}`,
                totalBonis: data.totalBonis,
                nbPrestations: data.count
            });
            if (rowIndex % 2 === 1) row.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF5F5F5' } };
            rowIndex++;
        });

        const buffer = await workbook.xlsx.writeBuffer();
        const filename = `Prestations_${new Date().toISOString().slice(0, 10)}.xlsx`;

        return new NextResponse(buffer, {
            status: 200,
            headers: {
                'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                'Content-Disposition': `attachment; filename="${filename}"`,
            },
        });
    } catch (error: any) {
        return NextResponse.json({ error: 'Erreur lors de la génération de l\'export' }, { status: 500 });
    }
}
