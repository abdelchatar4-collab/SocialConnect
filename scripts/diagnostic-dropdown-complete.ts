/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect est un logiciel libre : vous pouvez le redistribuer et/ou le modifier selon les termes de la Licence Publique Générale GNU telle que publiée par la Free Software Foundation, soit la version 3 de la licence, soit (à votre convenance) toute version ultérieure.

Ce programme est distribué dans l'espoir qu'il sera utile, mais SANS AUCUNE GARANTIE ; sans même la garantie implicite de COMMERCIALISATION ou d'ADÉQUATION À UN USAGE PARTICULIER. Voir la Licence Publique Générale GNU pour plus de détails.
*/

import { PrismaClient } from '@prisma/client';
// Suppression de l'import node-fetch - utilisation de fetch natif

const prisma = new PrismaClient();

async function diagnosticComplet() {
  console.log('🔍 === DIAGNOSTIC COMPLET DES MENUS DÉROULANTS ===\n');

  // 1. VÉRIFICATION BASE DE DONNÉES
  console.log('📊 1. ÉTAT DE LA BASE DE DONNÉES');
  console.log('================================');

  const allOptions = await prisma.dropdownOption.findMany({
    orderBy: [{ type: 'asc' }, { value: 'asc' }]
  });

  console.log(`Total d'options en DB: ${allOptions.length}`);

  // Grouper par type
  const optionsByType = allOptions.reduce((acc, option) => {
    if (!acc[option.type]) acc[option.type] = [];
    acc[option.type].push(option);
    return acc;
  }, {} as Record<string, any[]>);

  console.log('\nOptions par catégorie:');
  Object.entries(optionsByType).forEach(([type, options]) => {
    console.log(`  ${type}: ${options.length} options`);
    options.forEach(opt => console.log(`    - ${opt.value} (${opt.label})`));
  });

  // 2. TEST DES APIS
  console.log('\n🌐 2. TEST DES ENDPOINTS API');
  console.log('=============================');

  const apiTests = [
    'http://localhost:3000/api/options',
    'http://localhost:3000/api/options/etat',
    'http://localhost:3000/api/options/antenne',
    'http://localhost:3000/api/options/partenaire'
  ];

  for (const url of apiTests) {
    try {
      console.log(`\nTest: ${url}`);
      const response = await fetch(url);
      const data = await response.json();

      if (response.ok) {
        console.log(`  ✅ Status: ${response.status}`);
        console.log(`  📦 Données: ${JSON.stringify(data).substring(0, 200)}...`);
      } else {
        console.log(`  ❌ Status: ${response.status}`);
        console.log(`  🚨 Erreur: ${JSON.stringify(data)}`);
      }
    } catch (error: any) {
      console.log(`  💥 Erreur réseau: ${error.message}`);
    }
  }

  // 3. VÉRIFICATION DES CATÉGORIES CRITIQUES
  console.log('\n🎯 3. VÉRIFICATION DES CATÉGORIES CRITIQUES');
  console.log('============================================');

  const categoriesCritiques = ['etat', 'antenne', 'partenaire', 'nationalite', 'langue'];

  for (const categorie of categoriesCritiques) {
    const options = await prisma.dropdownOption.findMany({
      where: { type: categorie }
    });

    console.log(`\n${categorie.toUpperCase()}:`);
    if (options.length === 0) {
      console.log('  🚨 AUCUNE OPTION TROUVÉE !');
    } else {
      console.log(`  ✅ ${options.length} options trouvées`);
      options.forEach(opt => {
        console.log(`    - "${opt.value}" → "${opt.label}"`);
      });
    }
  }

  // 4. DÉTECTION DES PROBLÈMES
  console.log('\n🔧 4. DÉTECTION DES PROBLÈMES');
  console.log('==============================');

  const problemes = [];

  // Vérifier les catégories manquantes
  for (const categorie of categoriesCritiques) {
    const count = await prisma.dropdownOption.count({
      where: { type: categorie }
    });
    if (count === 0) {
      problemes.push(`❌ Catégorie "${categorie}" vide`);
    }
  }

  // Vérifier les doublons
  const doublons = await prisma.dropdownOption.groupBy({
    by: ['type', 'value'],
    having: {
      type: { _count: { gt: 1 } }
    }
  });

  if (doublons.length > 0) {
    problemes.push(`❌ ${doublons.length} doublons détectés`);
  }

  // Vérifier les valeurs nulles/vides
  const valeursVides = await prisma.dropdownOption.findMany({
    where: {
      OR: [
        { value: '' },
        { value: undefined },
        { label: undefined },
        { label: '' }
      ]
    }
  });

  if (valeursVides.length > 0) {
    problemes.push(`❌ ${valeursVides.length} options avec valeurs vides`);
  }

  if (problemes.length === 0) {
    console.log('✅ Aucun problème détecté dans la base de données');
  } else {
    console.log('🚨 PROBLÈMES DÉTECTÉS:');
    problemes.forEach(probleme => console.log(`  ${probleme}`));
  }

  // 5. RECOMMANDATIONS
  console.log('\n💡 5. RECOMMANDATIONS');
  console.log('=====================');

  if (problemes.length > 0) {
    console.log('🔧 Actions recommandées:');
    console.log('  1. Exécuter le script de réparation');
    console.log('  2. Vider le cache du navigateur');
    console.log('  3. Redémarrer l\'application');
    console.log('  4. Vérifier les logs de la console navigateur');
  } else {
    console.log('🤔 La base de données semble correcte.');
    console.log('Le problème pourrait être:');
    console.log('  - Cache navigateur');
    console.log('  - Problème de mapping côté client');
    console.log('  - Erreur dans useDropdownOptionsAPI');
    console.log('  - Problème de réseau/CORS');
  }

  console.log('\n🎯 === FIN DU DIAGNOSTIC ===');
}

diagnosticComplet()
  .then(() => {
    console.log('\n✅ Diagnostic terminé');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Erreur lors du diagnostic:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
