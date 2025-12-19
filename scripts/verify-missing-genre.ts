/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect est un logiciel libre : vous pouvez le redistribuer et/ou le modifier selon les termes de la Licence Publique Générale GNU telle que publiée par la Free Software Foundation, soit la version 3 de la licence, soit (à votre convenance) toute version ultérieure.

Ce programme est distribué dans l'espoir qu'il sera utile, mais SANS AUCUNE GARANTIE ; sans même la garantie implicite de COMMERCIALISATION ou d'ADÉQUATION À UN USAGE PARTICULIER. Voir la Licence Publique Générale GNU pour plus de détails.
*/


import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function verifyMissingGenre() {
    try {
        const count = await prisma.user.count({
            where: {
                OR: [
                    { genre: null },
                    { genre: '' }
                ]
            },
        });

        console.log(`Nombre d'utilisateurs sans genre : ${count}`);

        const users = await prisma.user.findMany({
            where: {
                OR: [
                    { genre: null },
                    { genre: '' }
                ]
            },
            select: {
                id: true,
                nom: true,
                prenom: true,
                annee: true,
                etat: true
            },
            orderBy: [
                { annee: 'desc' },
                { nom: 'asc' }
            ]
        });

        console.log("\nListe des utilisateurs concernés (ID - Nom Prénom - Année - État):");
        console.log("=".repeat(80));
        users.forEach(u => {
            console.log(`${u.id.padEnd(15)} | ${u.nom.padEnd(20)} ${u.prenom.padEnd(20)} | ${u.annee} | ${u.etat}`);
        });

        // Grouper par année
        const byYear = users.reduce((acc, user) => {
            if (!acc[user.annee]) {
                acc[user.annee] = [];
            }
            acc[user.annee].push(user);
            return acc;
        }, {} as Record<number, typeof users>);

        console.log("\n\nRésumé par année:");
        console.log("=".repeat(40));
        Object.keys(byYear).sort().reverse().forEach(year => {
            console.log(`${year}: ${byYear[Number(year)].length} utilisateur(s)`);
        });

    } catch (error) {
        console.error('Erreur lors de la vérification :', error);
    } finally {
        await prisma.$disconnect();
    }
}

verifyMissingGenre();
