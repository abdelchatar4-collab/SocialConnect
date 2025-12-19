/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect est un logiciel libre : vous pouvez le redistribuer et/ou le modifier selon les termes de la Licence Publique Générale GNU telle que publiée par la Free Software Foundation, soit la version 3 de la licence, soit (à votre convenance) toute version ultérieure.

Ce programme est distribué dans l'espoir qu'il sera utile, mais SANS AUCUNE GARANTIE ; sans même la garantie implicite de COMMERCIALISATION ou d'ADÉQUATION À UN USAGE PARTICULIER. Voir la Licence Publique Générale GNU pour plus de détails.
*/

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function debugLogementData() {
  try {
    // Récupérer un utilisateur existant
    const users = await prisma.user.findMany({
      take: 1,
      where: {
        logementDetails: {
          not: null
        }
      }
    });

    if (users.length === 0) {
      console.log('❌ Aucun utilisateur avec des données de logement trouvé');
      return;
    }

    const user = users[0];
    console.log('🔍 Utilisateur testé:', user.id, user.nom, user.prenom);
    console.log('📊 Type de logementDetails:', typeof user.logementDetails);
    console.log('📝 Contenu brut de logementDetails:', user.logementDetails);

    // Tenter de parser les données
    if (typeof user.logementDetails === 'string') {
      try {
        const parsed = JSON.parse(user.logementDetails);
        console.log('✅ Données parsées avec succès:');
        console.log('   - garantieLocative:', parsed.garantieLocative);
        console.log('   - statutGarantie:', parsed.statutGarantie);
        console.log('   - bailEnregistre:', parsed.bailEnregistre);
        console.log('   - dateContrat:', parsed.dateContrat);
        console.log('   - dureeContrat:', parsed.dureeContrat);
        console.log('   - hasLitige:', parsed.hasLitige);
        console.log('   - typeLitige:', parsed.typeLitige);
        console.log('   - datePreavis:', parsed.datePreavis);
        console.log('   - dureePreavis:', parsed.dureePreavis);
        console.log('   - loyer:', parsed.loyer);
        console.log('   - charges:', parsed.charges);
      } catch (error) {
        console.log('❌ Erreur de parsing JSON:', error);
      }
    } else {
      console.log('📊 Données déjà parsées:', user.logementDetails);
    }

  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await prisma.$disconnect();
  }
}

debugLogementData();