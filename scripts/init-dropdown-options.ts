/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect est un logiciel libre : vous pouvez le redistribuer et/ou le modifier selon les termes de la Licence Publique Générale GNU telle que publiée par la Free Software Foundation, soit la version 3 de la licence, soit (à votre convenance) toute version ultérieure.

Ce programme est distribué dans l'espoir qu'il sera utile, mais SANS AUCUNE GARANTIE ; sans même la garantie implicite de COMMERCIALISATION ou d'ADÉQUATION À UN USAGE PARTICULIER. Voir la Licence Publique Générale GNU pour plus de détails.
*/

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const languages = [
  "Français",
  "Anglais",
  "Arabe",
  "Néerlandais",
  "Allemand",
  "Espagnol",
  "Italien",
  "Portugais",
  "Russe",
  "Ukrainien",
  "Polonais",
  "Roumain",
  "Turc",
  "Chinois (Mandarin)",
  "Hindi",
  "Ourdou",
  "Bengali",
  "Swahili",
  "Amharique",
  "Somali",
  "Tigrinya",
  "Kurde",
  "Dari",
  "Pachtou",
  "Albanais",
  "Serbe",
  "Croate",
  "Bosnien",
  "Bulgare",
  "Tchèque",
  "Slovaque",
  "Hongrois",
  "Grec",
  "Vietnamien",
  "Coréen",
  "Japonais",
  "Persan (Farsi)",
  "Berbère",
  "Lingala",
  "Kinyarwanda",
  "Kirundi",
  "Wolof",
  "Bambara",
  "Pular",
  "Soninké",
  "Autre"
];

const nationalites = [
  "Albanaise",
  "Allemande",
  "Andorrane",
  "Autrichienne",
  "Belge",
  "Biélorusse",
  "Bosniaque",
  "Bulgare",
  "Croate",
  "Danoise",
  "Espagnole",
  "Estonienne",
  "Finlandaise",
  "Française",
  "Grecque",
  "Hongroise",
  "Irlandaise",
  "Islandaise",
  "Italienne",
  "Kosovare",
  "Lettone",
  "Liechtensteinoise",
  "Lituanienne",
  "Luxembourgeoise",
  "Macédonienne",
  "Maltaise",
  "Moldave",
  "Monégasque",
  "Monténégrine",
  "Norvégienne",
  "Néerlandaise",
  "Polonaise",
  "Portugaise",
  "Roumaine",
  "Britannique",
  "Russe",
  "Saint-Marinaise",
  "Serbe",
  "Slovaque",
  "Slovène",
  "Suédoise",
  "Suisse",
  "Tchèque",
  "Ukrainienne",
  "Vaticane",
  "Algérienne",
  "Angolaise",
  "Béninoise",
  "Botswanaise",
  "Burkinabé",
  "Burundaise",
  "Camerounaise",
  "Cap-verdienne",
  "Centrafricaine",
  "Comorienne",
  "Congolaise (RDC)",
  "Congolaise (République)",
  "Djiboutienne",
  "Égyptienne",
  "Érythréenne",
  "Éthiopienne",
  "Gabonaise",
  "Gambienne",
  "Ghanéenne",
  "Guinéenne",
  "Équato-guinéenne",
  "Bissau-guinéenne",
  "Ivoirienne",
  "Kényane",
  "Lesothane",
  "Libérienne",
  "Libyenne",
  "Malgache",
  "Malawite",
  "Malienne",
  "Marocaine",
  "Mauricienne",
  "Mauritanienne",
  "Mozambicaine",
  "Namibienne",
  "Nigériane",
  "Nigérienne",
  "Ougandaise",
  "Rwandaise",
  "Sao-toméenne",
  "Sénégalaise",
  "Seychelloise",
  "Sierra-léonaise",
  "Somalienne",
  "Sud-africaine",
  "Soudanaise",
  "Sud-soudanaise",
  "Eswatinienne",
  "Tanzanienne",
  "Tchadienne",
  "Togolaise",
  "Tunisienne",
  "Zambienne",
  "Zimbabwéenne",
  "Afghane",
  "Saoudienne",
  "Arménienne",
  "Azerbaïdjanaise",
  "Bahreïnienne",
  "Bangladaise",
  "Bhoutanaise",
  "Birmane",
  "Brunéienne",
  "Cambodgienne",
  "Chinoise",
  "Chypriote",
  "Nord-coréenne",
  "Sud-coréenne",
  "Émirienne",
  "Géorgienne",
  "Indienne",
  "Indonésienne",
  "Irakienne",
  "Iranienne",
  "Israélienne",
  "Japonaise",
  "Jordanienne",
  "Kazakhe",
  "Kirghize",
  "Koweïtienne",
  "Laotienne",
  "Libanaise",
  "Malaisienne",
  "Maldivienne",
  "Mongole",
  "Népalaise",
  "Omanaise",
  "Ouzbèke",
  "Pakistanaise",
  "Palestinienne",
  "Philippine",
  "Qatarienne",
  "Singapourienne",
  "Sri-lankaise",
  "Syrienne",
  "Tadjike",
  "Thaïlandaise",
  "Timoraise",
  "Turkmène",
  "Turque",
  "Vietnamienne",
  "Yéménite",
  "Américaine",
  "Canadienne",
  "Mexicaine",
  "Antiguaise",
  "Bahaméenne",
  "Barbadienne",
  "Bélizienne",
  "Costaricienne",
  "Cubaine",
  "Dominicaine",
  "Dominiquaise",
  "Grenadienne",
  "Guatémaltèque",
  "Haïtienne",
  "Hondurienne",
  "Jamaïcaine",
  "Nicaraguayenne",
  "Panaméenne",
  "Saint-Christophienne",
  "Saint-Lucienne",
  "Saint-Vincentaise",
  "Salvadorienne",
  "Trinidadienne",
  "Argentine",
  "Bolivienne",
  "Brésilienne",
  "Chilienne",
  "Colombienne",
  "Équatorienne",
  "Guyanienne",
  "Paraguayenne",
  "Péruvienne",
  "Surinamaise",
  "Uruguayenne",
  "Vénézuélienne",
  "Australienne",
  "Fidjienne",
  "Kiribatienne",
  "Marshallaise",
  "Micronésienne",
  "Nauruane",
  "Néo-zélandaise",
  "Palaosienne",
  "Papouane",
  "Samoane",
  "Salomonaise",
  "Tongienne",
  "Tuvaluane",
  "Vanuatuane",
  "Apatride",
  "Réfugié(e)",
  "Autre"
];

