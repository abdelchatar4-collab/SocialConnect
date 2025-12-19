/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect est un logiciel libre : vous pouvez le redistribuer et/ou le modifier selon les termes de la Licence Publique Générale GNU telle que publiée par la Free Software Foundation, soit la version 3 de la licence, soit (à votre convenance) toute version ultérieure.

Ce programme est distribué dans l'espoir qu'il sera utile, mais SANS AUCUNE GARANTIE ; sans même la garantie implicite de COMMERCIALISATION ou d'ADÉQUATION À UN USAGE PARTICULIER. Voir la Licence Publique Générale GNU pour plus de détails.
*/

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Mapping étendu des nationalités vers les pays standardisés
const NATIONALITY_NORMALIZATION_MAP: Record<string, string> = {
  // Variations françaises
  "français": "France", "française": "France", "francais": "France", "francaise": "France",
  "fr": "France", "nationalité française": "France", "nationalite francaise": "France",

  // Variations belges
  "belge": "Belgique", "belgique": "Belgique", "be": "Belgique",
  "nationalité belge": "Belgique", "nationalite belge": "Belgique",

  // Variations syriennes
  "syrien": "Syrie", "syrienne": "Syrie", "syrie": "Syrie", "sy": "Syrie",
  "nationalité syrienne": "Syrie", "nationalite syrienne": "Syrie",

  // Variations italiennes
  "italien": "Italie", "italienne": "Italie", "italie": "Italie", "it": "Italie",
  "nationalité italienne": "Italie", "nationalite italienne": "Italie",

  // Variations allemandes
  "allemand": "Allemagne", "allemande": "Allemagne", "allemagne": "Allemagne", "de": "Allemagne",
  "nationalité allemande": "Allemagne", "nationalite allemande": "Allemagne",

  // Variations espagnoles
  "espagnol": "Espagne", "espagnole": "Espagne", "espagne": "Espagne", "es": "Espagne",
  "nationalité espagnole": "Espagne", "nationalite espagnole": "Espagne",

  // Variations portugaises
  "portugais": "Portugal", "portugaise": "Portugal", "portugal": "Portugal", "pt": "Portugal",
  "nationalité portugaise": "Portugal", "nationalite portugaise": "Portugal",

  // Variations marocaines
  "marocain": "Maroc", "marocaine": "Maroc", "maroc": "Maroc", "ma": "Maroc",
  "nationalité marocaine": "Maroc", "nationalite marocaine": "Maroc",

  // Variations algériennes
  "algérien": "Algérie", "algérienne": "Algérie", "algerien": "Algérie", "algerienne": "Algérie",
  "algerie": "Algérie", "algérie": "Algérie", "dz": "Algérie",
  "nationalité algérienne": "Algérie", "nationalite algerienne": "Algérie",

  // Variations tunisiennes
  "tunisien": "Tunisie", "tunisienne": "Tunisie", "tunisie": "Tunisie", "tn": "Tunisie",
  "nationalité tunisienne": "Tunisie", "nationalite tunisienne": "Tunisie",

  // Ajoutez d'autres nationalités selon vos besoins
};

/**
 * Normalise une chaîne pour la comparaison
 */
function normalizeString(str: string): string {
  return str
    .toLowerCase()
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Supprimer les accents
    .replace(/\s+/g, ' '); // Normaliser les espaces
}

/**
 * Normalise une nationalité vers sa forme standardisée
 */
function normalizeNationality(nationality: string): string {
  if (!nationality || typeof nationality !== 'string') {
    return 'Non spécifié';
  }

  const normalized = normalizeString(nationality);

  // Chercher dans le mapping
  if (NATIONALITY_NORMALIZATION_MAP[normalized]) {
    return NATIONALITY_NORMALIZATION_MAP[normalized];
  }

  // Si pas trouvé, retourner la valeur originale nettoyée
  return nationality.trim();
}

async function normalizeNationalities() {
  console.log('🔄 Début de la normalisation des nationalités...');

  try {
    // Récupérer tous les utilisateurs avec leurs nationalités
    const users = await prisma.user.findMany({
      select: {
        id: true,
        nationalite: true,
        nom: true,
        prenom: true
      },
      where: {
        nationalite: {
          not: null
        }
      }
    });

    console.log(`📊 ${users.length} utilisateurs trouvés avec une nationalité`);

    let updatedCount = 0;
    const updates: Array<{id: string, oldValue: string, newValue: string}> = [];

    for (const user of users) {
      if (!user.nationalite) continue;

      const normalizedNationality = normalizeNationality(user.nationalite);

      // Si la nationalité a changé, la mettre à jour
      if (normalizedNationality !== user.nationalite) {
        updates.push({
          id: user.id,
          oldValue: user.nationalite,
          newValue: normalizedNationality
        });

        await prisma.user.update({
          where: { id: user.id },
          data: { nationalite: normalizedNationality }
        });

        updatedCount++;
        console.log(`✅ ${user.prenom} ${user.nom}: "${user.nationalite}" → "${normalizedNationality}"`);
      }
    }

    console.log(`\n🎉 Normalisation terminée !`);
    console.log(`📈 ${updatedCount} nationalités mises à jour sur ${users.length} utilisateurs`);

    if (updates.length > 0) {
      console.log('\n📋 Résumé des changements:');
      const changesSummary = updates.reduce((acc, update) => {
        const key = `${update.oldValue} → ${update.newValue}`;
        acc[key] = (acc[key] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      Object.entries(changesSummary).forEach(([change, count]) => {
        console.log(`   ${change} (${count} fois)`);
      });
    }

  } catch (error) {
    console.error('❌ Erreur lors de la normalisation:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Exécuter le script
if (require.main === module) {
  normalizeNationalities();
}

export { normalizeNationalities, normalizeNationality };
