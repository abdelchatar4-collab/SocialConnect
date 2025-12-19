/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect est un logiciel libre : vous pouvez le redistribuer et/ou le modifier selon les termes de la Licence Publique Générale GNU telle que publiée par la Free Software Foundation, soit la version 3 de la licence, soit (à votre convenance) toute version ultérieure.

Ce programme est distribué dans l'espoir qu'il sera utile, mais SANS AUCUNE GARANTIE ; sans même la garantie implicite de COMMERCIALISATION ou d'ADÉQUATION À UN USAGE PARTICULIER. Voir la Licence Publique Générale GNU pour plus de détails.
*/

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function addGestionnaire() {
  console.log('🔧 Ajout d\'un gestionnaire...');

  try {
    const EMAIL = 'achatar@anderlecht.brussels';
    const PRENOM = 'Abdel';
    const NOM = 'Chatar';

    // Vérifier si le gestionnaire existe déjà
    const existingGestionnaire = await prisma.gestionnaire.findUnique({
      where: { email: EMAIL }
    });

    if (existingGestionnaire) {
      console.log(`✅ Gestionnaire déjà existant: ${existingGestionnaire.prenom} ${existingGestionnaire.nom} (${existingGestionnaire.email})`);
      console.log(`📊 Rôle actuel: ${existingGestionnaire.role}`);
      return;
    }

    // Créer le gestionnaire
    const newGestionnaire = await prisma.gestionnaire.create({
      data: {
        email: EMAIL,
        prenom: PRENOM,
        nom: NOM,
        role: 'ADMIN'
      }
    });

    console.log(`✅ Gestionnaire créé avec succès!`);
    console.log(`👤 ${newGestionnaire.prenom} ${newGestionnaire.nom} (${newGestionnaire.email})`);
    console.log(`📊 Rôle: ${newGestionnaire.role}`);
    console.log(`🆔 ID: ${newGestionnaire.id}`);

  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await prisma.$disconnect();
  }
}

addGestionnaire();
