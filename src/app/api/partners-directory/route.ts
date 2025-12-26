/*
Copyright (C) 2025 AC
SocialConnect - Partners Directory API
Reads partner data from the Excel file in the document library
*/

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/authOptions';
import { getDynamicServiceId } from '@/lib/auth-utils';
import * as XLSX from 'xlsx';
import path from 'path';
import fs from 'fs';

interface Partner {
    id: number;
    nom: string;
    adresse: string;
    email: string;
    telephone: string;
    thematique: string;
    contact: string;
    isActive: boolean;
}

interface PartnerGroup {
    thematique: string;
    partenaires: Partner[];
    count: number;
}

export async function GET(request: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const serviceId = await getDynamicServiceId(session);

    try {
        // Path to the Excel file in uploads (Strict Isolation)
        const reportsDir = path.join(process.cwd(), 'uploads', 'rapports', serviceId);

        console.log('[Partners API] Service ID:', serviceId);
        console.log('[Partners API] Scanning directory:', reportsDir);

        if (!fs.existsSync(reportsDir)) {
            return NextResponse.json({
                error: 'Répertoire du service non trouvé',
                groups: [],
                total: 0
            }, { status: 404 });
        }

        // Find any file matching LISTING-PARTENAIRES*.xlsx
        const files = fs.readdirSync(reportsDir);
        // Filter specifically for partner files
        const partnerFiles = files.filter(f => f.toUpperCase().startsWith('LISTING-PARTENAIRES') && f.toUpperCase().endsWith('.XLSX'));

        // Sort descending (Z to A) so if multiple exist, we likely get the "latest" (e.g. V2 > V1)
        partnerFiles.sort((a, b) => b.localeCompare(a));

        const partnerFile = partnerFiles[0];

        if (!partnerFile) {
            console.log('[Partners API] No partner listing file found for this service.');
            return NextResponse.json({
                error: 'Fichier partenaires non trouvé pour ce service',
                groups: [],
                total: 0
            }, { status: 404 });
        }

        const actualPath = path.join(reportsDir, partnerFile);
        console.log('[Partners API] Found file:', actualPath);

        // Read Excel file
        console.log('[Partners API] Reading file...');
        const fileBuffer = fs.readFileSync(actualPath);
        const workbook = XLSX.read(fileBuffer, { type: 'buffer' });
        console.log('[Partners API] Workbook sheets:', workbook.SheetNames);
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const rawData = XLSX.utils.sheet_to_json(worksheet, { header: 1, raw: true }) as any[][];
        console.log('[Partners API] Raw data rows:', rawData.length);

        // Process data
        const partners: Partner[] = [];
        let currentThematique = '';
        let id = 1;

        // Skip header row (index 0)
        for (let i = 1; i < rawData.length; i++) {
            const row = rawData[i];
            if (!row || row.length === 0) continue;

            const isActive = row[0]?.toString().toLowerCase() === 'x';
            const nom = row[1]?.toString()?.trim() || '';
            const adresse = row[2]?.toString()?.trim() || '';
            const email = row[3]?.toString()?.trim() || '';
            const telephone = row[4]?.toString()?.trim() || '';
            const thematique = row[5]?.toString()?.trim() || '';
            const contact = row[6]?.toString()?.trim() || '';

            // Check if this is a thematique header row (no name but has email column filled as thematique)
            if (!nom && email && !adresse && !telephone) {
                currentThematique = email.toUpperCase();
                continue;
            }

            // Skip empty rows
            if (!nom) continue;

            partners.push({
                id: id++,
                nom,
                adresse,
                email: email.includes('@') ? email : '',
                telephone,
                thematique: thematique || currentThematique,
                contact,
                isActive
            });
        }

        // Group by thematique
        const groupsMap = new Map<string, Partner[]>();

        for (const partner of partners) {
            const key = partner.thematique || 'Autres';
            if (!groupsMap.has(key)) {
                groupsMap.set(key, []);
            }
            groupsMap.get(key)!.push(partner);
        }

        // Convert to array and sort
        const groups: PartnerGroup[] = Array.from(groupsMap.entries())
            .map(([thematique, partenaires]) => ({
                thematique,
                partenaires: partenaires.sort((a, b) => a.nom.localeCompare(b.nom)),
                count: partenaires.length
            }))
            .sort((a, b) => a.thematique.localeCompare(b.thematique));

        return NextResponse.json({
            groups,
            total: partners.length,
            lastModified: fs.statSync(actualPath).mtime.toISOString()
        });

    } catch (error: any) {
        console.error('Error reading partners file:', error);
        return NextResponse.json({
            error: 'Erreur lors de la lecture du fichier',
            details: error.message
        }, { status: 500 });
    }
}
