/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect est un logiciel libre : vous pouvez le redistribuer et/ou le modifier selon les termes de la Licence Publique Générale GNU telle que publiée par la Free Software Foundation, soit la version 3 de la licence, soit (à votre convenance) toute version ultérieure.

Ce programme est distribué dans l'espoir qu'il sera utile, mais SANS AUCUNE GARANTIE ; sans même la garantie implicite de COMMERCIALISATION ou d'ADÉQUATION À UN USAGE PARTICULIER. Voir la Licence Publique Générale GNU pour plus de détails.
*/

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function diagnosticUserIds() {
  console.log('🔍 Diagnostic des IDs utilisateurs...');

  try {
    // 1. Vérifier l'ID spécifique problématique
    console.log('\n1. Recherche de l\'ID CEN-OY7HW1...');
    const specificUser = await prisma.user.findUnique({
      where: { id: 'CEN-OY7HW1' }
    });

    if (specificUser) {
      console.log('✅ Utilisateur trouvé:', specificUser.nom, specificUser.prenom);
    } else {
      console.log('❌ Utilisateur CEN-OY7HW1 NON TROUVÉ');
    }

    // 2. Lister tous les IDs commençant par CEN-
    console.log('\n2. Tous les IDs commençant par CEN-...');
    const cenUsers = await prisma.user.findMany({
      where: {
        id: {
          startsWith: 'CEN-'
        }
      },
      select: {
        id: true,
        nom: true,
        prenom: true,
        antenne: true
      },
      orderBy: { id: 'asc' }
    });

    console.log(`📊 ${cenUsers.length} utilisateurs avec préfixe CEN-:`);
    cenUsers.forEach(user => {
      console.log(`  - ${user.id}: ${user.nom} ${user.prenom} (${user.antenne})`);
    });

    // 3. Vérifier s'il y a des IDs similaires
    console.log('\n3. Recherche d\'IDs similaires...');
    const similarIds = await prisma.user.findMany({
      where: {
        id: {
          contains: 'OY7HW1'
        }
      },
      select: { id: true, nom: true, prenom: true }
    });

    if (similarIds.length > 0) {
      console.log('🔍 IDs contenant "OY7HW1":');
      similarIds.forEach(user => {
        console.log(`  - ${user.id}: ${user.nom} ${user.prenom}`);
      });
    } else {
      console.log('❌ Aucun ID contenant "OY7HW1" trouvé');
    }

    // 4. Statistiques générales
    console.log('\n4. Statistiques générales...');
    const totalUsers = await prisma.user.count();
    const antenneStats = await prisma.user.groupBy({
      by: ['antenne'],
      _count: { antenne: true },
      where: { antenne: { not: null } }
    });

    console.log(`📊 Total utilisateurs: ${totalUsers}`);
    console.log('📊 Répartition par antenne:');
    antenneStats.forEach(stat => {
      console.log(`  - ${stat.antenne}: ${stat._count.antenne} utilisateurs`);
    });

    // 5. Vérifier les derniers utilisateurs créés
    console.log('\n5. Derniers utilisateurs créés...');
    const recentUsers = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: {
        id: true,
        nom: true,
        prenom: true,
        antenne: true,
        createdAt: true
      }
    });

    console.log('🕒 5 derniers utilisateurs créés:');
    recentUsers.forEach(user => {
      console.log(`  - ${user.id}: ${user.nom} ${user.prenom} (${user.createdAt})`);
    });

  } catch (error) {
    console.error('❌ Erreur lors du diagnostic:', error);
  } finally {
    await prisma.$disconnect();
  }
}

diagnosticUserIds();
