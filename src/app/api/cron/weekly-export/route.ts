/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect - Weekly Prestation Export Cron Job
*/

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import ExcelJS from 'exceljs';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

/**
 * POST /api/cron/weekly-export
 * Generates weekly prestation export and saves to public/rapports/prestations/
 * Should be called by a cron job every Monday at 6:00 AM
 */
export async function POST(request: Request) {
    // Verify cron secret (optional, for security)
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        // Calculate last week's date range (Monday to Sunday)
        const now = new Date();
        const dayOfWeek = now.getDay();
        const lastMonday = new Date(now);
        lastMonday.setDate(now.getDate() - dayOfWeek - 6); // Go back to last Monday
        lastMonday.setHours(0, 0, 0, 0);

        const lastSunday = new Date(lastMonday);
        lastSunday.setDate(lastMonday.getDate() + 6);
        lastSunday.setHours(23, 59, 59, 999);

        // Get week number
        const startOfYear = new Date(now.getFullYear(), 0, 1);
        const weekNumber = Math.ceil(((lastMonday.getTime() - startOfYear.getTime()) / 86400000 + startOfYear.getDay() + 1) / 7);

        // Fetch prestations for last week (all services)
        const prestations = await prisma.prestation.findMany({
            where: {
                date: {
                    gte: lastMonday,
                    lte: lastSunday
                }
            },
            include: {
                gestionnaire: {
                    select: { prenom: true, nom: true, service: { select: { name: true } } }
                }
            },
            orderBy: [
                { gestionnaire: { prenom: 'asc' } },
                { date: 'desc' }
            ]
        });

        if (prestations.length === 0) {
            return NextResponse.json({
                message: 'Aucune prestation pour la semaine passée',
                weekNumber
            });
        }

        // Create workbook
        const workbook = new ExcelJS.Workbook();
        workbook.creator = 'SocialConnect - Export Automatique';
        workbook.created = new Date();

        // ===== SHEET 1: Detailed Prestations =====
        const detailSheet = workbook.addWorksheet('Prestations Détaillées', {
            views: [{ state: 'frozen', ySplit: 1 }]
        });

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

        // Style header row
        const headerRow = detailSheet.getRow(1);
        headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
        headerRow.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FF1E3A5F' }
        };
        headerRow.alignment = { vertical: 'middle', horizontal: 'center' };
        headerRow.height = 25;

        // Add data rows
        prestations.forEach((p, index) => {
            const row = detailSheet.addRow({
                date: new Date(p.date).toLocaleDateString('fr-BE'),
                service: (p.gestionnaire as any).service?.name || 'N/A',
                gestionnaire: `${p.gestionnaire.prenom} ${p.gestionnaire.nom || ''}`.trim(),
                debut: p.heureDebut,
                fin: p.heureFin,
                pause: p.pause,
                dureeNet: p.dureeNet,
                bonis: p.bonis,
                motif: p.motif,
            });

            if (index % 2 === 1) {
                row.fill = {
                    type: 'pattern',
                    pattern: 'solid',
                    fgColor: { argb: 'FFF5F5F5' }
                };
            }
        });

        // ===== SHEET 2: Summary =====
        const summarySheet = workbook.addWorksheet('Synthèse');

        summarySheet.columns = [
            { header: 'Gestionnaire', key: 'gestionnaire', width: 25 },
            { header: 'Total Heures', key: 'totalHeures', width: 15 },
            { header: 'Total Bonis (min)', key: 'totalBonis', width: 18 },
            { header: 'Nb Prestations', key: 'nbPrestations', width: 15 },
        ];

        const summaryHeader = summarySheet.getRow(1);
        summaryHeader.font = { bold: true, color: { argb: 'FFFFFFFF' } };
        summaryHeader.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FF2E7D32' }
        };
        summaryHeader.alignment = { vertical: 'middle', horizontal: 'center' };
        summaryHeader.height = 25;

        // Calculate summaries
        const summaryMap = new Map<string, { totalMinutes: number; totalBonis: number; count: number }>();
        prestations.forEach(p => {
            const name = `${p.gestionnaire.prenom} ${p.gestionnaire.nom || ''}`.trim();
            const existing = summaryMap.get(name) || { totalMinutes: 0, totalBonis: 0, count: 0 };
            summaryMap.set(name, {
                totalMinutes: existing.totalMinutes + p.dureeNet,
                totalBonis: existing.totalBonis + p.bonis,
                count: existing.count + 1
            });
        });

        summaryMap.forEach((data, name) => {
            const hours = Math.floor(data.totalMinutes / 60);
            const minutes = data.totalMinutes % 60;
            summarySheet.addRow({
                gestionnaire: name,
                totalHeures: `${hours}h${minutes.toString().padStart(2, '0')}`,
                totalBonis: data.totalBonis,
                nbPrestations: data.count
            });
        });

        // Generate buffer and save to file
        const buffer = await workbook.xlsx.writeBuffer();

        const filename = `Prestations_Semaine_${weekNumber.toString().padStart(2, '0')}_${now.getFullYear()}.xlsx`;
        const outputDir = path.join(process.cwd(), 'public', 'rapports', 'prestations');
        const outputPath = path.join(outputDir, filename);

        // Ensure directory exists
        await mkdir(outputDir, { recursive: true });

        // Write file
        await writeFile(outputPath, Buffer.from(buffer));

        return NextResponse.json({
            success: true,
            message: `Export généré avec succès`,
            filename,
            prestationsCount: prestations.length,
            weekNumber,
            dateRange: {
                start: lastMonday.toISOString().slice(0, 10),
                end: lastSunday.toISOString().slice(0, 10)
            }
        });

    } catch (error: any) {
        console.error('Error generating weekly export:', error);
        return NextResponse.json({
            error: 'Erreur lors de la génération de l\'export hebdomadaire',
            details: error.message
        }, { status: 500 });
    }
}
