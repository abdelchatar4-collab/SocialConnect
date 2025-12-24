/**
 * Script de batch pour analyser tous les dossiers par mots-clés
 * et extraire automatiquement les problématiques et actions
 *
 * Usage: npx tsx scripts/batch-keyword-analysis.ts [--service=mediation-locale] [--dry-run]
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Parse command line arguments
const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const serviceArg = args.find(a => a.startsWith('--service='));
const targetServiceId = serviceArg ? serviceArg.split('=')[1] : null;

// Fonction de normalisation du texte
function normalize(str: string): string {
    return str
        .toLowerCase()
        .normalize("NFD")
        .replace(/\p{Diacritic}/gu, "")
        .replace(/['']/g, "'")
        .replace(/[«»""]/g, '"');
}

// Liste complète des mots-clés pour les problématiques
const PROBLEMATIQUE_KEYWORDS = [
    // Fiscalité
    {
        type: "Fiscalité",
        mots: ["fiscal", "impot", "impôt", "tax", "revenu", "déclaration", "declaration", "aer", "avertissement-extrait", "précompte", "spf finances", "contribution", "taxe communale", "taxe régionale"]
    },
    // Santé Mentale
    {
        type: "Santé Mentale (dont addiction)",
        mots: ["santé mentale", "psychologique", "psychiatr", "addict", "drogue", "alcool", "toxicoman", "dépression", "anxiété", "bipolaire", "schizophrén", "suicide", "tentative suicide", "burnout", "stress", "trauma", "ptsd", "thérapie", "psy", "médicament psy", "antidépresseur", "sevrage", "cure", "désintox"]
    },
    // CPAS
    {
        type: "CPAS",
        mots: ["cpas", "ris", "revenu d'intégration", "revenu integration", "aide sociale", "aide du cpas", "article 60", "article 61", "enquête sociale", "assistant social cpas", "carte médicale", "aide médicale urgente", "amu", "réquisitoire", "guidance"]
    },
    // Juridique
    {
        type: "Juridique",
        mots: ["juridique", "avocat", "justice", "tribunal", "plainte", "procès", "procédure", "droit", "litige", "contentieux", "pro deo", "aide juridique", "bureau d'aide", "juge", "jugement", "condamnation", "amende", "citation", "huissier", "signification", "greffe"]
    },
    // Suivi pénitentiaire
    {
        type: "Suivi post pénitentiaire/IPPJ",
        mots: ["pénitentiaire", "penitentiaire", "prison", "ippj", "libération", "liberation", "sortie de prison", "conditionnelle", "surveillance", "bracelet", "détention", "incarcération", "maison d'arrêt", "saint-gilles", "forest", "berkendael", "réinsertion"]
    },
    // Hébergement
    {
        type: "Demande d'hébergement (court et moyen terme)",
        mots: ["hébergement", "hebergement", "héberger", "heberger", "accueil", "abri", "refuge", "logement temporaire", "logement d'urgence", "urgence logement", "maison d'accueil", "samusocial", "transit", "insertion logement", "foyer", "centre d'hébergement"]
    },
    // Famille
    {
        type: "Famille/couple",
        mots: ["famille", "couple", "conjoint", "conjointe", "parent", "enfant", "époux", "épouse", "divorce", "séparation", "garde", "violence conjugale", "conflit familial", "pension alimentaire", "droit de visite", "médiation familiale", "sap enfance", "one", "placement", "hébergement égalitaire", "autorité parentale"]
    },
    // Scolarité
    {
        type: "Scolarité",
        mots: ["scolaire", "école", "ecole", "scolarité", "scolarite", "étude", "etude", "inscription scolaire", "décrochage", "redoublement", "orientation scolaire", "pms", "cefa", "enseignement", "professeur", "bulletin", "exclusion scolaire", "absentéisme", "devoir", "examen", "brevet", "cess"]
    },
    // ISP
    {
        type: "ISP",
        mots: ["isp", "insertion socioprofessionnelle", "formation", "emploi", "stage", "job", "travail", "orientation professionnelle", "actiris", "forem", "vdab", "bruxelles formation", "cv", "lettre motivation", "entretien embauche", "chercheur d'emploi", "demandeur d'emploi", "intérim", "activation"]
    },
    // Santé physique
    {
        type: "Santé (physique; handicap; autonomie)",
        mots: ["santé physique", "handicap", "autonomie", "maladie", "soin", "médical", "medecin", "infirmier", "infirmière", "hospitalisation", "prothèse", "fauteuil", "dépendance physique", "kiné", "rééducation", "awiph", "phare", "allocation handicap", "vierge noire", "apa", "inami", "mutuelle", "incapacité", "invalidité"]
    },
    // Endettement
    {
        type: "Endettement/Surendettement",
        mots: ["dette", "endettement", "surendettement", "facture", "impayé", "impayés", "huissier", "plan de paiement", "plan de redressement", "médiation de dettes", "rcd", "règlement collectif", "créancier", "recouvrement", "saisie", "commandement", "mise en demeure", "arriéré", "retard de paiement", "centrale des crédits"]
    },
    // Séjours
    {
        type: "Séjours",
        mots: ["séjour", "sejour", "titre de séjour", "titre de sejour", "carte de séjour", "carte de sejour", "régularisation", "regularisation", "demande d'asile", "asile", "sans-papiers", "sans papiers", "office des étrangers", "cgra", "fedasil", "annexe 35", "ordre de quitter", "recours", "dublin", "protection subsidiaire", "réfugié"]
    },
    // Sans abrisme
    {
        type: "Sans abrisme",
        mots: ["sans-abri", "sans abri", "sdf", "à la rue", "a la rue", "hébergement d'urgence", "hebergement d'urgence", "errance", "dormeur dehors", "maraude", "front commun", "infirmiers de rue", "samusocial", "clochard", "itinérant"]
    },
    // Energie
    {
        type: "Energie (eau;gaz;électricité)",
        mots: ["énergie", "energie", "eau", "gaz", "électricité", "electricite", "facture d'énergie", "facture d'energie", "coupure", "compteur", "fournisseur d'énergie", "fournisseur d'energie", "sibelga", "engie", "totalenergies", "luminus", "vivaqua", "hydrobru", "limiteur", "compteur à budget", "régularisation facture", "index", "relève", "brugel"]
    },
    // Logement
    {
        type: "Logement",
        mots: ["loyer", "bail", "propriétaire", "locataire", "préavis", "insalubrité", "humidité", "moisissure", "travaux", "ais", "agence immobilière sociale", "slrb", "sisp", "logement social", "mutation", "candidature logement", "liste d'attente", "garantie locative", "bloquée", "indexation loyer", "expulsion", "commandement de quitter"]
    },
    // Médiation Locale - Conflits de voisinage (COMPLET)
    {
        type: "Médiation/Conflits de voisinage",
        mots: [
            // Conflits généraux
            "conflit", "dispute", "différend", "altercation", "tension", "litige", "querelle", "désaccord", "mésentente",
            // Voisinage
            "voisin", "voisine", "voisinage", "immeuble", "copropriété", "syndic", "assemblée générale", "règlement copropriété",
            // Nuisances
            "nuisance", "bruit", "tapage", "tapage nocturne", "musique", "fête", "travaux bruyants", "odeur", "odeurs", "poubelle", "poubelles", "déchet", "déchets", "saleté", "propreté",
            // Animaux
            "animal", "animaux", "chien", "chat", "aboiement", "déjection", "crotte",
            // Espaces communs
            "parking", "stationnement", "garage", "cave", "couloir", "escalier", "ascenseur", "terrasse", "balcon", "jardin", "haie", "clôture", "limite propriété", "mitoyenneté",
            // Problèmes spécifiques
            "infiltration", "fuite", "dégât des eaux", "inondation", "vue", "vis-à-vis", "servitude", "empiétement", "arbre", "branche",
            // Termes de médiation
            "médiation", "médiateur", "conciliation", "accord", "négociation", "parties", "arrangement", "compromis", "entente", "solution à l'amiable",
            // Actions
            "plainte voisin", "main courante", "police", "intervention", "pv", "constat"
        ]
    },
    // Autre
    {
        type: "Autre",
        mots: ["autre", "divers", "inclassable", "non classé", "non classe"]
    },
];

// Liste des mots-clés pour les actions
const ACTION_KEYWORDS = [
    { type: "Appel téléphonique", mots: ["appel", "téléphone", "appelé", "contacté par téléphone", "conversation téléphonique", "joignable", "non-joignable", "injoignable"] },
    { type: "Entretien", mots: ["entretien", "rendez-vous", "rdv", "rencontre", "visite", "reçu en entretien"] },
    { type: "Courrier", mots: ["courrier", "lettre", "recommandé", "envoyé", "répondu", "mail", "email", "courriel"] },
    { type: "Accompagnement", mots: ["accompagné", "accompagnement", "allé avec", "soutenu", "aidé à"] },
    { type: "Orientation", mots: ["orienté", "orientation", "redirigé", "référé", "conseillé de contacter", "réorientation"] },
    { type: "Document", mots: ["document", "attestation", "certificat", "formulaire", "rempli", "complété", "dossier"] },
    { type: "Démarche administrative", mots: ["démarche", "administratif", "formalité", "inscription", "demande", "dossier introduit"] },
    { type: "Visite à domicile", mots: ["visite à domicile", "vad", "visite domicile", "visite chez", "passé chez"] },
    { type: "Suivi", mots: ["suivi", "relance", "rappel", "point situation", "état d'avancement", "nouvelles"] },
    // Actions spécifiques à la Médiation Locale
    { type: "Session de médiation", mots: ["session de médiation", "séance médiation", "médiation", "médiateur", "processus de médiation"] },
    { type: "Premier contact parties", mots: ["premier contact", "prise de contact", "contact initial", "partie demandeuse", "partie adverse"] },
    { type: "Accord trouvé", mots: ["accord", "accord verbal", "accord écrit", "entente", "compromis", "solution", "résolution", "apaisement"] },
    { type: "Refus d'une partie", mots: ["refus", "refus de l'une partie", "refus des deux", "refuse de participer", "ne souhaite pas"] },
    { type: "Clôture dossier", mots: ["clôturé", "clôture", "dossier clôturé", "fermé", "fin de suivi", "statut import: clôturé"] },
    { type: "Impossibilité technique", mots: ["impossibilité", "impossible", "non joignable", "non-joignables", "impossibilité technique"] },
];

async function analyzeUser(user: any): Promise<{
    newProblematiques: { type: string; description: string }[];
    newActions: { type: string; description: string; date: Date }[];
}> {
    const notes = normalize([user.notesGenerales, user.remarques, user.informationImportante].filter(Boolean).join(' '));

    const newProblematiques: { type: string; description: string }[] = [];
    const newActions: { type: string; description: string; date: Date }[] = [];

    // Analyser pour les problématiques
    for (const keyword of PROBLEMATIQUE_KEYWORDS) {
        for (const mot of keyword.mots) {
            // Match exact pour les mots courts pour éviter les faux positifs (ex: "apa" vs "apaisement")
            const regex = mot.length <= 3
                ? new RegExp(`\\b${mot}\\b`, 'i')
                : new RegExp(`\\b${mot}\\w*`, 'i');

            if (regex.test(notes)) {
                // Vérifier si cette problématique n'existe pas déjà
                const existing = user.problematiques?.find((p: any) =>
                    normalize(p.type).includes(normalize(keyword.type)) ||
                    normalize(keyword.type).includes(normalize(p.type))
                );
                if (!existing) {
                    newProblematiques.push({
                        type: keyword.type,
                        description: `Détecté automatiquement via mot-clé "${mot}"`
                    });
                }
                break; // Un seul match par catégorie suffit
            }
        }
    }

    // Analyser pour les actions (optionnel, plus complexe car besoin de dates)
    for (const keyword of ACTION_KEYWORDS) {
        for (const mot of keyword.mots) {
            const regex = new RegExp(`\\b${mot}\\w*`, 'i');
            if (regex.test(notes)) {
                // Vérifier si cette action n'existe pas déjà
                const existing = user.actions?.find((a: any) =>
                    normalize(a.type).includes(normalize(keyword.type))
                );
                if (!existing) {
                    newActions.push({
                        type: keyword.type,
                        description: `Détecté automatiquement via mot-clé "${mot}"`,
                        date: new Date()
                    });
                }
                break;
            }
        }
    }

    return { newProblematiques, newActions };
}

async function main() {
    console.log('🔍 Analyse par mots-clés de tous les dossiers...');
    console.log(dryRun ? '📋 Mode DRY-RUN : aucune modification ne sera effectuée' : '⚠️ Mode RÉEL : les modifications seront sauvegardées');

    if (targetServiceId) {
        console.log(`🎯 Service ciblé : ${targetServiceId}`);
    }

    // Récupérer tous les utilisateurs
    const whereClause = targetServiceId ? { serviceId: targetServiceId } : {};
    const users = await prisma.user.findMany({
        where: whereClause,
        include: {
            problematiques: true,
            actions: true,
        }
    });

    console.log(`📊 ${users.length} dossiers à analyser\n`);

    let totalNewProblematiques = 0;
    let totalNewActions = 0;
    let usersModified = 0;

    for (const user of users) {
        const { newProblematiques, newActions } = await analyzeUser(user);

        if (newProblematiques.length > 0 || newActions.length > 0) {
            usersModified++;
            console.log(`\n📁 ${user.nom} ${user.prenom} (${user.id})`);

            if (newProblematiques.length > 0) {
                console.log(`   ✨ ${newProblematiques.length} nouvelles problématiques :`);
                for (const p of newProblematiques) {
                    console.log(`      - ${p.type}`);
                }
                totalNewProblematiques += newProblematiques.length;

                if (!dryRun) {
                    for (const p of newProblematiques) {
                        await prisma.problematique.create({
                            data: {
                                type: p.type,
                                description: p.description,
                                userId: user.id,
                            }
                        });
                    }
                }
            }

            if (newActions.length > 0) {
                console.log(`   📝 ${newActions.length} nouvelles actions :`);
                for (const a of newActions) {
                    console.log(`      - ${a.type}`);
                }
                totalNewActions += newActions.length;

                if (!dryRun) {
                    for (const a of newActions) {
                        await prisma.actionSuivi.create({
                            data: {
                                type: a.type,
                                description: a.description,
                                date: a.date,
                                userId: user.id,
                            }
                        });
                    }
                }
            }
        }
    }

    console.log('\n' + '='.repeat(60));
    console.log('📊 RÉSUMÉ');
    console.log('='.repeat(60));
    console.log(`📁 Dossiers analysés : ${users.length}`);
    console.log(`✏️ Dossiers modifiés : ${usersModified}`);
    console.log(`✨ Nouvelles problématiques : ${totalNewProblematiques}`);
    console.log(`📝 Nouvelles actions : ${totalNewActions}`);

    if (dryRun) {
        console.log('\n⚠️ Mode DRY-RUN : Aucune modification n\'a été effectuée.');
        console.log('   Relancez sans --dry-run pour appliquer les changements.');
    } else {
        console.log('\n✅ Modifications appliquées avec succès !');
    }
}

main()
    .catch((e) => {
        console.error('❌ Erreur:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
