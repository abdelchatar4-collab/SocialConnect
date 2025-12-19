/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect est un logiciel libre : vous pouvez le redistribuer et/ou le modifier selon les termes de la Licence Publique Générale GNU telle que publiée par la Free Software Foundation, soit la version 3 de la licence, soit (à votre convenance) toute version ultérieure.

Ce programme est distribué dans l'espoir qu'il sera utile, mais SANS AUCUNE GARANTIE ; sans même la garantie implicite de COMMERCIALISATION ou d'ADÉQUATION À UN USAGE PARTICULIER. Voir la Licence Publique Générale GNU pour plus de détails.
*/

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('🔧 Fixing corrupted settings...');

    try {
        // Delete all existing settings to clear corruption
        await prisma.settings.deleteMany({});
        console.log('✅ Cleared old settings');

        // Create fresh default settings
        const settings = await prisma.settings.create({
            data: {
                serviceName: "LE PÔLE ACCUEIL SOCIAL DES QUARTIERS",
                primaryColor: "#1e3a8a",
                headerSubtitle: "PORTAIL DE GESTION",
                showCommunalLogo: true,
                requiredFields: [], // Valid JSON array
                enableBirthdays: false,
                colleagueBirthdays: [] // Valid JSON array
            }
        });

        console.log('✅ Created fresh settings:', settings);
    } catch (error) {
        console.error('❌ Error fixing settings:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
