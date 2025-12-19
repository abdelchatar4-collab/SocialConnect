/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect est un logiciel libre : vous pouvez le redistribuer et/ou le modifier selon les termes de la Licence Publique Générale GNU telle que publiée par la Free Software Foundation, soit la version 3 de la licence, soit (à votre convenance) toute version ultérieure.

Ce programme est distribué dans l'espoir qu'il sera utile, mais SANS AUCUNE GARANTIE ; sans même la garantie implicite de COMMERCIALISATION ou d'ADÉQUATION À UN USAGE PARTICULIER. Voir la Licence Publique Générale GNU pour plus de détails.
*/

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('🔍 Recherche de l\'utilisateur Hafsa El Mourabit...');

    // Find the user by name (flexible search)
    const user = await prisma.user.findFirst({
        where: {
            nom: { contains: 'El Mourabit' },
            prenom: { contains: 'Hafsa' }
        }
    });

    if (!user) {
        console.error('❌ Utilisateur non trouvé !');
        return;
    }

    console.log(`✅ Utilisateur trouvé: ${user.prenom} ${user.nom} (ID: ${user.id})`);
    console.log(`📅 Date actuelle: ${user.dateOuverture}`);

    // Correct Date: 27 November 2025
    const newDate = new Date('2025-11-27T10:00:00.000Z');

    const updated = await prisma.user.update({
        where: { id: user.id },
        data: {
            dateOuverture: newDate
        }
    });

    console.log(`🎉 Date corrigée avec succès au: ${updated.dateOuverture}`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
