/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect - User Sub-Interfaces
*/

export interface Mutuelle {
    id?: string | null;
    nom?: string | null;
    numeroAdherent?: string | null;
    dateAdhesion?: string | Date | null;
    options?: string[] | null;
}

export interface DocumentType {
    id?: string;
    nom: string;
    type: 'pdf' | 'excel' | 'word' | 'image' | 'archive' | 'other';
    taille?: number;
    dateCreation?: Date | string | null;
    dateModification?: Date | string | null;
    chemin?: string;
    userId?: string;
}

export interface MetaData {
    version?: string;
    source?: string;
    importedAt?: Date | string | null;
    lastSync?: Date | string | null;
    tags?: string[];
    notes?: string;
    [key: string]: any;
}

export interface Gestionnaire {
    id: string;
    prenom: string;
    nom: string | null;
    email?: string | null;
    role?: string | null;
    couleurMedaillon?: string | null;
}

export interface Adresse {
    id?: string;
    rue?: string | null;
    numero?: string | null;
    boite?: string | null;
    codePostal?: string | null;
    ville?: string | null;
    quartier?: string | null;
    pays?: string | null;
    secteur?: string | null;
    userId?: string;
}

export interface Problematique {
    id?: string;
    type: string;
    description: string;
    dateSignalement: string;
    detail?: string | null;
    userId?: string;
}

export interface ActionSuivi {
    id?: string;
    date?: string | Date | null;
    type?: string | null;
    titre?: string | null;
    statut?: string | null;
    priorite?: string | null;
    echeance?: string | Date | null;
    responsable?: string | null;
    description?: string | null;
    partenaire?: string | null;
    userId?: string;
}
