/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect est un logiciel libre : vous pouvez le redistribuer et/ou le modifier selon les termes de la Licence Publique Générale GNU telle que publiée par la Free Software Foundation, soit la version 3 de la licence, soit (à votre convenance) toute version ultérieure.

Ce programme est distribué dans l'espoir qu'il sera utile, mais SANS AUCUNE GARANTIE ; sans même la garantie implicite de COMMERCIALISATION ou d'ADÉQUATION À UN USAGE PARTICULIER. Voir la Licence Publique Générale GNU pour plus de détails.
*/

"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useSession } from 'next-auth/react';

interface SessionUserWithRole {
  id?: string | null;
  name?: string | null;
  email?: string | null;
  role?: string | null;
}

// Configuration par défaut des colonnes visibles dans UserList
export const DEFAULT_VISIBLE_COLUMNS: Record<string, boolean> = {
  nom: true,
  prenom: true,
  dateNaissance: false, // Date de naissance - masquée par défaut
  telephone: true,
  email: false,
  antenne: true,
  secteur: true,
  gestionnaire: true,
  etat: true,
  adresse: false,
  problematiques: true,
  actions: true,
  dossier: true
};

// Configuration par défaut des sections de formulaire visibles
export const DEFAULT_VISIBLE_FORM_SECTIONS: Record<string, boolean> = {
  identity: true,      // Nom, prénom, genre, date naissance, nationalité (toujours visible)
  contact: true,       // Téléphone, email, langue
  address: true,       // Adresse complète
  management: true,    // Gestionnaire, antenne, secteur, état, dates
  situation: true,     // Statut séjour, situation pro, revenus, tranche âge
  housing: true,       // Logement détaillé
  prevExp: true,       // Prévention expulsion
  problems: true,      // Problématiques & actions
  mediation: true,     // Champs médiation (type, parties, etc.)
  notes: true,         // Notes, remarques, infos importantes
  confidential: true   // Données confidentielles
};

