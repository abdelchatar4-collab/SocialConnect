/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect est un logiciel libre : vous pouvez le redistribuer et/ou le modifier
*/

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/authOptions';
import ExcelJS from 'exceljs';

/**
 * GET /api/prestations/export
 * Generates and returns an Excel file with prestations data.
 * Query params: startDate, endDate, gestionnaireId
 */
export async function GET(request: Request) {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
        return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    // Only admins can export
    const currentUser = await prisma.gestionnaire.findUnique({
        where: { email: session.user.email as string }
    });

    if (!currentUser || (currentUser.role !== 'ADMIN' && currentUser.role !== 'SUPER_ADMIN')) {
        return NextResponse.json({ error: 'Accès réservé aux administrateurs' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const gestionnaireId = searchParams.get('gestionnaireId');

    // Build query
    const where: any = {
        serviceId: currentUser.serviceId
    };

    if (gestionnaireId) {
        where.gestionnaireId = gestionnaireId;
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
                    select: { prenom: true, nom: true }
                }
            },
            orderBy: [
                { gestionnaire: { prenom: 'asc' } },
                { date: 'desc' }
            ]
        });

        // Create workbook
        const workbook = new ExcelJS.Workbook();
        workbook.creator = 'SocialConnect';
        workbook.created = new Date();

        // ===== SHEET 1: Detailed Prestations =====
        const detailSheet = workbook.addWorksheet('Prestations Détaillées', {
            views: [{ state: 'frozen', ySplit: 1 }]
        });

        // Define columns
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

        // Style header row
        const headerRow = detailSheet.getRow(1);
        headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
        headerRow.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FF1E3A5F' } // Dark blue
        };
        headerRow.alignment = { vertical: 'middle', horizontal: 'center' };
        headerRow.height = 25;

        // Add data rows
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

            // Alternate row colors
            if (index % 2 === 1) {
                row.fill = {
                    type: 'pattern',
                    pattern: 'solid',
                    fgColor: { argb: 'FFF5F5F5' }
                };
            }
        });

        // Add borders to all cells
        detailSheet.eachRow((row, rowNumber) => {
            row.eachCell((cell) => {
                cell.border = {
                    top: { style: 'thin', color: { argb: 'FFE0E0E0' } },
                    left: { style: 'thin', color: { argb: 'FFE0E0E0' } },
                    bottom: { style: 'thin', color: { argb: 'FFE0E0E0' } },
                    right: { style: 'thin', color: { argb: 'FFE0E0E0' } }
                };
            });
        });

        // ===== SHEET 2: Summary by Gestionnaire =====
        const summarySheet = workbook.addWorksheet('Synthèse par Gestionnaire');

        summarySheet.columns = [
            { header: 'Gestionnaire', key: 'gestionnaire', width: 25 },
            { header: 'Total Heures', key: 'totalHeures', width: 15 },
            { header: 'Total Bonis (min)', key: 'totalBonis', width: 18 },
            { header: 'Nb Prestations', key: 'nbPrestations', width: 15 },
        ];

        // Style header
        const summaryHeader = summarySheet.getRow(1);
        summaryHeader.font = { bold: true, color: { argb: 'FFFFFFFF' } };
        summaryHeader.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FF2E7D32' } // Green
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

        // Add summary rows
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

            if (rowIndex % 2 === 1) {
                row.fill = {
                    type: 'pattern',
                    pattern: 'solid',
                    fgColor: { argb: 'FFF5F5F5' }
                };
            }
            rowIndex++;
        });

        // Add total row
        const totalMinutes = Array.from(summaryMap.values()).reduce((sum, d) => sum + d.totalMinutes, 0);
        const totalBonis = Array.from(summaryMap.values()).reduce((sum, d) => sum + d.totalBonis, 0);
        const totalCount = Array.from(summaryMap.values()).reduce((sum, d) => sum + d.count, 0);
        const totalHours = Math.floor(totalMinutes / 60);
        const totalMins = totalMinutes % 60;

        const totalRow = summarySheet.addRow({
            gestionnaire: 'TOTAL',
            totalHeures: `${totalHours}h${totalMins.toString().padStart(2, '0')}`,
            totalBonis: totalBonis,
            nbPrestations: totalCount
        });
        totalRow.font = { bold: true };
        totalRow.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFFFF9C4' } // Yellow
        };

        // Generate buffer
        const buffer = await workbook.xlsx.writeBuffer();

        // Generate filename
        const now = new Date();
        const filename = `Prestations_${now.toISOString().slice(0, 10)}.xlsx`;

        return new NextResponse(buffer, {
            status: 200,
            headers: {
                'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                'Content-Disposition': `attachment; filename="${filename}"`,
            },
        });

    } catch (error: any) {
        console.error('Error generating Excel export:', error);
        return NextResponse.json({
            error: 'Erreur lors de la génération de l\'export',
            details: error.message
        }, { status: 500 });
    }
}
