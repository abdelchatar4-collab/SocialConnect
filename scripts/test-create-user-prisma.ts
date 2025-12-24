#!/usr/bin/env npx ts-node
/**
 * Script de test DIRECT pour la création d'usager via Prisma
 * Usage: npx ts-node scripts/test-create-user-prisma.ts
 */

import { PrismaClient } from '@prisma/client';
import { createId } from '@paralleldrive/cuid2';

const prisma = new PrismaClient();

async function testCreateUser() {
    console.log('🧪 Test de création d\'usager via Prisma...');

    const userId = `TEST-${createId().slice(-6).toUpperCase()}`;

    const testPayload = {
        id: userId,
        annee: 2025,
        createdBy: "Script Test",
        nom: "TestPrisma",
        prenom: "Automated",
        dateNaissance: new Date("1990-05-15"),
        genre: "homme",
        telephone: "0471234567",
        email: `test-${Date.now()}@example.com`,
        dateOuverture: new Date(),
        dateCloture: null,
        etat: "Actif",
        antenne: "Antenne Centre",
        statutSejour: "Belge",
        nationalite: "Belge",
        trancheAge: "",
        remarques: "",
        secteur: "Scheut",
        langue: "Français",
        situationProfessionnelle: "Employé(e)",
        revenus: "",
        premierContact: "Téléphone",
        notesGenerales: "",
        problematiquesDetails: "",
        informationImportante: "",
        afficherDonneesConfidentielles: false,
        donneesConfidentielles: "",
        hasPrevExp: false,
        prevExpDateReception: null,
        prevExpDateRequete: null,
        prevExpDateVad: null,
        prevExpDateAudience: null,
        prevExpDateSignification: null,
        prevExpDateJugement: null,
        prevExpDateExpulsion: null,
        prevExpDossierOuvert: "",
        prevExpDecision: "",
        prevExpCommentaire: "",
        prevExpDemandeCpas: "",
        prevExpNegociationProprio: "",
        prevExpSolutionRelogement: "",
        prevExpMaintienLogement: "",
        prevExpTypeFamille: "",
        prevExpTypeRevenu: "",
        prevExpEtatLogement: "",
        prevExpNombreChambre: "",
        prevExpAideJuridique: "",
        prevExpMotifRequete: "",
        logementDetails: null,
        // Relation Service: TESTER LES DEUX SYNTAXES
        service: { connect: { id: "default" } },
        // Adresse
        adresse: {
            create: {
                rue: "Rue du Test Prisma",
                numero: "99",
                boite: "",
                codePostal: "1070",
                ville: "Anderlecht"
            }
        }
    };

    console.log('📦 Payload complet:');
    console.log('   Keys:', Object.keys(testPayload).join(', '));
    console.log('   Has serviceId?:', 'serviceId' in testPayload);
    console.log('   Has service?:', 'service' in testPayload);

    try {
        const newUser = await prisma.user.create({
            data: testPayload as any,
            include: {
                adresse: true,
            },
        });

        console.log('✅ SUCCÈS! Usager créé:');
        console.log('   ID:', newUser.id);
        console.log('   Nom:', newUser.nom, newUser.prenom);
        console.log('   ServiceID:', (newUser as any).serviceId);

        // Nettoyage: supprimer l'usager de test
        await prisma.user.delete({ where: { id: newUser.id } });
        console.log('🧹 Usager de test supprimé.');

    } catch (error: any) {
        console.log('❌ ERREUR Prisma:');
        console.log('   Message:', error.message);
        if (error.code) console.log('   Code:', error.code);
    } finally {
        await prisma.$disconnect();
    }
}

testCreateUser();
