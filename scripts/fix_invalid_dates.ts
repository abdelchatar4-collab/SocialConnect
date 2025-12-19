/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect est un logiciel libre : vous pouvez le redistribuer et/ou le modifier selon les termes de la Licence Publique Générale GNU telle que publiée par la Free Software Foundation, soit la version 3 de la licence, soit (à votre convenance) toute version ultérieure.

Ce programme est distribué dans l'espoir qu'il sera utile, mais SANS AUCUNE GARANTIE ; sans même la garantie implicite de COMMERCIALISATION ou d'ADÉQUATION À UN USAGE PARTICULIER. Voir la Licence Publique Générale GNU pour plus de détails.
*/

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function fixInvalidDates() {
    console.log('🔍 Recherche des dossiers avec dates invalides...\n');

    // Récupérer tous les utilisateurs
    const users = await prisma.user.findMany({
        select: {
            id: true,
            nom: true,
            prenom: true,
            dateOuverture: true,
            createdAt: true,
        },
    });

    const invalidDateUsers: { id: string; nom: string; prenom: string; dateOuverture: Date | null; createdAt: Date }[] = [];

    for (const user of users) {
        // Vérifier si dateOuverture est null ou invalide
        if (!user.dateOuverture) {
            invalidDateUsers.push(user);
        } else {
            const date = new Date(user.dateOuverture);
            if (isNaN(date.getTime())) {
                invalidDateUsers.push(user);
            }
        }
    }

    console.log(`📊 Total des dossiers: ${users.length}`);
    console.log(`⚠️  Dossiers avec dates invalides: ${invalidDateUsers.length}\n`);

    if (invalidDateUsers.length === 0) {
        console.log('✅ Aucun dossier avec date invalide trouvé !');
        await prisma.$disconnect();
        return;
    }

    console.log('📋 Liste des dossiers à corriger:');
    console.log('─'.repeat(80));

    for (const user of invalidDateUsers) {
        console.log(`  • ${user.nom} ${user.prenom} (ID: ${user.id})`);
        console.log(`    dateOuverture actuelle: ${user.dateOuverture || 'null'}`);
        console.log(`    createdAt (fallback): ${user.createdAt.toISOString().split('T')[0]}`);
        console.log('');
    }

    console.log('─'.repeat(80));
    console.log('\n🔧 Correction en cours...\n');

    let correctedCount = 0;

    for (const user of invalidDateUsers) {
        try {
            await prisma.user.update({
                where: { id: user.id },
                data: {
                    dateOuverture: user.createdAt, // Utiliser createdAt comme fallback
                },
            });
            console.log(`  ✅ ${user.nom} ${user.prenom} → ${user.createdAt.toISOString().split('T')[0]}`);
            correctedCount++;
        } catch (error) {
            console.error(`  ❌ Erreur pour ${user.nom} ${user.prenom}:`, error);
        }
    }

    console.log('\n' + '─'.repeat(80));
    console.log(`\n✅ Correction terminée: ${correctedCount}/${invalidDateUsers.length} dossiers mis à jour.`);

    await prisma.$disconnect();
}

fixInvalidDates().catch((error) => {
    console.error('Erreur fatale:', error);
    process.exit(1);
});
