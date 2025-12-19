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

interface AdminContextType {
  isAdmin: boolean;
  toggleAdmin: () => void;
  selectedYear: number;
  setSelectedYear: (year: number) => void;
  availableYears: number[];
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
  saveSettings: () => Promise<void>;
  isLoadingSettings: boolean;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export const AdminProvider = ({ children }: { children: ReactNode }) => {
  const { data: session, status } = useSession();
  const [isAdmin, setIsAdmin] = useState(false);
  const [selectedYear, setSelectedYear] = useState(2025);
  const availableYears = [2025, 2026];

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
          setRequiredFields(Array.isArray(settings.requiredFields) ? settings.requiredFields : []);
          setEnableBirthdays(settings.enableBirthdays || false);
          setColleagueBirthdays(Array.isArray(settings.colleagueBirthdays) ? settings.colleagueBirthdays : []);
          setActiveHolidayTheme(settings.activeHolidayTheme || "NONE");
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
          requiredFields,
          enableBirthdays,
          colleagueBirthdays,
          activeHolidayTheme
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
