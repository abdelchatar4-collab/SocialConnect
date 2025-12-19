/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect est un logiciel libre : vous pouvez le redistribuer et/ou le modifier selon les termes de la Licence Publique Générale GNU telle que publiée par la Free Software Foundation, soit la version 3 de la licence, soit (à votre convenance) toute version ultérieure.

Ce programme est distribué dans l'espoir qu'il sera utile, mais SANS AUCUNE GARANTIE ; sans même la garantie implicite de COMMERCIALISATION ou d'ADÉQUATION À UN USAGE PARTICULIER. Voir la Licence Publique Générale GNU pour plus de détails.
*/

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testLogementSave() {
  try {
    // Récupérer un utilisateur existant
    const user = await prisma.user.findFirst();

    if (!user) {
      console.log('❌ Aucun utilisateur trouvé');
      return;
    }

    console.log('🔍 Test avec utilisateur:', user.id, user.nom, user.prenom);

    // Données de test complètes
    const testLogementData = {
      typeLogement: 'Appartement',
      loyer: '800',
      charges: '150',
      garantieLocative: '1600',
      statutGarantie: 'Versée',
      bailEnregistre: 'Oui',
      dateContrat: '2024-01-01',
      dureeContrat: '12 mois',
      hasLitige: true,
      typeLitige: 'Retard de paiement',
      dateLitige: '2024-06-01',
      descriptionLitige: 'Test de description',
      actionsPrises: 'Test d\'actions',
      datePreavis: '2024-12-01',
      dureePreavis: '3 mois'
    };

    console.log('💾 Sauvegarde des données de test...');

    // Sauvegarder
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        logementDetails: JSON.stringify(testLogementData)
      }
    });

    console.log('✅ Sauvegarde effectuée');
    console.log('📝 Données sauvegardées:', updatedUser.logementDetails);

    // Récupérer immédiatement
    const retrievedUser = await prisma.user.findUnique({
      where: { id: user.id }
    });

    console.log('🔄 Récupération immédiate...');

    if (retrievedUser?.logementDetails) {
      const parsed = JSON.parse(retrievedUser.logementDetails as string);
      console.log('✅ Données récupérées:');
      Object.entries(testLogementData).forEach(([key, value]) => {
        const retrieved = parsed[key];
        const status = retrieved === value ? '✅' : '❌';
        console.log(`   ${status} ${key}: sauvé="${value}" récupéré="${retrieved}"`);
      });
    }

  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testLogementSave();