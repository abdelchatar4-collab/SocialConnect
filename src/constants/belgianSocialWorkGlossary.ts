/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect est un logiciel libre : vous pouvez le redistribuer et/ou le modifier selon les termes de la Licence Publique Générale GNU telle que publiée par la Free Software Foundation, soit la version 3 de la licence, soit (à votre convenance) toute version ultérieure.

Ce programme est distribué dans l'espoir qu'il sera utile, mais SANS AUCUNE GARANTIE ; sans même la garantie implicite de COMMERCIALISATION ou d'ADÉQUATION À UN USAGE PARTICULIER. Voir la Licence Publique Générale GNU pour plus de détails.
*/

/**
 * Glossaire du Travail Social Belge
 *
 * Ce fichier contient les définitions des termes spécifiques au travail social
 * en Belgique. Il est utilisé par l'IA pour mieux comprendre le contexte.
 */

export const BELGIAN_SOCIAL_WORK_GLOSSARY = {
    // === INSTITUTIONS PRINCIPALES ===
    CPAS: "Centre Public d'Action Sociale - Organisme public communal garantissant la dignité humaine via aide sociale, financière et accompagnement",
    RIS: "Revenu d'Intégration Sociale - Aide financière mensuelle du CPAS pour personnes sans ressources suffisantes",
    PIIS: "Projet Individualisé d'Intégration Sociale - Contrat entre bénéficiaire et CPAS définissant étapes d'insertion",
    SPP_IS: "Service Public Fédéral de Programmation Intégration sociale",

    // === AIDES ET DISPOSITIFS ===
    Article_60: "Mesure d'insertion professionnelle par mise à l'emploi via le CPAS",
    ASE: "Aide Sociale Équivalente - Aide financière pour personnes ne pouvant prétendre au RIS",
    ERIS: "Équivalent du Revenu d'Intégration Sociale",
    ISP: "Insertion Socioprofessionnelle - Actions pour retrouver une place dans la société",
    AMU: "Aide Médicale Urgente - Aide financière du CPAS pour frais médicaux nécessaires",
    DIS: "Droit à l'Intégration Sociale - Droit au RIS et accompagnement vers l'emploi",
    Adresse_de_reference: "Adresse d'inscription à la commune pour personnes sans domicile fixe, souvent au CPAS",

    // === LOGEMENT ===
    VAD: "Visite À Domicile - Visite du travailleur social au domicile de l'usager",
    Bail_enregistre: "Contrat de location officiellement déposé au bureau d'enregistrement",
    Preavis: "Délai légal avant fin de bail ou expulsion",
    Garantie_locative: "Caution versée au propriétaire (max 2-3 mois de loyer en Belgique)",
    Expulsion: "Procédure judiciaire de retrait forcé d'un locataire",
    AIS: "Agence Immobilière Sociale - ASBL médiateur entre propriétaires et locataires à revenus modestes",
    Logement_social: "Habitation destinée aux personnes à revenus modestes, gérée par sociétés régionales",
    Treve_hivernale: "Période du 1/11 au 15/03 où les expulsions sont interdites (Bruxelles/Wallonie)",
    Salubrite: "Conditions minimales rendant un logement sain et habitable",

    // === JURIDIQUE ===
    Juge_de_paix: "Juge compétent pour litiges locatifs et autorisations d'expulsion",
    Justice_de_paix: "Premier degré de juridiction pour litiges locatifs en Belgique",
    Tribunal_du_travail: "Instance judiciaire pour contester les décisions des CPAS",
    Cour_du_travail: "Juridiction d'appel des décisions du Tribunal du travail",
    Huissier_de_justice: "Officier chargé de signifier actes de procédure et exécuter expulsions",
    Mise_en_demeure: "Demande formelle de respecter une obligation (ex: payer loyers)",
    Requete: "Demande écrite adressée à un juge pour initier une procédure",
    Aide_juridique: "Assistance par avocat gratuite ou à coût réduit (anciennement pro deo)",
    Enquete_sociale: "Évaluation de la situation sociale par le CPAS pour déterminer l'aide",

    // === MÉDIATION DE DETTES ===
    Mediateur_de_dettes: "Professionnel analysant l'endettement et négociant avec créanciers",
    RCD: "Règlement Collectif de Dettes - Procédure judiciaire pour rétablir situation financière",
    Mediation_amiable: "Négociation avec créanciers sans intervention judiciaire",

    // === ALLOCATIONS FAMILIALES ===
    FAMIRIS: "Caisse d'allocations familiales bruxelloise",
    KidsLife: "Caisse d'allocations familiales en Belgique",
    Groeipakket: "Nom des allocations familiales en Flandre",
    FamiWal: "Caisse wallonne d'allocations familiales",
    Allocataire: "Personne à qui sont versées les allocations familiales",
    Prime_de_naissance: "Aide financière versée lors de la naissance d'un enfant",
    Supplement_social: "Montant additionnel aux allocations selon revenus du ménage",

    // === ÉNERGIE ===
    Tarif_social_energie: "Tarif préférentiel énergie pour allocataires sociaux",
    Client_protege: "Statut offrant protections contre coupures d'énergie",
    Fonds_Gaz_Electricite: "Aide CPAS pour paiement factures d'énergie",
    Fonds_social_mazout: "Aide pour achat de mazout de chauffage",
    Tuteur_energie: "Expert CPAS accompagnant ménages en précarité énergétique",
    Precarite_energetique: "Difficulté à payer factures d'énergie ou se chauffer",

    // === ORGANISMES PARTENAIRES ===
    Mutuelle: "Assurance maladie obligatoire en Belgique (Helan, Partenamut, Solidaris...)",
    ONEM: "Office National de l'Emploi - Allocations chômage",
    FOREM: "Service public wallon de l'emploi et formation",
    ACTIRIS: "Service bruxellois de l'emploi",
    VDAB: "Service flamand de l'emploi",
    GRAPA: "Garantie de Revenus aux Personnes Âgées",
    BIM: "Bénéficiaire de l'Intervention Majorée - Remboursement accru frais médicaux",
    Iriscare: "Organisme bruxellois gérant aides aux personnes (allocations familiales, dépendance)",

    // === STATUTS SPÉCIFIQUES ===
    Debiteur_alimentaire: "Personne ayant obligation légale de verser pension alimentaire",
    Dignite_humaine: "Principe fondamental: accès nourriture, logement, soins, hygiène",
    Sejour_limite: "Carte A - Titre de séjour temporaire en Belgique",
    Sejour_illimite: "Carte B - Titre de séjour permanent en Belgique",

    // === PRÉVENTION EXPULSION (spécifique PASQ) ===
    Negociation_proprio: "Médiation entre locataire et propriétaire pour éviter expulsion",
    Maintien_logement: "Objectif de garder l'usager dans son logement actuel",
    Relogement: "Recherche d'un nouveau logement pour l'usager",
    SPRB: "Service Public Régional de Bruxelles",
};

