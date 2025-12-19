/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect est un logiciel libre : vous pouvez le redistribuer et/ou le modifier selon les termes de la Licence Publique Générale GNU telle que publiée par la Free Software Foundation, soit la version 3 de la licence, soit (à votre convenance) toute version ultérieure.

Ce programme est distribué dans l'espoir qu'il sera utile, mais SANS AUCUNE GARANTIE ; sans même la garantie implicite de COMMERCIALISATION ou d'ADÉQUATION À UN USAGE PARTICULIER. Voir la Licence Publique Générale GNU pour plus de détails.
*/

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const optionsToSeed = {
    statutGarantie: [
        'Versée',
        'Non versée',
        'Partiellement versée',
        'Restituée',
        'En cours de restitution',
        'Non applicable'
    ],
    bailEnregistre: [
        'Oui',
        'Non',
        'En cours',
        'Non applicable'
    ],
    dureeContrat: [
        '1 an',
        '3 ans',
        '9 ans',
        'Durée indéterminée',
        'Autre'
    ],
    typeLitige: [
        'Loyer impayé',
        'Insalubrité',
        'Conflit avec propriétaire',
        'Dégâts locatifs',
        'Autre'
    ],
    dureePreavis: [
        '1 mois',
        '2 mois',
        '3 mois',
        '6 mois',
        'Autre'
    ]
};

async function main() {
    console.log('Start seeding Housing Standardization options...');

    for (const [category, labels] of Object.entries(optionsToSeed)) {
        console.log(`Seeding category: ${category}`);
        for (const label of labels) {
            // Keep the value simple but unique enough.
            // For 'Oui'/'Non', value will be 'oui'/'non'.
            // For others, standard slugification.
            const value = label.toLowerCase()
                .replace(/\s+/g, '_')
                .replace(/'/g, '')
                .replace(/[()]/g, '')
                .replace(/é/g, 'e')
                .replace(/è/g, 'e')
                .replace(/ê/g, 'e')
                .replace(/à/g, 'a')
                .replace(/ç/g, 'c')
                .replace(/î/g, 'i');

            // Special case handling to match existing data if necessary,
            // but here we are standardizing. The existing data in DB might be just the label string
            // if it was a text input or select with value=label.
            // In HousingStep.tsx, values were often same as labels (e.g. value: 'Versée', label: 'Versée').
            // So we should probably use the LABEL as the VALUE for backward compatibility
            // if the current DB stores the label.
            // However, best practice is to use a code.
            // BUT, to avoid migration issues with existing records that have "Versée" stored,
            // we should probably keep value = label for now OR ensure the frontend handles the mapping.
            // The user asked to "not break existing values".
            // If the DB stores "Versée", and we change the option value to "versee",
            // the select input won't show the selected value for existing records unless we migrate the data too.
            // To be safe and simple: Use the exact string from the hardcoded list as the value.

            const valueToUse = label; // KEEPING VALUE = LABEL for backward compatibility with existing text data

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
