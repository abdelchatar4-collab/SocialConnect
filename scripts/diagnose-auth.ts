/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect est un logiciel libre : vous pouvez le redistribuer et/ou le modifier selon les termes de la Licence Publique Générale GNU telle que publiée par la Free Software Foundation, soit la version 3 de la licence, soit (à votre convenance) toute version ultérieure.

Ce programme est distribué dans l'espoir qu'il sera utile, mais SANS AUCUNE GARANTIE ; sans même la garantie implicite de COMMERCIALISATION ou d'ADÉQUATION À UN USAGE PARTICULIER. Voir la Licence Publique Générale GNU pour plus de détails.
*/

#!/usr/bin/env ts-node
// Script de diagnostic rapide pour vérifier l'authentification

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('\n🔍 DIAGNOSTIC AUTHENTIFICATION\n');
    console.log('='.repeat(50));

    // 1. Vérifier les gestionnaires
    console.log('\n📋 Gestionnaires dans la base de données :');
    const gestionnaires = await prisma.gestionnaire.findMany({
        select: {
            id: true,
            email: true,
            prenom: true,
            nom: true,
            role: true
        },
        orderBy: { role: 'desc' }
    });

    if (gestionnaires.length === 0) {
        console.log('❌ AUCUN gestionnaire trouvé !');
        console.log('   → C\'est probablement le problème.');
    } else {
        gestionnaires.forEach((g, i) => {
            console.log(`${i + 1}. ${g.email}`);
            console.log(`   Nom: ${g.prenom} ${g.nom || ''}`);
            console.log(`   Role: ${g.role}`);
            console.log('');
        });
    }

    // 2. Vérifier la connexion DB
    console.log('='.repeat(50));
    console.log('\n🔌 Connexion à la base de données : ✅');
    console.log(`   Database URL: ${process.env.DATABASE_URL?.replace(/\/\/.*@/, '//***@')}`);

    // 3. Variables d'environnement
    console.log('\n='.repeat(50));
    console.log('\n🔑 Variables d\'environnement :');
    console.log(`   NODE_ENV: ${process.env.NODE_ENV}`);
    console.log(`   NEXTAUTH_URL: ${process.env.NEXTAUTH_URL || 'NON DÉFINI ⚠️'}`);
    console.log(`   GOOGLE_CLIENT_ID: ${process.env.GOOGLE_CLIENT_ID ? '✅ Défini' : '❌ Manquant'}`);
    console.log(`   GOOGLE_CLIENT_SECRET: ${process.env.GOOGLE_CLIENT_SECRET ? '✅ Défini' : '❌ Manquant'}`);

    console.log('\n='.repeat(50));
    console.log('\n✨ Diagnostic terminé\n');
}

main()
    .catch((e) => {
        console.error('❌ Erreur:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
