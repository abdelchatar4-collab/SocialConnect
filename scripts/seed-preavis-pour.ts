/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect est un logiciel libre : vous pouvez le redistribuer et/ou le modifier selon les termes de la Licence Publique Générale GNU telle que publiée par la Free Software Foundation, soit la version 3 de la licence, soit (à votre convenance) toute version ultérieure.

Ce programme est distribué dans l'espoir qu'il sera utile, mais SANS AUCUNE GARANTIE ; sans même la garantie implicite de COMMERCIALISATION ou d'ADÉQUATION À UN USAGE PARTICULIER. Voir la Licence Publique Générale GNU pour plus de détails.
*/

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const optionsToSeed = {
    preavisPour: [
        'Travaux',
        'Occupation personnelle',
        'Sans motif'
    ]
};

async function main() {
    console.log('Start seeding Préavis Pour options...');

    for (const [category, labels] of Object.entries(optionsToSeed)) {
        console.log(`Seeding category: ${category}`);
        for (const label of labels) {
            const valueToUse = label; // Keeping value = label for backward compatibility

            await prisma.dropdownOption.upsert({
                where: {
                    type_value: {
                        type: category,
                        value: valueToUse
                    }
                },
                update: {
                    label: label
                },
                create: {
                    type: category,
                    value: valueToUse,
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