const problematiques = [
  'Logement',
  'Santé',
  'Administratif',
  'Emploi',
  'Formation',
  'Social',
  'Familial',
  'Juridique',
  'Financier',
  'Autre'
];

const actions = [
  'Appel téléphonique',
  'Rendez-vous',
  'Courrier',
  'Email',
  'Visite à domicile',
  'Accompagnement',
  'Orientation',
  'Suivi',
  'Information',
  'Autre'
];

const antennes = [
  'Antenne Centre',
  'Antenne Cureghem',
  'Antenne Bizet',
  'Antenne Ouest',
  'PILDA'
];

const partenaires = [
  'CPAS',
  'Mutuelle',
  'Hôpital',
  'Médecin traitant',
  'Service social',
  'Association locale',
  'Centre de formation',
  'Pôle emploi',
  'Autre'
];

const situationsFamiliales = [
  'Célibataire',
  'Marié(e)',
  'Divorcé(e)',
  'Veuf/Veuve',
  'Union libre',
  'Séparé(e)',
  'Autre'
];

const situationsProfessionnelles = [
  'Employé(e)',
  'Ouvrier/Ouvrière',
  'Indépendant(e)',
  'Chômeur/Chômeuse',
  'Pensionné(e)',
  'Étudiant(e)',
  'Au foyer',
  'Invalide',
  'Autre'
];

const revenus = [
  'Salaire',
  'Allocations chômage',
  'Pension',
  'Aide sociale (CPAS)',
  'Allocations familiales',
  'Revenus d\'indépendant',
  'Aucun revenu',
  'Autre'
];

const typesLogement = [
  'Logement social',
  'Logement privé',
  'Hébergement temporaire',
  'Foyer',
  'Rue/Sans-abri',
  'Chez des proches',
  'Autre'
];

async function initializeDropdownOptions() {
  console.log('🚀 Initialisation des options de menu déroulant...');

  // Fonction helper pour créer ou mettre à jour une option
  async function createOrUpdateOption(type: string, value: string, label: string) {
    const existing = await prisma.dropdownOption.findFirst({
      where: { type:type,
        value: value
      }
    });

    if (!existing) {
      await prisma.dropdownOption.create({
        data: {
          type: type,
          value: value,
          label: label
        }
      });
    }
  }

  // Initialiser les langues
  for (const langue of languages) {
    await createOrUpdateOption('langue', langue, langue);
  }
  console.log('✅ Langues initialisées');

  // Initialiser les nationalités
  for (const nationalite of nationalites) {
    await createOrUpdateOption('nationalite', nationalite, nationalite);
  }
  console.log('✅ Nationalités initialisées');

  // Initialiser les partenaires
  for (const partenaire of partenaires) {
    await createOrUpdateOption('partenaire', partenaire, partenaire);
  }
  console.log('✅ Partenaires initialisés');

  // Initialiser les problématiques
  for (const problematique of problematiques) {
    await createOrUpdateOption('problematiques', problematique, problematique);
  }
  console.log('✅ Problématiques initialisées');

  // Initialiser les actions
  for (const action of actions) {
    await createOrUpdateOption('actions', action, action);
  }
  console.log('✅ Actions initialisées');

  // Initialiser les antennes
  for (const antenne of antennes) {
    await createOrUpdateOption('antenne', antenne, antenne);
  }
  console.log('✅ Antennes initialisées');

  // Initialiser les situations familiales
  for (const situation of situationsFamiliales) {
    await createOrUpdateOption('situationFamiliale', situation, situation);
  }
  console.log('✅ Situations familiales initialisées');

  // Initialiser les situations professionnelles
  for (const situation of situationsProfessionnelles) {
    await createOrUpdateOption('situationProfessionnelle', situation, situation);
  }
  console.log('✅ Situations professionnelles initialisées');

  // Initialiser les revenus
  for (const revenu of revenus) {
    await createOrUpdateOption('revenu', revenu, revenu);
  }
  console.log('✅ Revenus initialisés');

  // Initialiser les types de logement
  for (const typeLogement of typesLogement) {
    await createOrUpdateOption('typeLogement', typeLogement, typeLogement);
  }
  console.log('✅ Types de logement initialisés');

  console.log('🎉 Toutes les options ont été initialisées avec succès!');
}

initializeDropdownOptions()
  .then(() => {
    console.log('✅ Script terminé avec succès');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Erreur lors de l\'initialisation:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
