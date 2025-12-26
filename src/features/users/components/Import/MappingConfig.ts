export interface ImportField {
    key: string;
    label: string;
    required?: boolean;
}

export interface MappingCategory {
    name: string;
    isCore?: boolean;
    isSpecialized?: boolean;
    fields: ImportField[];
}

export const IMPORT_CATEGORIES: MappingCategory[] = [
    {
        name: 'Identité',
        isCore: true,
        fields: [
            { key: 'nom', label: 'Nom', required: true },
            { key: 'prenom', label: 'Prénom', required: true },
            { key: 'dateNaissance', label: 'Date de Naissance' },
            { key: 'genre', label: 'Sexe / Genre' },
            { key: 'nationalite', label: 'Nationalité' },
            { key: 'statutSejour', label: 'Statut séjour' },
            { key: 'trancheAge', label: 'Tranche d\'âge' },
            { key: 'langue', label: 'Langue usuelle' },
        ]
    },
    {
        name: 'Contact & Localisation',
        isCore: true,
        fields: [
            { key: 'email', label: 'E-mail' },
            { key: 'telephone', label: 'Téléphone' },
            { key: 'adresse', label: 'Adresse (Rue)' },
            { key: 'numero', label: 'N° / Boîte' },
            { key: 'codePostal', label: 'Code Postal' },
            { key: 'ville', label: 'Ville' },
        ]
    },
    {
        name: 'Suivi & Dossier',
        isCore: true,
        fields: [
            { key: 'dateOuverture', label: 'Date d\'ouverture', required: false },
            { key: 'etat', label: 'Statut du dossier' },
            { key: 'remarques', label: 'Remarques / Notes' },
            { key: 'gestionnaire', label: 'Titulaire / Gestionnaire' },
            { key: 'premierContact', label: 'Source / Origine' },
            { key: 'partenaire', label: 'Partenaire référent' },
        ]
    },
    {
        name: 'Détails Additionnels',
        fields: [
            { key: 'notesGenerales', label: 'Notes détaillées (Historique)' },
            { key: 'informationImportante', label: 'Information importante' },
            { key: 'situationProfessionnelle', label: 'Situation Pro' },
            { key: 'revenus', label: 'Revenus' },
            { key: 'pays', label: 'Pays' },
            { key: 'secteur', label: 'Secteur géographique' },
            { key: 'antenne', label: 'Antenne / Site' },
        ]
    },
    {
        name: 'Prévention Expulsion (PrevExp)',
        isSpecialized: true,
        fields: [
            { key: 'prevExpDateReception', label: 'PrevExp: Date Réception' },
            { key: 'prevExpDateRequete', label: 'PrevExp: Date Requête' },
            { key: 'prevExpDateVad', label: 'PrevExp: Date VAD' },
            { key: 'prevExpDecision', label: 'PrevExp: Décision' },
            { key: 'prevExpCommentaire', label: 'PrevExp: Commentaire' },
            { key: 'prevExpAideJuridique', label: 'PrevExp: Aide Juridique' },
            { key: 'prevExpDateAudience', label: 'PrevExp: Date Audience' },
            { key: 'prevExpDateExpulsion', label: 'PrevExp: Date Expulsion' },
            { key: 'prevExpDateJugement', label: 'PrevExp: Date Jugement' },
            { key: 'prevExpDateSignification', label: 'PrevExp: Date Signification' },
            { key: 'prevExpDemandeCpas', label: 'PrevExp: Demande CPAS' },
            { key: 'prevExpEtatLogement', label: 'PrevExp: État Logement' },
            { key: 'prevExpMaintienLogement', label: 'PrevExp: Maintien Logement' },
            { key: 'prevExpMotifRequete', label: 'PrevExp: Motif Requête' },
            { key: 'prevExpNegociationProprio', label: 'PrevExp: Négociation Proprio' },
            { key: 'prevExpNombreChambre', label: 'PrevExp: Nombre Chambres' },
            { key: 'prevExpSolutionRelogement', label: 'PrevExp: Solution Relogement' },
            { key: 'prevExpTypeFamille', label: 'PrevExp: Type Famille' },
            { key: 'prevExpTypeRevenu', label: 'PrevExp: Type Revenu' },
            { key: 'prevExpDossierOuvert', label: 'PrevExp: Dossier Ouvert' },
        ]
    },
    {
        name: 'Médiation',
        isSpecialized: true,
        fields: [
            { key: 'mediationType', label: 'Médiation: Type' },
            { key: 'mediationDemandeur', label: 'Médiation: Demandeur' },
            { key: 'mediationPartieAdverse', label: 'Médiation: Partie Adverse' },
            { key: 'mediationStatut', label: 'Médiation: Statut' },
            { key: 'mediationDescription', label: 'Médiation: Description' },
        ]
    }
];
