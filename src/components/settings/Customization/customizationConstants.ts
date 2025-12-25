/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect - Customization Settings Constants
*/

export const PRESET_COLORS = [
    { name: 'Bleu professionnel', color: '#1e3a8a' },
    { name: 'Bleu ciel', color: '#0284c7' },
    { name: 'Indigo', color: '#4f46e5' },
    { name: 'Violet', color: '#7c3aed' },
    { name: 'Rose', color: '#db2777' },
    { name: 'Rouge', color: '#dc2626' },
    { name: 'Orange', color: '#ea580c' },
    { name: 'Vert émeraude', color: '#059669' },
    { name: 'Vert forêt', color: '#16a34a' },
    { name: 'Turquoise PASQ', color: '#0891b2' },
    { name: 'Gris ardoise', color: '#475569' },
    { name: 'Gris foncé', color: '#374151' }
];

export const FIELDS_BY_SECTION = [
    {
        section: 'Identification & Contact', icon: '👤',
        fields: [
            { id: 'nom', label: 'Nom' }, { id: 'prenom', label: 'Prénom' },
            { id: 'telephone', label: 'Téléphone' }, { id: 'email', label: 'Email' },
            { id: 'premierContact', label: 'Premier contact' }, { id: 'adresse.rue', label: 'Rue' },
            { id: 'adresse.codePostal', label: 'Code postal' }, { id: 'adresse.ville', label: 'Ville' }
        ]
    },
    {
        section: 'Informations personnelles', icon: '📋',
        fields: [
            { id: 'dateNaissance', label: 'Date de naissance' }, { id: 'genre', label: 'Genre' },
            { id: 'nationalite', label: 'Nationalité' }, { id: 'statutSejour', label: 'Statut de séjour' },
            { id: 'langue', label: 'Langue(s)' }, { id: 'situationProfessionnelle', label: 'Situation pro' }
        ]
    },
    {
        section: 'Gestion administrative', icon: '⚙️',
        fields: [
            { id: 'gestionnaire', label: 'Gestionnaire' }, { id: 'antenne', label: 'Antenne' },
            { id: 'etat', label: 'État du dossier' }, { id: 'dateOuverture', label: "Date d'ouverture" },
            { id: 'partenaire', label: 'Partenaire(s)' }
        ]
    },
    {
        section: 'Logement', icon: '🏠',
        fields: [
            { id: 'logementDetails.typeLogement', label: 'Type logement' }, { id: 'logementDetails.proprietaire', label: 'Propriétaire' },
            { id: 'logementDetails.loyer', label: 'Loyer' }, { id: 'revenus', label: 'Revenus' }
        ]
    }
];
