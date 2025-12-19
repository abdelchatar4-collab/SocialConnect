/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect est un logiciel libre : vous pouvez le redistribuer et/ou le modifier selon les termes de la Licence Publique Générale GNU telle que publiée par la Free Software Foundation, soit la version 3 de la licence, soit (à votre convenance) toute version ultérieure.

Ce programme est distribué dans l'espoir qu'il sera utile, mais SANS AUCUNE GARANTIE ; sans même la garantie implicite de COMMERCIALISATION ou d'ADÉQUATION À UN USAGE PARTICULIER. Voir la Licence Publique Générale GNU pour plus de détails.
*/

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Ajout des options pour "Issue de l\'accompagnement"...');

    const options = [
        'Maintien dans le logement',
        'Relogement réussi',
        'Expulsion effective',
        'Abandon de la procédure',
        'Accord amiable avec le propriétaire',
        'En cours',
        'Dossier clôturé - Situation régularisée',
        'Dossier clôturé - Sans suite',
        'Transfert vers autre service',
        'Décès de l\'usager',
    ];

    let count = 0;

    for (const option of options) {
        try {
            await prisma.dropdownOption.create({
                data: {
                    type: 'prevExpDecision',
                    value: option.toLowerCase().replace(/\s+/g, '_').replace(/['']/g, '_'),
                    label: option,
                },
            });
            console.log(`✅ Ajouté: ${option}`);
            count++;
        } catch (error: any) {
            if (error.code === 'P2002') {
                console.log(`⚠️  Existe déjà: ${option}`);
            } else {
                console.error(`❌ Erreur pour "${option}":`, error.message);
            }
        }
    }

    console.log(`\n✨ ${count} option(s) ajoutée(s) avec succès!`);
}

main()
    .catch((e) => {
        console.error('❌ Erreur:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
