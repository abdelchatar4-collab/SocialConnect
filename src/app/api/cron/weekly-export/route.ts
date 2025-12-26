/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect - Weekly Prestation Export Cron Job
*/

import { NextResponse } from 'next/server';
import { getGlobalClient } from '@/lib/prisma-clients';
import ExcelJS from 'exceljs';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

export async function POST(request: Request) {
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const prisma = getGlobalClient();
    try {
        const now = new Date();
        const dayOfWeek = now.getDay();
        const lastMonday = new Date(now);
        lastMonday.setDate(now.getDate() - dayOfWeek - 6);
        lastMonday.setHours(0, 0, 0, 0);

        const lastSunday = new Date(lastMonday);
        lastSunday.setDate(lastMonday.getDate() + 6);
        lastSunday.setHours(23, 59, 59, 999);

        const startOfYear = new Date(now.getFullYear(), 0, 1);
        const weekNumber = Math.ceil(((lastMonday.getTime() - startOfYear.getTime()) / 86400000 + startOfYear.getDay() + 1) / 7);

        const prestations = await prisma.prestation.findMany({
            where: { date: { gte: lastMonday, lte: lastSunday } },
            include: { gestionnaire: { select: { prenom: true, nom: true, service: { select: { name: true } } } } },
            orderBy: [{ gestionnaire: { prenom: 'asc' } }, { date: 'desc' }]
        });

        if (prestations.length === 0) return NextResponse.json({ message: 'Aucune prestation', weekNumber });

        const workbook = new ExcelJS.Workbook();
        workbook.creator = 'SocialConnect - Export Automatique';
        workbook.created = new Date();

        const detailSheet = workbook.addWorksheet('Prestations Détaillées', { views: [{ state: 'frozen', ySplit: 1 }] });
        detailSheet.columns = [
            { header: 'Date', key: 'date', width: 12 },
            { header: 'Service', key: 'service', width: 18 },
            { header: 'Gestionnaire', key: 'gestionnaire', width: 20 },
            { header: 'Début', key: 'debut', width: 8 },
            { header: 'Fin', key: 'fin', width: 8 },
            { header: 'Pause (min)', key: 'pause', width: 12 },
            { header: 'Durée Nette (min)', key: 'dureeNet', width: 16 },
            { header: 'Bonis (min)', key: 'bonis', width: 12 },
            { header: 'Motif', key: 'motif', width: 25 },
        ];

        const headerRow = detailSheet.getRow(1);
        headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
        headerRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1E3A5F' } };
        headerRow.alignment = { vertical: 'middle', horizontal: 'center' };
        headerRow.height = 25;

        prestations.forEach((p, index) => {
            const row = detailSheet.addRow({
                date: new Date(p.date).toLocaleDateString('fr-BE'),
                service: (p.gestionnaire as any)?.service?.name || 'N/A',
                gestionnaire: `${p.gestionnaire.prenom} ${p.gestionnaire.nom || ''}`.trim(),
                debut: p.heureDebut, fin: p.heureFin, pause: p.pause, dureeNet: p.dureeNet, bonis: p.bonis, motif: p.motif,
            });
            if (index % 2 === 1) row.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF5F5F5' } };
        });

        const buffer = await workbook.xlsx.writeBuffer();
        const filename = `Prestations_Semaine_${weekNumber.toString().padStart(2, '0')}_${now.getFullYear()}.xlsx`;
        const outputDir = path.join(process.cwd(), 'public', 'rapports', 'prestations');
        const outputPath = path.join(outputDir, filename);

        await mkdir(outputDir, { recursive: true });
        await writeFile(outputPath, Buffer.from(buffer));

        return NextResponse.json({ success: true, message: `Export généré`, filename, prestationsCount: prestations.length, weekNumber });
    } catch (error: any) {
        return NextResponse.json({ error: 'Erreur lors de la génération' }, { status: 500 });
    }
}
