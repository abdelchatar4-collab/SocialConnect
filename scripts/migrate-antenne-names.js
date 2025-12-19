/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect est un logiciel libre : vous pouvez le redistribuer et/ou le modifier selon les termes de la Licence Publique Générale GNU telle que publiée par la Free Software Foundation, soit la version 3 de la licence, soit (à votre convenance) toute version ultérieure.

Ce programme est distribué dans l'espoir qu'il sera utile, mais SANS AUCUNE GARANTIE ; sans même la garantie implicite de COMMERCIALISATION ou d'ADÉQUATION À UN USAGE PARTICULIER. Voir la Licence Publique Générale GNU pour plus de détails.
*/

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function migrateAntenneNames() {
  console.log('🔄 Migration des noms d\'antennes...');

  try {
    // Corriger antenne_centre -> Antenne Centre
    const result = await prisma.user.updateMany({
      where: {
        antenne: 'antenne_centre'
      },
      data: {
        antenne: 'Antenne Centre'
      }
    });

    console.log(`✅ ${result.count} utilisateurs mis à jour (antenne_centre -> Antenne Centre)`);

    // Vérifier et corriger les autres variations possibles
    const variations = [
      { from: 'antenne_cureghem', to: 'Antenne Cureghem' },
      { from: 'antenne_bizet', to: 'Antenne Bizet' },
      { from: 'antenne_ouest', to: 'Antenne Ouest' },
      { from: 'antenne centre', to: 'Antenne Centre' }, // minuscule
      { from: 'ANTENNE CENTRE', to: 'Antenne Centre' }, // majuscule
      { from: 'Antenne_Centre', to: 'Antenne Centre' }  // underscore avec casse
    ];

    for (const variation of variations) {
      const varResult = await prisma.user.updateMany({
        where: { antenne: variation.from },
        data: { antenne: variation.to }
      });

      if (varResult.count > 0) {
        console.log(`✅ ${varResult.count} utilisateurs mis à jour: ${variation.from} -> ${variation.to}`);
      }
    }

    // Afficher un résumé des antennes après migration
    const antenneStats = await prisma.user.groupBy({
      by: ['antenne'],
      _count: {
        antenne: true
      },
      where: {
        antenne: {
          not: null
        }
      }
    });

    console.log('\n📊 Résumé des antennes après migration:');
    antenneStats.forEach(stat => {
      console.log(`   ${stat.antenne}: ${stat._count.antenne} utilisateurs`);
    });

  } catch (error) {
    console.error('❌ Erreur lors de la migration:', error);
  } finally {
    await prisma.$disconnect();
  }
}

migrateAntenneNames();
