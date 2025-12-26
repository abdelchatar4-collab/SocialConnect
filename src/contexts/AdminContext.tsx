/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect est un logiciel libre : vous pouvez le redistribuer et/ou le modifier selon les termes de la Licence Publique Générale GNU telle que publiée par la Free Software Foundation, soit la version 3 de la licence, soit (à votre convenance) toute version ultérieure.
*/

"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useSession } from 'next-auth/react';
import { AdminContextType } from './admin/adminTypes';
import { useAdminSettings } from './admin/useAdminSettings';

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export const AdminProvider = ({ children }: { children: ReactNode }) => {
  const { data: session, status } = useSession();
  const [isAdmin, setIsAdmin] = useState(false);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const serviceId = (session?.user as any)?.serviceId;
  const {
    sName, setSName, lUrl, setLUrl, pCol, setPCol, hSub, setHSub, sLog, setSLog, absEmail, setAbsEmail,
    spUrl, setSpUrl, spAdminUrl, setSpAdminUrl,
    rFld, setRFld, eBdy, setEBdy, cBdy, setCBdy, hThm, setHThm, mods, setMods,
    cols, setCols, secs, setSecs, years, setYears, loading, save,
    docRet, setDocRet, docAddr, setDocAddr, docCity, setDocCity, docPhone, setDocPhone, docFooter, setDocFooter,
    docRgpdTitle, setDocRgpdTitle, docRgpdSecs, setDocRgpdSecs, docUserSecs, setDocUserSecs, docAnt, setDocAnt
  } = useAdminSettings(status, serviceId);

  useEffect(() => {
    const role = (session?.user as any)?.role;
    setIsAdmin(status === "authenticated" && (role === 'ADMIN' || role === 'SUPER_ADMIN'));
  }, [session, status]);

  const toggleAdmin = () => {
    const role = (session?.user as any)?.role;
    if (status === "authenticated" && (role === 'ADMIN' || role === 'SUPER_ADMIN')) setIsAdmin(p => !p);
    else setIsAdmin(false);
  };

  return (
    <AdminContext.Provider value={{
      isAdmin, toggleAdmin, selectedYear, setSelectedYear, availableYears: years, setAvailableYears: setYears,
      serviceName: sName, setServiceName: setSName, logoUrl: lUrl, setLogoUrl: setLUrl,
      primaryColor: pCol, setPrimaryColor: setPCol, headerSubtitle: hSub, setHeaderSubtitle: setHSub,
      showCommunalLogo: sLog, setShowCommunalLogo: setSLog,
      absenceNotificationEmail: absEmail, setAbsenceNotificationEmail: setAbsEmail,
      sharepointUrl: spUrl, setSharepointUrl: setSpUrl,
      sharepointUrlAdmin: spAdminUrl, setSharepointUrlAdmin: setSpAdminUrl,
      requiredFields: rFld, setRequiredFields: setRFld,
      enableBirthdays: eBdy, setEnableBirthdays: setEBdy, colleagueBirthdays: cBdy, setColleagueBirthdays: setCBdy,
      activeHolidayTheme: hThm, setActiveHolidayTheme: setHThm, enabledModules: mods, setEnabledModules: setMods,
      visibleColumns: cols, setVisibleColumns: setCols, visibleFormSections: secs, setVisibleFormSections: setSecs,
      // Document Settings
      docRetentionPeriod: docRet, setDocRetentionPeriod: setDocRet,
      docServiceAddress: docAddr, setDocServiceAddress: setDocAddr,
      docServiceCity: docCity, setDocServiceCity: setDocCity,
      docServicePhone: docPhone, setDocServicePhone: setDocPhone,
      docFooterText: docFooter, setDocFooterText: setDocFooter,
      docRgpdTitle: docRgpdTitle, setDocRgpdTitle: setDocRgpdTitle,
      docRgpdSections: docRgpdSecs, setDocRgpdSections: setDocRgpdSecs,
      docUserProfileSections: docUserSecs, setDocUserProfileSections: setDocUserSecs,
      docAntenneAddresses: docAnt, setDocAntenneAddresses: setDocAnt,
      saveSettings: save, isLoadingSettings: loading
    }}>
      {children}
    </AdminContext.Provider>
  );
};

export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (!context) throw new Error('useAdmin must be used within an AdminProvider');
  return context;
};

export { DEFAULT_VISIBLE_COLUMNS, DEFAULT_VISIBLE_FORM_SECTIONS } from './admin/adminConstants';
