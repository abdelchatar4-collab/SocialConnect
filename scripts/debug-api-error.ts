/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect est un logiciel libre : vous pouvez le redistribuer et/ou le modifier selon les termes de la Licence Publique Générale GNU telle que publiée par la Free Software Foundation, soit la version 3 de la licence, soit (à votre convenance) toute version ultérieure.

Ce programme est distribué dans l'espoir qu'il sera utile, mais SANS AUCUNE GARANTIE ; sans même la garantie implicite de COMMERCIALISATION ou d'ADÉQUATION À UN USAGE PARTICULIER. Voir la Licence Publique Générale GNU pour plus de détails.
*/

import { PrismaClient } from '@prisma/client';

async function debugAPI() {
  console.log('🔍 Diagnostic de l\'erreur API partenaires...');

  let prisma: PrismaClient | undefined;

  try {
    // Test de connexion Prisma
    console.log('\n📡 Test de connexion Prisma...');
    prisma = new PrismaClient();

    // Test de connexion basique
    await prisma.$connect();
    console.log('✅ Connexion Prisma réussie');

    // Test de requête simple
    console.log('\n📊 Test de requête sur DropdownOption...');
    const count = await prisma.dropdownOption.count();
    console.log(`✅ Nombre total d'options: ${count}`);

    // Test spécifique aux partenaires
    console.log('\n🤝 Test de requête partenaires...');
    const partenaires = await prisma.dropdownOption.findMany({
      where: { type:'partenaire' },
      orderBy: { value: 'asc' }
    });

    console.log(`✅ Nombre de partenaires trouvés: ${partenaires.length}`);

    if (partenaires.length > 0) {
      console.log('\n📋 Premiers partenaires:');
      partenaires.slice(0, 3).forEach((p, i) => {
        console.log(`  ${i + 1}. ID: ${p.id}, Type: ${p.type}, Value: ${p.value}, Label: ${p.label}`);
      });
    }

    // Test de sérialisation JSON
    console.log('\n🔄 Test de sérialisation JSON...');
    const jsonString = JSON.stringify(partenaires);
    console.log(`✅ Sérialisation réussie (${jsonString.length} caractères)`);

  } catch (error) {
    console.error('❌ Erreur détectée:', error);

    if (error instanceof Error) {
      console.error('Type d\'erreur:', error.constructor.name);
      console.error('Message:', error.message);
    }

    // Vérification pour les erreurs Prisma ou autres avec des propriétés spécifiques
    if (error && typeof error === 'object') {
      const errorObj = error as any;
      if (errorObj.code) {
        console.error('Code d\'erreur:', errorObj.code);
      }
      if (errorObj.meta) {
        console.error('Métadonnées:', errorObj.meta);
      }
    }
  } finally {
    if (prisma) {
      await prisma.$disconnect();
      console.log('\n🔌 Connexion Prisma fermée');
    }
  }
}

debugAPI();
