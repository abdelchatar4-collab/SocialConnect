/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect - Statistics Types
*/

export interface GeneralStats {
    total: number;
    actifs: number;
    nouveauxCeMois: number;
    dossiersClotures: number;
    parAntenne: Record<string, number>;
    changeTotal: number;
    changeActifs: number;
    changeNouveaux: number;
    changeClotures: number;
}

export interface DemographicStats {
    parGenre: Record<string, number>;
    parAge: Record<string, number>;
    topNationalites: [string, number][];
}

export interface ProblematiquesStats {
    total: number;
    repartition: [string, number][];
    moyenneParUsager: string;
}

export interface EvolutionStats {
    labels: string[];
    nouveauxParMois: number[];
    cloturesParMois: number[];
}

export interface ActionsStats {
    totalActions: number;
    typesActions: [string, number][];
    moyenneParUsager: string;
}

export interface ChargeStats {
    parGestionnaire: [string, number][];
}

export interface Statistics {
    general: GeneralStats;
    demographic: DemographicStats;
    problematiques: ProblematiquesStats;
    evolution: EvolutionStats;
    actions: ActionsStats;
    charge: ChargeStats;
}

export type TimeFilter = 'all' | 'year' | 'quarter' | 'month';
