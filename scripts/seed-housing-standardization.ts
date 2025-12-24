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
            const valueToUse = label; // KEEPING VALUE = LABEL for backward compatibility

            // Vérifier si l'option existe déjà
            const existing = await prisma.dropdownOption.findFirst({
                where: {
                    type: category,
                    value: valueToUse,
                    serviceId: 'default'
                }
            });

            if (existing) {
                // Mettre à jour le label si nécessaire
                await prisma.dropdownOption.update({
                    where: { id: existing.id },
                    data: { label: label }
                });
            } else {
                // Créer l'option
                await prisma.dropdownOption.create({
                    data: {
                        type: category,
                        value: valueToUse,
                        label: label,
                        serviceId: 'default'
                    }
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
