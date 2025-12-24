/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect est un logiciel libre : vous pouvez le redistribuer et/ou le modifier selon les termes de la Licence Publique Générale GNU telle que publiée par la Free Software Foundation, soit la version 3 de la licence, soit (à votre convenance) toute version ultérieure.

Ce programme est distribué dans l'espoir qu'il sera utile, mais SANS AUCUNE GARANTIE ; sans même la garantie implicite de COMMERCIALISATION ou d'ADÉQUATION À UN USAGE PARTICULIER. Voir la Licence Publique Générale GNU pour plus de détails.
*/

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const optionsToSeed = {
    prevExpTypeFamille: [
        'Famille avec au moins 1 enfant',
        'Isolé',
        'Cohabitant'
    ],
    prevExpTypeRevenu: [
        'Travail',
        'AC',
        'RI Famille',
        'RI (famille)',
        'Isolé'
    ],
    prevExpEtatLogement: [
        'Insalubre',
        'Bon état',
        'Trop petit'
    ],
    prevExpNombreChambre: [
        '1',
        '2',
        '3',
        '4',
        '5'
    ],
    prevExpAideJuridique: [
        'BAJ',
        'Avocat privé'
    ]
};

async function main() {
    console.log('Start seeding PrevExp extension options...');

    for (const [category, labels] of Object.entries(optionsToSeed)) {
        console.log(`Seeding category: ${category}`);
        for (const label of labels) {
            const value = label.toLowerCase().replace(/\s+/g, '_').replace(/'/g, '').replace(/[()]/g, '');

            const existing = await prisma.dropdownOption.findFirst({
                where: { type: category, value: value, serviceId: 'default' }
            });

            if (existing) {
                await prisma.dropdownOption.update({
                    where: { id: existing.id },
                    data: { label: label }
                });
            } else {
                await prisma.dropdownOption.create({
                    data: { type: category, value: value, label: label, serviceId: 'default' }
                });
            }
        }
    }

    console.log('Seeding finished.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
