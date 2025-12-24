/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect - Official Format Excel Export (Employer Template)
*/

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/authOptions';
import ExcelJS from 'exceljs';

// Mapping des motifs vers les codes officiels bilingues
const MOTIF_TO_CODE: Record<string, string> = {
    'Présence': 'P/A',
    'Télétravail': 'TT',
    'Congé': 'C/V',
    'Congé VA': 'C/V',
    'Congé CH': 'C/V',
    'Maladie': 'M/Z',
    'Jour férié': 'JF/FD',
    'Formation': 'F/V',
    'Réunion externe': 'P/A',
    'Heures supp': 'P/A',
    'Prestation normale': 'P/A',
};

const MONTH_NAMES = [
    'janvier', 'février', 'mars', 'avril', 'mai', 'juin',
    'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'
];

const MONTH_NAMES_BILINGUAL = [
    'JANVIER/JANUARI', 'FÉVRIER/FEBRUARI', 'MARS/MAART', 'AVRIL/APRIL',
    'MAI/MEI', 'JUIN/JUNI', 'JUILLET/JULI', 'AOÛT/AUGUSTUS',
    'SEPTEMBRE/SEPTEMBER', 'OCTOBRE/OKTOBER', 'NOVEMBRE/NOVEMBER', 'DÉCEMBRE/DECEMBER'
];

// Helper to format date as YYYY-MM-DD without timezone issues
const formatDate = (d: Date): string => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

