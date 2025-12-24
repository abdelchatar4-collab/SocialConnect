/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect est un logiciel libre : vous pouvez le redistribuer et/ou le modifier selon les termes de la Licence Publique Générale GNU telle que publiée par la Free Software Foundation, soit la version 3 de la licence, soit (à votre convenance) toute version ultérieure.

Ce programme est distribué dans l'espoir qu'il sera utile, mais SANS AUCUNE GARANTIE ; sans même la garantie implicite de COMMERCIALISATION ou d'ADÉQUATION À UN USAGE PARTICULIER. Voir la Licence Publique Générale GNU pour plus de détails.
*/

const { PrismaClient } = require('@prisma/client');

const defaultOptions = {
  'statutSejour': [
    'Belge',
    'Citoyen UE',
    'Titre de séjour valable',
    'Procédure en cours',
    'Sans-papiers',
    'Séjour limité (Carte A)',
    'Séjour illimité (Carte B)',
    'Etablissement (CARTE K (anciennement carte C))',
    'Résident de longue durée UE (CARTE L (anciennement carte D))',
    'Enregistrement art. 8 DIR 2004/38/CE (CARTE EU (anciennement carte E))',
    'Séjour permanent art.19 DIR 2004/38/CE (CARTE EU + (anciennement carte E+))',
    'Membre famille UE ART. 10 DIR 2004/38/CE (CARTE F)',
    'Membre famille UE ART 20 DIR 2004/38/CE (CARTE F+)',
    'Carte bleue européenne (CARTE H)',
    'Carte M',
    'Carte M avec mention séjour permanent',
    'Carte N pour petit trafic frontalier pour bénéficiaires de l\'accord de retrait',
    'Autre'
  ],
  'typeLogement': [
    'Logement social',
    'Logement privé',
    'Hébergement temporaire',
    'Sans domicile fixe',
    'Autre'
  ],
  'etat': [
    'Actif',
    'Clôturé'
  ],
  'nationalite': [
    'Belge',
    'Française',
    'Allemande',
    'Italienne',
    'Espagnole',
    'Portugaise',
    'Néerlandaise',
    'Marocaine',
    'Turque',
    'Congolaise (RDC)',
    'Autre'
  ],
  'situationFamiliale': [
    'Célibataire',
    'Marié(e)',
    'Divorcé(e)',
    'Veuf/Veuve',
    'Union libre',
    'Séparé(e)',
    'Autre'
  ],
  'niveauEtudes': [
    'Aucun',
    'Primaire',
    'Secondaire inférieur',
    'Secondaire supérieur',
    'Supérieur non universitaire',
    'Universitaire',
    'Autre'
  ],
  'situationProfessionnelle': [
    'Employé(e)',
    'Ouvrier/Ouvrière',
    'Indépendant(e)',
    'Chômeur/Chômeuse',
    'Pensionné(e)',
    'Étudiant(e)',
    'Au foyer',
    'Invalide',
    'Autre'
  ],
  'revenus': [
    'Salaire',
    'Allocations chômage',
    'Pension',
    'Aide sociale (CPAS)',
    'Allocations familiales',
    'Revenus d\'indépendant',
    'Aucun revenu',
    'Autre'
  ]
};

const prisma = new PrismaClient();

async function migrateDropdownOptions() {
  console.log('🚀 Début de la migration des options...');

  try {
    for (const [category, options] of Object.entries(defaultOptions)) {
      console.log(`📝 Migration de la catégorie: ${category}`);

      for (let i = 0; i < options.length; i++) {
        const option = options[i];

        // Vérifier si l'option existe déjà
        const existing = await prisma.dropdownOption.findFirst({
          where: {
            type: category,
            value: option,
            serviceId: 'default'
          }
        });

        if (existing) {
          await prisma.dropdownOption.update({
            where: { id: existing.id },
            data: { label: option }
          });
        } else {
          await prisma.dropdownOption.create({
            data: {
              type: category,
              value: option,
              label: option,
              serviceId: 'default'
            }
          });
        }
      }
    }

    console.log('✅ Migration des options terminée avec succès!');

  } catch (error) {
    console.error('❌ Erreur lors de la migration:', error);
  } finally {
    await prisma.$disconnect();
  }
}

migrateDropdownOptions()
  .then(() => {
    console.log('Migration terminée');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Erreur fatale:', error);
    process.exit(1);
  });
