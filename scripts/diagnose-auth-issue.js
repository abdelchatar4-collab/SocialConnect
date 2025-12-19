/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect est un logiciel libre : vous pouvez le redistribuer et/ou le modifier selon les termes de la Licence Publique Générale GNU telle que publiée par la Free Software Foundation, soit la version 3 de la licence, soit (à votre convenance) toute version ultérieure.

Ce programme est distribué dans l'espoir qu'il sera utile, mais SANS AUCUNE GARANTIE ; sans même la garantie implicite de COMMERCIALISATION ou d'ADÉQUATION À UN USAGE PARTICULIER. Voir la Licence Publique Générale GNU pour plus de détails.
*/

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function diagnoseAuthIssue() {
  console.log('🔍 Diagnostic du problème d\'authentification...');

  try {
    // REMPLACEZ PAR L'EMAIL DU COLLÈGUE PROBLÉMATIQUE
    const PROBLEMATIC_EMAIL = 'email.collegue@example.com'; // ⚠️ MODIFIEZ CETTE LIGNE

    console.log(`\n📧 Recherche pour: "${PROBLEMATIC_EMAIL}"`);

    // 1. Recherche exacte
    const exactMatch = await prisma.gestionnaire.findUnique({
      where: { email: PROBLEMATIC_EMAIL }
    });

    console.log('\n1️⃣ Recherche exacte:');
    if (exactMatch) {
      console.log('✅ Trouvé:', exactMatch);
    } else {
      console.log('❌ Aucun résultat exact');
    }

    // 2. Recherche insensible à la casse
    const allGestionnaires = await prisma.gestionnaire.findMany({
      select: { id: true, email: true, prenom: true, nom: true, role: true }
    });

    console.log('\n2️⃣ Recherche insensible à la casse:');
    const caseInsensitiveMatch = allGestionnaires.find(g =>
      g.email && g.email.toLowerCase() === PROBLEMATIC_EMAIL.toLowerCase()
    );

    if (caseInsensitiveMatch) {
      console.log('✅ Trouvé avec différence de casse:', caseInsensitiveMatch);
      console.log(`   Email en base: "${caseInsensitiveMatch.email}"`);
      console.log(`   Email recherché: "${PROBLEMATIC_EMAIL}"`);
    } else {
      console.log('❌ Aucun résultat même insensible à la casse');
    }

    // 3. Recherche partielle
    console.log('\n3️⃣ Recherche partielle (contient):');
    const partialMatches = allGestionnaires.filter(g =>
      g.email && (
        g.email.includes(PROBLEMATIC_EMAIL.split('@')[0]) ||
        PROBLEMATIC_EMAIL.includes(g.email.split('@')[0])
      )
    );

    if (partialMatches.length > 0) {
      console.log('🔍 Correspondances partielles trouvées:');
      partialMatches.forEach(match => {
        console.log(`   - ${match.email} (${match.prenom} ${match.nom || ''})`);
      });
    } else {
      console.log('❌ Aucune correspondance partielle');
    }

    // 4. Liste complète pour comparaison
    console.log('\n4️⃣ Tous les gestionnaires en base:');
    allGestionnaires.forEach(g => {
      console.log(`   - "${g.email}" (${g.prenom} ${g.nom || ''}) - ${g.role}`);
    });

    // 5. Vérification des caractères invisibles
    console.log('\n5️⃣ Analyse des caractères:');
    console.log(`   Email recherché (hex): ${Buffer.from(PROBLEMATIC_EMAIL, 'utf8').toString('hex')}`);

    if (exactMatch && exactMatch.email) {
      console.log(`   Email en base (hex): ${Buffer.from(exactMatch.email, 'utf8').toString('hex')}`);
    }

  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await prisma.$disconnect();
  }
}

diagnoseAuthIssue();
