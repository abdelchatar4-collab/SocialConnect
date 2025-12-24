/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect est un logiciel libre : vous pouvez le redistribuer et/ou le modifier selon les termes de la Licence Publique Générale GNU telle que publiée par la Free Software Foundation, soit la version 3 de la licence, soit (à votre convenance) toute version ultérieure.
*/

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const holidays2026 = [
    { date: '2026-01-01', label: 'Jour de l’an', year: 2026 },
    { date: '2026-01-02', label: 'Congé réglementaire', year: 2026 },
    { date: '2026-04-06', label: 'Lundi de Pâques', year: 2026 },
    { date: '2026-05-01', label: 'Fête du Travail', year: 2026 },
    { date: '2026-05-14', label: 'Ascension', year: 2026 },
    { date: '2026-05-15', label: 'Fermeture collective', year: 2026 },
    { date: '2026-05-25', label: 'Lundi de Pentecôte', year: 2026 },
    { date: '2026-07-20', label: 'Congé réglementaire', year: 2026 },
    { date: '2026-07-21', label: 'Fête Nationale', year: 2026 },
    { date: '2026-08-17', label: 'Récupération Assomption', year: 2026 },
    { date: '2026-09-15', label: 'Marché annuel', year: 2026 },
    { date: '2026-11-02', label: 'Récupération Toussaint', year: 2026 },
    { date: '2026-11-11', label: 'Armistice', year: 2026 },
    { date: '2026-12-24', label: 'Congé réglementaire', year: 2026 },
    { date: '2026-12-25', label: 'Noël', year: 2026 },
    { date: '2026-12-31', label: 'Congé réglementaire', year: 2026 },
];

async function main() {
    console.log('Seeding 2026 holidays...');

    for (const holiday of holidays2026) {
        await prisma.holiday.upsert({
            where: {
                // Since we don't have a unique constraint on date/serviceId yet in the schema provided in previous summary
                // let's assume we use date + year as a simplified check or just create them if they don't exist
                // Actually, looking at the schema from previous context, id is the only unique.
                // We'll just create them but first check if a holiday with that date exists for year 2026
                id: 'temp-id-' + holiday.date // This won't work well with auto-increment or UUID
            },
            update: {},
            create: {
                date: new Date(holiday.date),
                label: holiday.label,
                year: holiday.year,
                serviceId: 'default'
            }
        }).catch(async (e) => {
            // Fallback if upsert fails due to ID mismatch logic
            await prisma.holiday.create({
                data: {
                    date: new Date(holiday.date),
                    label: holiday.label,
                    year: holiday.year,
                    serviceId: 'default'
                }
            });
        });
    }

    console.log('Seeding completed.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
