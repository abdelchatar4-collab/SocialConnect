/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect est un logiciel libre : vous pouvez le redistribuer et/ou le modifier selon les termes de la Licence Publique Générale GNU telle que publiée par la Free Software Foundation, soit la version 3 de la licence, soit (à votre convenance) toute version ultérieure.

Ce programme est distribué dans l'espoir qu'il sera utile, mais SANS AUCUNE GARANTIE ; sans même la garantie implicite de COMMERCIALISATION ou d'ADÉQUATION À UN USAGE PARTICULIER. Voir la Licence Publique Générale GNU pour plus de détails.
*/

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function debugNationalityIssue() {
  console.log('🔍 Diagnostic du problème de nationalité...');

  try {
    // 1. Vérifier les options de nationalité dans la BDD
    console.log('\n📊 Options de nationalité dans la base de données:');
    const nationalityOptions = await prisma.dropdownOption.findMany({
      where: { type: 'nationalite' },
      orderBy: { value: 'asc' }
    });

    console.log(`Nombre d'options trouvées: ${nationalityOptions.length}`);
    nationalityOptions.forEach((option, index) => {
      console.log(`${index + 1}. ID: ${option.id}, Value: "${option.value}", Label: "${option.label}"`);
    });

    // 2. Vérifier quelques utilisateurs et leurs nationalités
    console.log('\n👥 Échantillon d\'utilisateurs avec nationalité:');
    const usersWithNationality = await prisma.user.findMany({
      where: {
        nationalite: { not: null }
      },
      select: {
        id: true,
        nom: true,
        prenom: true,
        nationalite: true
      },
      take: 10
    });

    usersWithNationality.forEach((user, index) => {
      console.log(`${index + 1}. ${user.prenom} ${user.nom}: "${user.nationalite}"`);
    });

    // 3. Vérifier les nationalités uniques dans les données utilisateur
    console.log('\n🌍 Nationalités uniques dans les données utilisateur:');
    const uniqueNationalities = await prisma.user.groupBy({
      by: ['nationalite'],
      where: {
        nationalite: { not: null }
      },
      _count: {
        nationalite: true
      },
      orderBy: {
        _count: {
          nationalite: 'desc'
        }
      }
    });

    uniqueNationalities.forEach((item, index) => {
      console.log(`${index + 1}. "${item.nationalite}": ${item._count.nationalite} utilisateurs`);
    });

    // 4. Vérifier les correspondances entre options et données utilisateur
    console.log('\n🔗 Correspondances entre options BDD et données utilisateur:');
    const optionValues = nationalityOptions.map(opt => opt.value);
    const optionLabels = nationalityOptions.map(opt => opt.label);

    for (const nationality of uniqueNationalities.slice(0, 10)) {
      const matchValue = optionValues.includes(nationality.nationalite || '');
      const matchLabel = optionLabels.includes(nationality.nationalite || '');
      console.log(`"${nationality.nationalite}": Match Value=${matchValue}, Match Label=${matchLabel}`);
    }

  } catch (error) {
    console.error('❌ Erreur lors du diagnostic:', error);
  } finally {
    await prisma.$disconnect();
  }
}

debugNationalityIssue();
