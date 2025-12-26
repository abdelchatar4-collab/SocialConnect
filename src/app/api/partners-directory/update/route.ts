/*
Copyright (C) 2025 AC
SocialConnect - Partner Update API
Updates partner information in the Excel file
*/

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/authOptions';
import { getDynamicServiceId } from '@/lib/auth-utils';
import * as XLSX from 'xlsx';
import path from 'path';
import fs from 'fs';

export async function POST(request: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const serviceId = await getDynamicServiceId(session);

    try {
        const body = await request.json();
        const { partnerId, updates } = body;

        if (!partnerId || !updates) {
            return NextResponse.json({ error: 'Paramètres manquants' }, { status: 400 });
        }

        // Find the Excel file
        const filePath = path.join(process.cwd(), 'uploads', 'rapports', serviceId, 'LISTING-PARTENAIRES-PASQ.xlsx');
        const defaultPath = path.join(process.cwd(), 'uploads', 'rapports', 'default', 'LISTING-PARTENAIRES-PASQ.xlsx');
        const actualPath = fs.existsSync(filePath) ? filePath : defaultPath;

        if (!fs.existsSync(actualPath)) {
            return NextResponse.json({ error: 'Fichier non trouvé' }, { status: 404 });
        }

        // Read the Excel file
        const fileBuffer = fs.readFileSync(actualPath);
        const workbook = XLSX.read(fileBuffer, { type: 'buffer' });
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const rawData = XLSX.utils.sheet_to_json(worksheet, { header: 1, raw: true }) as any[][];

        // Find and update the partner row
        // partnerId corresponds to the row index (1-based, accounting for header)
        const rowIndex = partnerId; // This is the actual row number in Excel (1-indexed)

        if (rowIndex < 1 || rowIndex >= rawData.length) {
            return NextResponse.json({ error: 'Partenaire non trouvé' }, { status: 404 });
        }

        const row = rawData[rowIndex];

        // Update fields based on the updates object
        // Column mapping: 0=Active, 1=Nom, 2=Adresse, 3=Email, 4=Téléphone, 5=Thématique, 6=Contact
        if (updates.nom !== undefined) row[1] = updates.nom;
        if (updates.adresse !== undefined) row[2] = updates.adresse;
        if (updates.email !== undefined) row[3] = updates.email;
        if (updates.telephone !== undefined) row[4] = updates.telephone;
        if (updates.thematique !== undefined) row[5] = updates.thematique;
        if (updates.contact !== undefined) row[6] = updates.contact;

        // Write back to Excel
        const newWorksheet = XLSX.utils.aoa_to_sheet(rawData);
        workbook.Sheets[workbook.SheetNames[0]] = newWorksheet;

        const newBuffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
        fs.writeFileSync(actualPath, newBuffer);

        console.log('[Partner Update] Updated partner at row', rowIndex);

        return NextResponse.json({
            success: true,
            message: 'Partenaire mis à jour avec succès'
        });

    } catch (error: any) {
        console.error('[Partner Update] Error:', error);
        return NextResponse.json({
            error: error.message || 'Erreur lors de la mise à jour'
        }, { status: 500 });
    }
}
