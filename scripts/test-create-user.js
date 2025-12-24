#!/usr/bin/env node
/**
 * Script de test pour la création d'usager
 * Usage: node scripts/test-create-user.js
 */

const testUser = {
    nom: "TestUser",
    prenom: "Script",
    dateNaissance: "1990-05-15",
    genre: "homme",
    telephone: "0471234567",
    email: "test@example.com",
    dateOuverture: new Date().toISOString().split('T')[0],
    etat: "Actif",
    antenne: "Antenne Centre",
    statutSejour: "Belge",
    nationalite: "Belge",
    secteur: "Scheut",
    langue: "Français",
    situationProfessionnelle: "Employé(e)",
    premierContact: "Téléphone",
    gestionnaire: "dab918f1-64aa-4cb0-b48c-c81621d8ac5f", // Remplacez par un ID valide si nécessaire
    adresse: {
        rue: "Rue du Test",
        numero: "42",
        boite: "",
        codePostal: "1070",
        ville: "Anderlecht"
    },
    annee: 2025
};

async function testCreateUser() {
    const baseUrl = process.env.API_URL || 'http://localhost:3002';

    console.log('🧪 Test de création d\'usager...');
    console.log(`📍 URL: ${baseUrl}/api/users`);
    console.log('📦 Payload:', JSON.stringify(testUser, null, 2));

    try {
        const response = await fetch(`${baseUrl}/api/users`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                // Note: En production, vous aurez besoin d'un token d'authentification
                'Cookie': 'next-auth.session-token=YOUR_SESSION_TOKEN' // À remplacer
            },
            body: JSON.stringify(testUser)
        });

        const data = await response.json();

        if (response.ok) {
            console.log('✅ SUCCÈS! Usager créé:');
            console.log('   ID:', data.id);
            console.log('   Nom:', data.nom, data.prenom);
        } else {
            console.log('❌ ERREUR:', response.status);
            console.log('   Message:', JSON.stringify(data, null, 2));
        }
    } catch (error) {
        console.error('💥 Erreur réseau:', error.message);
    }
}

testCreateUser();
