/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect - Analytics Types
*/

export interface UserStats {
    total: number;
    byStatus: Record<string, number>;
    byNationality: Record<string, number>;
    byAntenne: Record<string, number>;
    byGestionnaire: Record<string, number>;
    byAgeGroup: Record<string, number>;
    bySector: Record<string, number>;
    byMonth: Record<string, number>;
    recentlyAdded: number;
    recentlyUpdated: number;
}

export interface AdvancedFilters {
    dateRange?: { start: string; end: string };
    statusList?: string[];
    nationalityList?: string[];
    antenneList?: string[];
    gestionnaireList?: string[];
    ageGroups?: string[];
    sectors?: string[];
    hasEmail?: boolean;
    hasPhone?: boolean;
    hasPreviousExperience?: boolean;
}
