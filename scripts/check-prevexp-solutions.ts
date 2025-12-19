/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect est un logiciel libre : vous pouvez le redistribuer et/ou le modifier selon les termes de la Licence Publique Générale GNU telle que publiée par la Free Software Foundation, soit la version 3 de la licence, soit (à votre convenance) toute version ultérieure.

Ce programme est distribué dans l'espoir qu'il sera utile, mais SANS AUCUNE GARANTIE ; sans même la garantie implicite de COMMERCIALISATION ou d'ADÉQUATION À UN USAGE PARTICULIER. Voir la Licence Publique Générale GNU pour plus de détails.
*/

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkPrevExpSolutions() {
    console.log('🔍 Vérification des solutions de relogement PrevExp...\n');

    // Récupérer tous les utilisateurs avec hasPrevExp = true
    const prevExpUsers = await prisma.user.findMany({
        where: {
            hasPrevExp: true,
        },
        select: {
            id: true,
            nom: true,
            prenom: true,
            prevExpSolutionRelogement: true,
            hasPrevExp: true,
        },
    });

    console.log(`Total utilisateurs avec hasPrevExp: ${prevExpUsers.length}\n`);

    // Compter les solutions
    const solutionCount: { [key: string]: number } = {};

    prevExpUsers.forEach(user => {
        const solution = user.prevExpSolutionRelogement || 'Non renseigné';
        solutionCount[solution] = (solutionCount[solution] || 0) + 1;
    });

    console.log('📊 Répartition des solutions de relogement:');
    console.log('='.repeat(50));

    Object.entries(solutionCount)
        .sort((a, b) => b[1] - a[1])
        .forEach(([solution, count]) => {
            console.log(`  ${solution}: ${count}`);
        });

    console.log('\n📋 Détail des utilisateurs:');
    console.log('='.repeat(50));

    prevExpUsers.forEach(user => {
        console.log(`  - ${user.nom} ${user.prenom}: ${user.prevExpSolutionRelogement || 'Non renseigné'}`);
    });

    await prisma.$disconnect();
}

checkPrevExpSolutions()
    .catch((error) => {
        console.error('Erreur:', error);
        process.exit(1);
    });
