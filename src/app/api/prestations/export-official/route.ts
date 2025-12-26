/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect - Official Format Excel Export (Employer Template)
*/

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { getServiceClient } from '@/lib/prisma-clients';
import { getDynamicServiceId } from '@/lib/auth-utils';
import { authOptions } from '@/lib/authOptions';
import ExcelJS from 'exceljs';

const MOTIF_TO_CODE: Record<string, string> = {
    'Présence': 'P/A', 'Télétravail': 'TT', 'Congé': 'C/V', 'Congé VA': 'C/V', 'Congé CH': 'C/V',
    'Maladie': 'M/Z', 'Jour férié': 'JF/FD', 'Formation': 'F/V', 'Réunion externe': 'P/A',
    'Heures supp': 'P/A', 'Prestation normale': 'P/A',
};

const MONTH_NAMES = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];
const MONTH_NAMES_BILINGUAL = ['JANVIER/JANUARI', 'FÉVRIER/FEBRUARI', 'MARS/MAART', 'AVRIL/APRIL', 'MAI/MEI', 'JUIN/JUNI', 'JUILLET/JULI', 'AOÛT/AUGUSTUS', 'SEPTEMBRE/SEPTEMBER', 'OCTOBRE/OKTOBER', 'NOVEMBRE/NOVEMBER', 'DÉCEMBRE/DECEMBER'];

const formatDate = (d: Date): string => {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

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
    const year = parseInt(searchParams.get('year') || new Date().getFullYear().toString());

    try {
        const startOfYear = new Date(year, 0, 1);
        const endOfYear = new Date(year, 11, 31, 23, 59, 59);

        const prestations = await prisma.prestation.findMany({
            where: { date: { gte: startOfYear, lte: endOfYear } },
            include: { gestionnaire: { select: { id: true, prenom: true, nom: true } } },
            orderBy: { date: 'asc' }
        });

        const gestionnaires = await prisma.gestionnaire.findMany({
            where: { isActive: true },
            select: { id: true, prenom: true, nom: true },
            orderBy: { prenom: 'asc' }
        });

        const workbook = new ExcelJS.Workbook();
        workbook.creator = 'SocialConnect - Export Officiel';
        workbook.created = new Date();

        for (let month = 0; month < 12; month++) {
            const sheet = workbook.addWorksheet(MONTH_NAMES[month], { views: [{ state: 'frozen', xSplit: 1, ySplit: 4 }] });
            const daysInMonth = new Date(year, month + 1, 0).getDate();

            sheet.mergeCells(1, 1, 1, daysInMonth + 1);
            const titleCell = sheet.getCell(1, 1);
            titleCell.value = MONTH_NAMES_BILINGUAL[month];
            titleCell.font = { bold: true, size: 14, color: { argb: 'FFFFFFFF' } };
            titleCell.alignment = { horizontal: 'center' };
            titleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1E3A5F' } };

            sheet.getCell(3, 1).value = "Motifs d'absence/présence";
            sheet.getCell(3, 1).font = { bold: true, size: 9 };

            const legendItems = [
                { code: 'C/V', label: 'Congé/Verlof' }, { code: 'M/Z', label: 'Maladie/Ziekte' },
                { code: 'TT', label: 'Télétravail/Telewerk' }, { code: 'F/V', label: 'Formation/Vorming' },
                { code: 'JF/FD', label: 'Jour férié/Feestdag' }, { code: 'P/A', label: 'Présence/Aanwezigheid' },
            ];

            let legendCol = 2;
            legendItems.forEach(item => {
                sheet.getCell(3, legendCol).value = item.code;
                sheet.getCell(3, legendCol).font = { bold: true, size: 8 };
                sheet.getCell(3, legendCol + 1).value = item.label;
                sheet.getCell(3, legendCol + 1).font = { italic: true, size: 8 };
                legendCol += 3;
            });

            sheet.getCell(4, 1).value = 'Service/Dienst:';
            sheet.getCell(4, 1).font = { bold: true };
            for (let day = 1; day <= daysInMonth; day++) {
                const cell = sheet.getCell(4, day + 1);
                cell.value = day;
                cell.font = { bold: true };
                cell.alignment = { horizontal: 'center' };
                const date = new Date(year, month, day);
                if (date.getDay() === 0 || date.getDay() === 6) cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE0E0E0' } };
            }

            sheet.getColumn(1).width = 25;
            for (let day = 1; day <= daysInMonth; day++) sheet.getColumn(day + 1).width = 5;

            let currentRow = 5;
            gestionnaires.forEach(gestionnaire => {
                const fullName = `${gestionnaire.prenom} ${gestionnaire.nom || ''}`.trim();
                sheet.getCell(currentRow, 1).value = fullName;
                sheet.getCell(currentRow, 1).font = { bold: true };

                for (let day = 1; day <= daysInMonth; day++) {
                    const date = new Date(year, month, day);
                    const dateStr = formatDate(date);
                    const p = prestations.find((p: any) => p.gestionnaireId === gestionnaire.id && formatDate(new Date(p.date)) === dateStr);
                    const cell = sheet.getCell(currentRow, day + 1);
                    if (p) {
                        cell.value = MOTIF_TO_CODE[p.motif] || 'P/A';
                        cell.alignment = { horizontal: 'center' };
                        cell.font = { size: 9 };
                    }
                    if (date.getDay() === 0 || date.getDay() === 6) cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE0E0E0' } };
                }
                currentRow++;
                sheet.getCell(currentRow, 1).value = 'Remarques';
                sheet.getCell(currentRow, 1).font = { italic: true, size: 9, color: { argb: 'FF666666' } };
                for (let day = 1; day <= daysInMonth; day++) {
                    const date = new Date(year, month, day);
                    const dateStr = formatDate(date);
                    const p = prestations.find((p: any) => p.gestionnaireId === gestionnaire.id && formatDate(new Date(p.date)) === dateStr);
                    if (p?.commentaire) {
                        const cell = sheet.getCell(currentRow, day + 1);
                        cell.value = '*';
                        cell.alignment = { horizontal: 'center' };
                        cell.note = p.commentaire;
                    }
                }
                currentRow++;
            });
        }

        const buffer = await workbook.xlsx.writeBuffer();
        return new NextResponse(buffer, {
            status: 200,
            headers: {
                'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                'Content-Disposition': `attachment; filename="Enregistrement_Temps_Travail_${year}.xlsx"`,
            },
        });
    } catch (error: any) {
        return NextResponse.json({ error: 'Erreur lors de la génération de l\'export officiel' }, { status: 500 });
    }
}
