/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect est un logiciel libre : vous pouvez le redistribuer et/ou le modifier selon les termes de la Licence Publique Générale GNU telle que publiée par la Free Software Foundation, soit la version 3 de la licence, soit (à votre convenance) toute version ultérieure.

Ce programme est distribué dans l'espoir qu'il sera utile, mais SANS AUCUNE GARANTIE ; sans même la garantie implicite de COMMERCIALISATION ou d'ADÉQUATION À UN USAGE PARTICULIER. Voir la Licence Publique Générale GNU pour plus de détails.
*/

const { PrismaClient } = require('@prisma/client');

async function testUpdateUser() {
  const prisma = new PrismaClient();
  const userId = 'CEN-OY7HW1';

  try {
    console.log('🔍 Test de mise à jour pour l\'utilisateur:', userId);

    // 1. Vérifier que l'utilisateur existe
    const existingUser = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!existingUser) {
      console.log('❌ Utilisateur non trouvé avec findUnique');
      return;
    }

    console.log('✅ Utilisateur trouvé avec findUnique:', existingUser.nom, existingUser.prenom);

    // 2. Tester une mise à jour simple
    console.log('🔄 Test de mise à jour simple...');

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        remarques: existingUser.remarques + ' [Test mise à jour: ' + new Date().toISOString() + ']'
      }
    });

    console.log('✅ Mise à jour réussie!');
    console.log('📝 Nouvelles remarques:', updatedUser.remarques.slice(-100));

    // 3. Remettre les remarques originales
    await prisma.user.update({
      where: { id: userId },
      data: {
        remarques: existingUser.remarques
      }
    });

    console.log('✅ Remarques restaurées');

  } catch (error) {
    console.error('❌ Erreur lors du test de mise à jour:', error.message);
    if (error.code) {
      console.error('Code d\'erreur Prisma:', error.code);
    }
  } finally {
    await prisma.$disconnect();
  }
}

testUpdateUser();