/**
 * GET /api/prestations/export-official
 * Generates an Excel file in the official employer format.
 * Query params: year (default: current year)
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
    const year = parseInt(searchParams.get('year') || new Date().getFullYear().toString());

    try {
        // Fetch all prestations for the year
        const startOfYear = new Date(year, 0, 1);
        const endOfYear = new Date(year, 11, 31, 23, 59, 59);

        const prestations = await (prisma as any).prestation.findMany({
            where: {
                serviceId: currentUser.serviceId,
                date: {
                    gte: startOfYear,
                    lte: endOfYear
                }
            },
            include: {
                gestionnaire: {
                    select: { id: true, prenom: true, nom: true }
                }
            },
            orderBy: { date: 'asc' }
        });

        // Get all gestionnaires for this service
        const gestionnaires = await prisma.gestionnaire.findMany({
            where: { serviceId: currentUser.serviceId },
            select: { id: true, prenom: true, nom: true },
            orderBy: { prenom: 'asc' }
        });

        // Create workbook
        const workbook = new ExcelJS.Workbook();
        workbook.creator = 'SocialConnect - Export Officiel';
        workbook.created = new Date();

        // Create a sheet for each month
        for (let month = 0; month < 12; month++) {
            const sheet = workbook.addWorksheet(MONTH_NAMES[month], {
                views: [{ state: 'frozen', xSplit: 1, ySplit: 4 }]
            });

            const daysInMonth = new Date(year, month + 1, 0).getDate();

            // Row 1: Month title
            sheet.mergeCells(1, 1, 1, daysInMonth + 1);
            const titleCell = sheet.getCell(1, 1);
            titleCell.value = MONTH_NAMES_BILINGUAL[month];
            titleCell.font = { bold: true, size: 14 };
            titleCell.alignment = { horizontal: 'center' };
            titleCell.fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'FF1E3A5F' }
            };
            titleCell.font = { bold: true, size: 14, color: { argb: 'FFFFFFFF' } };

            // Row 2: Empty
            // Row 3: Legend
            sheet.getCell(3, 1).value = "Motifs d'absence/présence";
            sheet.getCell(3, 1).font = { bold: true, size: 9 };

            // Add legend items
            const legendItems = [
                { code: 'C/V', label: 'Congé/Verlof' },
                { code: 'M/Z', label: 'Maladie/Ziekte' },
                { code: 'TT', label: 'Télétravail/Telewerk' },
                { code: 'F/V', label: 'Formation/Vorming' },
                { code: 'JF/FD', label: 'Jour férié/Feestdag' },
                { code: 'P/A', label: 'Présence/Aanwezigheid' },
            ];

            let legendCol = 2;
            legendItems.forEach(item => {
                sheet.getCell(3, legendCol).value = item.code;
                sheet.getCell(3, legendCol).font = { bold: true, size: 8 };
                sheet.getCell(3, legendCol + 1).value = item.label;
                sheet.getCell(3, legendCol + 1).font = { italic: true, size: 8 };
                legendCol += 3;
            });

            // Row 4: Day numbers header
            sheet.getCell(4, 1).value = 'Service/Dienst:';
            sheet.getCell(4, 1).font = { bold: true };
            for (let day = 1; day <= daysInMonth; day++) {
                const cell = sheet.getCell(4, day + 1);
                cell.value = day;
                cell.font = { bold: true };
                cell.alignment = { horizontal: 'center' };

                // Check if weekend
                const date = new Date(year, month, day);
                if (date.getDay() === 0 || date.getDay() === 6) {
                    cell.fill = {
                        type: 'pattern',
                        pattern: 'solid',
                        fgColor: { argb: 'FFE0E0E0' }
                    };
                }
            }

            // Set column widths
            sheet.getColumn(1).width = 25;
            for (let day = 1; day <= daysInMonth; day++) {
                sheet.getColumn(day + 1).width = 5;
            }

            // Add employees
            let currentRow = 5;
            gestionnaires.forEach(gestionnaire => {
                const fullName = `${gestionnaire.prenom} ${gestionnaire.nom || ''}`.trim();

                // Name row
                sheet.getCell(currentRow, 1).value = fullName;
                sheet.getCell(currentRow, 1).font = { bold: true };

                // Fill in codes for each day
                for (let day = 1; day <= daysInMonth; day++) {
                    const date = new Date(year, month, day);
                    const dateStr = formatDate(date);

                    // Find prestation for this day
                    const prestation = prestations.find((p: any) =>
                        p.gestionnaireId === gestionnaire.id &&
                        formatDate(new Date(p.date)) === dateStr
                    );

                    const cell = sheet.getCell(currentRow, day + 1);

                    if (prestation) {
                        const code = MOTIF_TO_CODE[prestation.motif] || 'P/A';
                        cell.value = code;
                        cell.alignment = { horizontal: 'center' };
                        cell.font = { size: 9 };
                    }

                    // Weekend styling
                    if (date.getDay() === 0 || date.getDay() === 6) {
                        cell.fill = {
                            type: 'pattern',
                            pattern: 'solid',
                            fgColor: { argb: 'FFE0E0E0' }
                        };
                    }
                }

                // Remarks row
                currentRow++;
                sheet.getCell(currentRow, 1).value = 'Remarques';
                sheet.getCell(currentRow, 1).font = { italic: true, size: 9, color: { argb: 'FF666666' } };

                // Fill remarks with comments if any
                for (let day = 1; day <= daysInMonth; day++) {
                    const date = new Date(year, month, day);
                    const dateStr = formatDate(date);

                    const prestation = prestations.find((p: any) =>
                        p.gestionnaireId === gestionnaire.id &&
                        formatDate(new Date(p.date)) === dateStr
                    );

                    if (prestation?.commentaire) {
                        const cell = sheet.getCell(currentRow, day + 1);
                        cell.value = '*';
                        cell.alignment = { horizontal: 'center' };
                        cell.note = prestation.commentaire;
                    }
                }

                currentRow++;
            });

            // Add borders
            for (let row = 4; row < currentRow; row++) {
                for (let col = 1; col <= daysInMonth + 1; col++) {
                    sheet.getCell(row, col).border = {
                        top: { style: 'thin', color: { argb: 'FFD0D0D0' } },
                        left: { style: 'thin', color: { argb: 'FFD0D0D0' } },
                        bottom: { style: 'thin', color: { argb: 'FFD0D0D0' } },
                        right: { style: 'thin', color: { argb: 'FFD0D0D0' } }
                    };
                }
            }
        }

        // Generate buffer
        const buffer = await workbook.xlsx.writeBuffer();

        const filename = `Enregistrement_Temps_Travail_${year}.xlsx`;

        return new NextResponse(buffer, {
            status: 200,
            headers: {
                'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                'Content-Disposition': `attachment; filename="${filename}"`,
            },
        });

    } catch (error: any) {
        console.error('Error generating official Excel export:', error);
        return NextResponse.json({
            error: 'Erreur lors de la génération de l\'export officiel',
            details: error.message
        }, { status: 500 });
    }
}
