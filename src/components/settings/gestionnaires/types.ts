export interface Gestionnaire {
    id: string;
    nom?: string | null;
    prenom: string;
    email?: string | null;
    role?: string | null;
    couleurMedaillon?: string | null;
    isActive?: boolean;
}

export interface SessionUserWithRole {
    id?: string | null;
    name?: string | null;
    email?: string | null;
    role?: string | null;
}
