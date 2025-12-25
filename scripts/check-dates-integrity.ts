/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect - Data Integrity Audit Script
*/

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function runAudit() {
    console.log('🚀 Démarrage de l\'audit d\'intégrité des dates...\n');

    try {
        const services = await prisma.service.findMany();
        console.log(`📡 Services détectés : ${services.length}`);

        for (const service of services) {
            console.log(`\n---------------------------------------------------------`);
            console.log(`📍 Analyse du service : ${service.name} (${service.id})`);
            console.log(`---------------------------------------------------------`);

            // 1. Audit des Usagers
            const users = await prisma.user.findMany({
                where: { serviceId: service.id },
                select: {
                    id: true,
                    nom: true,
                    prenom: true,
                    dateNaissance: true,
                    dateOuverture: true,
                    dateCloture: true,
                    prevExpDateReception: true,
                    prevExpDateRequete: true,
                    prevExpDateVad: true,
                    prevExpDateAudience: true,
                    prevExpDateSignification: true,
                    prevExpDateJugement: true,
                    prevExpDateExpulsion: true,
                }
            });

            console.log(`👥 Usagers à scanner : ${users.length}`);

            let anomaliesCount = 0;
            const today = new Date();
            const limitFuture = new Date();
            limitFuture.setFullYear(today.getFullYear() + 1);
            const limitPast = new Date(1900, 0, 1);

            for (const user of users) {
                const userAnomalies: string[] = [];

                const checkDate = (field: string, d: Date | null) => {
                    if (!d) return;
                    if (d > limitFuture) userAnomalies.push(`${field} dans le futur lointain (${d.toISOString().split('T')[0]})`);
                    if (d < limitPast) userAnomalies.push(`${field} très ancienne (${d.toISOString().split('T')[0]})`);
                };

                checkDate('Date Naissance', user.dateNaissance);
                checkDate('Date Ouverture', user.dateOuverture);
                checkDate('Date Clôture', user.dateCloture);
                checkDate('PrevExp Réception', user.prevExpDateReception);
                checkDate('PrevExp Requête', user.prevExpDateRequete);
                checkDate('PrevExp VAD', user.prevExpDateVad);
                checkDate('PrevExp Audience', user.prevExpDateAudience);
                checkDate('PrevExp Signification', user.prevExpDateSignification);
                checkDate('PrevExp Jugement', user.prevExpDateJugement);
                checkDate('PrevExp Expulsion', user.prevExpDateExpulsion);

                // Incohérences logiques
                if (user.dateOuverture && user.dateCloture && user.dateCloture < user.dateOuverture) {
                    userAnomalies.push(`Clôture (${user.dateCloture.toISOString().split('T')[0]}) AVANT Ouverture (${user.dateOuverture.toISOString().split('T')[0]})`);
                }

                if (userAnomalies.length > 0) {
                    anomaliesCount++;
                    console.log(`⚠️  Usager [${user.id}] ${user.prenom} ${user.nom} :`);
                    userAnomalies.forEach(a => console.log(`   - ${a}`));
                }
            }

            // 2. Audit des Problématiques
            const probs = await prisma.problematique.findMany({
                where: { user: { serviceId: service.id } },
                select: { id: true, type: true, dateSignalement: true, userId: true }
            });

            for (const p of probs) {
                if (p.dateSignalement && (p.dateSignalement > limitFuture || p.dateSignalement < limitPast)) {
                    console.log(`⚠️  Problématique [${p.id}] (Usager ${p.userId}) : Date de signalement suspecte (${p.dateSignalement.toISOString().split('T')[0]})`);
                }
            }

            // 3. Audit des Actions de suivi
            const actions = await prisma.actionSuivi.findMany({
                where: { user: { serviceId: service.id } },
                select: { id: true, date: true, userId: true }
            });

            for (const a of actions) {
                if (a.date && (a.date > limitFuture || a.date < limitPast)) {
                    console.log(`⚠️  Action [${a.id}] (Usager ${a.userId}) : Date d'action suspecte (${a.date.toISOString().split('T')[0]})`);
                }
            }

            console.log(`\n✅ Analyse terminée pour ${service.name}. Total anomalies : ${anomaliesCount}`);
        }

    } catch (error) {
        console.error('❌ Erreur lors de l\'audit :', error);
    } finally {
        await prisma.$disconnect();
    }
}

runAudit();
