/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect - Admin Context Constants
*/

export const DEFAULT_VISIBLE_COLUMNS: Record<string, boolean> = {
    nom: true, prenom: true, dateNaissance: false, telephone: true, email: false,
    antenne: true, secteur: true, gestionnaire: true, etat: true, adresse: false,
    problematiques: true, actions: true, dossier: true
};

export const DEFAULT_VISIBLE_FORM_SECTIONS: Record<string, boolean> = {
    identity: true, contact: true, address: true, management: true, situation: true,
    housing: true, prevExp: true, problems: true, mediation: true, notes: true, confidential: true
};

export const INITIAL_SETTINGS = {
    serviceName: "LE PÔLE ACCUEIL SOCIAL DES QUARTIERS",
    logoUrl: "/logo-accueil-social.png",
    primaryColor: "#1e3a8a",
    headerSubtitle: "PORTAIL DE GESTION",
    showCommunalLogo: true,
    activeHolidayTheme: "NONE"
};

// Document Settings Defaults
export const DEFAULT_DOC_SETTINGS = {
    retentionPeriod: "3 ans",
    serviceAddress: "Rue du Chapelain, 2 / Kapelaanstraat",
    serviceCity: "1070 ANDERLECHT",
    servicePhone: "",
    footerText: "Document généré par SocialConnect",
    rgpdTitle: "Formulaire de consentement pour le traitement et l'échange de données personnelles dans le cadre du traitement d'un dossier social",
    rgpdSections: {
        intro: true,
        pourquoi: true,
        stockage: true,
        conservation: true,
        acces: true,
        signature: true
    } as Record<string, boolean>,
    userProfileSections: {
        identite: true,
        contact: true,
        situationSociale: true,
        gestion: true,
        logement: true,
        prevExp: true,
        notes: true
    } as Record<string, boolean>,
    antenneAddresses: {
        cureghem: { rue: "Clos de l'équerre, 11", cp: "1070 ANDERLECHT" },
        centre: { rue: "Rue du Greffe, 5A", cp: "1070 ANDERLECHT" },
        default: { rue: "Rue du Chapelain, 2 / Kapelaanstraat", cp: "1070 ANDERLECHT" }
    } as Record<string, { rue: string; cp: string }>
};
