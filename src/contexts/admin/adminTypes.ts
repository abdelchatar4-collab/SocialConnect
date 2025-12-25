/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect - Admin Context Types
*/

import { ReactNode } from 'react';

export interface AdminContextType {
    isAdmin: boolean;
    toggleAdmin: () => void;
    selectedYear: number;
    setSelectedYear: (year: number) => void;
    availableYears: number[];
    setAvailableYears: (years: number[]) => void;
    serviceName: string;
    setServiceName: (name: string) => void;
    logoUrl: string;
    setLogoUrl: (url: string) => void;
    primaryColor: string;
    setPrimaryColor: (color: string) => void;
    headerSubtitle: string;
    setHeaderSubtitle: (subtitle: string) => void;
    showCommunalLogo: boolean;
    setShowCommunalLogo: (show: boolean) => void;
    requiredFields: string[];
    setRequiredFields: (fields: string[]) => void;
    enableBirthdays: boolean;
    setEnableBirthdays: (enable: boolean) => void;
    colleagueBirthdays: { name: string; date: string }[];
    setColleagueBirthdays: (birthdays: { name: string; date: string }[]) => void;
    activeHolidayTheme: string;
    setActiveHolidayTheme: (theme: string) => void;
    enabledModules: Record<string, boolean>;
    setEnabledModules: (modules: Record<string, boolean>) => void;
    visibleColumns: Record<string, boolean>;
    setVisibleColumns: (columns: Record<string, boolean>) => void;
    visibleFormSections: Record<string, boolean>;
    setVisibleFormSections: (sections: Record<string, boolean>) => void;
    // Document Settings
    docRetentionPeriod: string;
    setDocRetentionPeriod: (period: string) => void;
    docServiceAddress: string;
    setDocServiceAddress: (address: string) => void;
    docServiceCity: string;
    setDocServiceCity: (city: string) => void;
    docServicePhone: string;
    setDocServicePhone: (phone: string) => void;
    docAntenneAddresses: Record<string, { rue: string; cp: string }>;
    setDocAntenneAddresses: (addresses: Record<string, { rue: string; cp: string }>) => void;
    docFooterText: string;
    setDocFooterText: (text: string) => void;
    docRgpdTitle: string;
    setDocRgpdTitle: (title: string) => void;
    docRgpdSections: Record<string, boolean>;
    setDocRgpdSections: (sections: Record<string, boolean>) => void;
    docUserProfileSections: Record<string, boolean>;
    setDocUserProfileSections: (sections: Record<string, boolean>) => void;
    saveSettings: () => Promise<void>;
    isLoadingSettings: boolean;
}

export interface AdminProviderProps { children: ReactNode; }