/**
 * Génère le texte du glossaire COMPLET pour inclusion dans les prompts IA
 */
export function getGlossaryPromptText(): string {
    const entries = Object.entries(BELGIAN_SOCIAL_WORK_GLOSSARY)
        .map(([term, definition]) => `- ${term.replace(/_/g, ' ')}: ${definition}`)
        .join('\n');

    return `
VOCABULAIRE DU TRAVAIL SOCIAL BELGE (utilise ces définitions) :
${entries}
`;
}

/**
 * Version courte du glossaire pour prompts limités (évite dépasser contexte)
 */
export function getShortGlossaryPromptText(): string {
    const shortTerms = [
        'CPAS = Centre Public d\'Action Sociale (aide sociale communale)',
        'RIS = Revenu d\'Intégration Sociale (équivalent RSA)',
        'PIIS = Projet Individualisé d\'Intégration Sociale',
        'VAD = Visite À Domicile',
        'ASE = Aide Sociale Équivalente',
        'AMU = Aide Médicale Urgente',
        'Article 60 = Mise à l\'emploi via CPAS',
        'AIS = Agence Immobilière Sociale',
        'RCD = Règlement Collectif de Dettes',
        'Mutuelle = Assurance maladie belge (Helan, Solidaris...)',
        'ONEM = Allocations chômage',
        'ACTIRIS/FOREM = Services emploi Bruxelles/Wallonie',
        'Justice de paix = Tribunal pour litiges locatifs',
        'Tarif social = Prix réduit énergie pour allocataires',
        'Trêve hivernale = Pas d\'expulsion du 1/11 au 15/03',
        'BIM = Intervention Majorée (remboursement médicaux accru)',
        'GRAPA = Garantie Revenus Personnes Âgées',
    ];

    return `
ABRÉVIATIONS BELGES DU TRAVAIL SOCIAL :
${shortTerms.join('\n')}
`;
}