interface AdminContextType {
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
  // New customization settings
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
  colleagueBirthdays: Array<{ name: string; date: string }>;
  setColleagueBirthdays: (birthdays: Array<{ name: string; date: string }>) => void;
  activeHolidayTheme: string;
  setActiveHolidayTheme: (theme: string) => void;
  enabledModules: Record<string, boolean>;
  setEnabledModules: (modules: Record<string, boolean>) => void;
  // Column visibility settings for UserList
  visibleColumns: Record<string, boolean>;
  setVisibleColumns: (columns: Record<string, boolean>) => void;
  // Form section visibility settings
  visibleFormSections: Record<string, boolean>;
  setVisibleFormSections: (sections: Record<string, boolean>) => void;
  saveSettings: () => Promise<void>;
  isLoadingSettings: boolean;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export const AdminProvider = ({ children }: { children: ReactNode }) => {
  const { data: session, status } = useSession();
  const [isAdmin, setIsAdmin] = useState(false);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [availableYears, setAvailableYears] = useState<number[]>([new Date().getFullYear(), new Date().getFullYear() + 1]);

  // Settings state
  const [serviceName, setServiceName] = useState("LE PÔLE ACCUEIL SOCIAL DES QUARTIERS");
  const [logoUrl, setLogoUrl] = useState("/logo-accueil-social.png");
  const [primaryColor, setPrimaryColor] = useState("#1e3a8a");
  const [headerSubtitle, setHeaderSubtitle] = useState("PORTAIL DE GESTION");
  const [showCommunalLogo, setShowCommunalLogo] = useState(true);
  const [requiredFields, setRequiredFields] = useState<string[]>([]);
  const [enableBirthdays, setEnableBirthdays] = useState(false);
  const [colleagueBirthdays, setColleagueBirthdays] = useState<Array<{ name: string; date: string }>>([]);
  const [activeHolidayTheme, setActiveHolidayTheme] = useState("NONE");
  const [enabledModules, setEnabledModules] = useState<Record<string, boolean>>({});
  const [visibleColumns, setVisibleColumns] = useState<Record<string, boolean>>(DEFAULT_VISIBLE_COLUMNS);
  const [visibleFormSections, setVisibleFormSections] = useState<Record<string, boolean>>(DEFAULT_VISIBLE_FORM_SECTIONS);
  const [isLoadingSettings, setIsLoadingSettings] = useState(true);

  // Fetch settings from API on mount
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await fetch('/api/settings');
        if (response.ok) {
          const settings = await response.json();
          setServiceName(settings.serviceName || "LE PÔLE ACCUEIL SOCIAL DES QUARTIERS");
          setLogoUrl(settings.logoUrl || "/logo-accueil-social.png");
          setPrimaryColor(settings.primaryColor || "#1e3a8a");
          setHeaderSubtitle(settings.headerSubtitle || "PORTAIL DE GESTION");
          setShowCommunalLogo(settings.showCommunalLogo !== undefined ? settings.showCommunalLogo : true);

          // Parse requiredFields - handle both string (JSON) and array formats
          if (settings.requiredFields) {
            try {
              const parsedFields = typeof settings.requiredFields === 'string'
                ? JSON.parse(settings.requiredFields)
                : settings.requiredFields;
              setRequiredFields(Array.isArray(parsedFields) ? parsedFields : []);
            } catch (e) {
              setRequiredFields([]);
            }
          }

          setEnableBirthdays(settings.enableBirthdays || false);

          // Parse colleagueBirthdays - handle both string (JSON) and array formats
          if (settings.colleagueBirthdays) {
            try {
              const parsedBirthdays = typeof settings.colleagueBirthdays === 'string'
                ? JSON.parse(settings.colleagueBirthdays)
                : settings.colleagueBirthdays;
              setColleagueBirthdays(Array.isArray(parsedBirthdays) ? parsedBirthdays : []);
            } catch (e) {
              console.error('[AdminContext] Error parsing colleagueBirthdays:', e);
              setColleagueBirthdays([]);
            }
          }
          setActiveHolidayTheme(settings.activeHolidayTheme || "NONE");

          // Parse enabledModules
          if (settings.enabledModules) {
            try {
              const parsedModules = typeof settings.enabledModules === 'string'
                ? JSON.parse(settings.enabledModules)
                : settings.enabledModules;
              setEnabledModules(parsedModules || {});
            } catch (e) {
              console.error('[AdminContext] Error parsing enabledModules:', e);
            }
          }

          // Parse visibleColumns
          if (settings.visibleColumns) {
            try {
              const parsedColumns = typeof settings.visibleColumns === 'string'
                ? JSON.parse(settings.visibleColumns)
                : settings.visibleColumns;
              setVisibleColumns({ ...DEFAULT_VISIBLE_COLUMNS, ...parsedColumns });
            } catch (e) {
              console.error('[AdminContext] Error parsing visibleColumns:', e);
            }
          }

          // Parse visibleFormSections
          if (settings.visibleFormSections) {
            try {
              const parsedSections = typeof settings.visibleFormSections === 'string'
                ? JSON.parse(settings.visibleFormSections)
                : settings.visibleFormSections;
              setVisibleFormSections({ ...DEFAULT_VISIBLE_FORM_SECTIONS, ...parsedSections });
            } catch (e) {
              console.error('[AdminContext] Error parsing visibleFormSections:', e);
            }
          }

          if (settings.availableYears) {
            try {
              const years = typeof settings.availableYears === 'string'
                ? JSON.parse(settings.availableYears)
                : settings.availableYears;
              if (Array.isArray(years)) {
                setAvailableYears(years.map(Number).sort((a, b) => a - b));
              }
            } catch (e) {
              console.error('[AdminContext] Error parsing availableYears:', e);
            }
          }
        }
      } catch (error) {
        console.error('[AdminContext] Error fetching settings:', error);
      } finally {
        setIsLoadingSettings(false);
      }
    };

    if (status === 'authenticated') {
      fetchSettings();
    }
  }, [status]);

  // Save settings to API
  const saveSettings = async () => {
    try {
      const response = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          serviceName,
          logoUrl,
          primaryColor,
          headerSubtitle,
          showCommunalLogo,
          requiredFields: JSON.stringify(requiredFields),
          enableBirthdays,
          colleagueBirthdays: JSON.stringify(colleagueBirthdays),
          activeHolidayTheme,
          availableYears: JSON.stringify(availableYears),
          enabledModules: JSON.stringify(enabledModules),
          visibleColumns: JSON.stringify(visibleColumns),
          visibleFormSections: JSON.stringify(visibleFormSections)
        })
      });

      const responseText = await response.text();
      let errorData;

      try {
        errorData = responseText ? JSON.parse(responseText) : {};
      } catch (e) {
        console.error('Failed to parse response JSON:', responseText);
        throw new Error(`Erreur serveur (Réponse invalide): ${responseText.substring(0, 100)}...`);
      }

      if (!response.ok) {
        throw new Error(errorData.error || `Erreur ${response.status}: ${response.statusText}`);
      }

      console.log('[AdminContext] Settings saved successfully:', errorData);
      return errorData;
    } catch (error) {
      console.error('[AdminContext] Error saving settings:', error);
      throw error;
    }
  };

  useEffect(() => {
    if (status === "authenticated" && (session?.user as SessionUserWithRole)?.role === 'ADMIN') {
      setIsAdmin(true);
    } else if (status === "authenticated" && (session?.user as SessionUserWithRole)?.role !== 'ADMIN') {
      setIsAdmin(false);
    } else if (status === "unauthenticated") {
      setIsAdmin(false);
    }
  }, [session, status]);

  const toggleAdmin = () => {
    if (status === "authenticated" && (session?.user as SessionUserWithRole)?.role === 'ADMIN') {
      setIsAdmin(prevIsAdmin => {
        const newIsAdmin = !prevIsAdmin;
        return newIsAdmin;
      });
    } else {
      if (isAdmin) {
        setIsAdmin(false);
      }
    }
  };

  return (
    <AdminContext.Provider value={{
      isAdmin,
      toggleAdmin,
      selectedYear,
      setSelectedYear,
      availableYears,
      setAvailableYears,
      serviceName,
      setServiceName,
      logoUrl,
      setLogoUrl,
      primaryColor,
      setPrimaryColor,
      headerSubtitle,
      setHeaderSubtitle,
      showCommunalLogo,
      setShowCommunalLogo,
      requiredFields,
      setRequiredFields,
      enableBirthdays,
      setEnableBirthdays,
      colleagueBirthdays,
      setColleagueBirthdays,
      activeHolidayTheme,
      setActiveHolidayTheme,
      enabledModules,
      setEnabledModules,
      visibleColumns,
      setVisibleColumns,
      visibleFormSections,
      setVisibleFormSections,
      saveSettings,
      isLoadingSettings
    }}>
      {children}
    </AdminContext.Provider>
  );
};

export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (context === undefined) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
};
