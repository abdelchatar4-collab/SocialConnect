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
        'RI (famille)', // Note: User asked to check for duplicates, but listed both. Keeping both for now as requested.
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

            await prisma.dropdownOption.upsert({
                where: {
                    type_value: {
                        type: category,
                        value: value
                    }
                },
                update: {
                    label: label
                },
                create: {
                    type: category,
                    value: value,
                    label: label
                }
            });
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
