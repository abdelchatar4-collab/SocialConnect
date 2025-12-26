/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect - Internal Admin Settings Hook
*/

import { useState, useEffect, useCallback } from 'react';
import { INITIAL_SETTINGS, DEFAULT_VISIBLE_COLUMNS, DEFAULT_VISIBLE_FORM_SECTIONS, DEFAULT_DOC_SETTINGS } from './adminConstants';

export function useAdminSettings(status: string, serviceId?: string) {
    const [sName, setSName] = useState(INITIAL_SETTINGS.serviceName);
    const [lUrl, setLUrl] = useState(INITIAL_SETTINGS.logoUrl);
    const [pCol, setPCol] = useState(INITIAL_SETTINGS.primaryColor);
    const [hSub, setHSub] = useState(INITIAL_SETTINGS.headerSubtitle);
    const [sLog, setSLog] = useState(INITIAL_SETTINGS.showCommunalLogo);
    const [absEmail, setAbsEmail] = useState<string | null>(null);
    const [spUrl, setSpUrl] = useState<string | null>(null);
    const [spAdminUrl, setSpAdminUrl] = useState<string | null>(null);
    const [rFld, setRFld] = useState<string[]>([]);
    const [eBdy, setEBdy] = useState(false);
    const [cBdy, setCBdy] = useState<{ name: string; date: string }[]>([]);
    const [hThm, setHThm] = useState(INITIAL_SETTINGS.activeHolidayTheme);
    const [mods, setMods] = useState<Record<string, boolean>>({});
    const [cols, setCols] = useState(DEFAULT_VISIBLE_COLUMNS);
    const [secs, setSecs] = useState(DEFAULT_VISIBLE_FORM_SECTIONS);
    const [years, setYears] = useState<number[]>([new Date().getFullYear()]);
    const [loading, setLoading] = useState(true);

    // Document Settings
    const [docRet, setDocRet] = useState(DEFAULT_DOC_SETTINGS.retentionPeriod);
    const [docAddr, setDocAddr] = useState(DEFAULT_DOC_SETTINGS.serviceAddress);
    const [docCity, setDocCity] = useState(DEFAULT_DOC_SETTINGS.serviceCity);
    const [docPhone, setDocPhone] = useState(DEFAULT_DOC_SETTINGS.servicePhone);
    const [docFooter, setDocFooter] = useState(DEFAULT_DOC_SETTINGS.footerText);
    const [docRgpdTitle, setDocRgpdTitle] = useState(DEFAULT_DOC_SETTINGS.rgpdTitle);
    const [docRgpdSecs, setDocRgpdSecs] = useState(DEFAULT_DOC_SETTINGS.rgpdSections);
    const [docUserSecs, setDocUserSecs] = useState(DEFAULT_DOC_SETTINGS.userProfileSections);
    const [docAnt, setDocAnt] = useState(DEFAULT_DOC_SETTINGS.antenneAddresses);

    const fetchS = useCallback(async () => {
        try {
            const res = await fetch('/api/settings');
            if (res.ok) {
                const d = await res.json();
                setSName(d.serviceName || INITIAL_SETTINGS.serviceName);
                setLUrl(d.logoUrl || INITIAL_SETTINGS.logoUrl);
                setPCol(d.primaryColor || INITIAL_SETTINGS.primaryColor);
                setHSub(d.headerSubtitle || INITIAL_SETTINGS.headerSubtitle);
                setSLog(d.showCommunalLogo ?? true);
                setAbsEmail(d.absenceNotificationEmail || '');
                setSpUrl(d.sharepointUrl || '');
                setSpAdminUrl(d.sharepointUrlAdmin || '');
                setHThm(d.activeHolidayTheme || "NONE");
                setEBdy(!!d.enableBirthdays);

                const parse = (v: any) => { try { return typeof v === 'string' ? JSON.parse(v) : v; } catch { return null; } };
                setRFld(parse(d.requiredFields) || []);
                setCBdy(parse(d.colleagueBirthdays) || []);
                setMods(parse(d.enabledModules) || {});
                setCols({ ...DEFAULT_VISIBLE_COLUMNS, ...(parse(d.visibleColumns) || {}) });
                setSecs({ ...DEFAULT_VISIBLE_FORM_SECTIONS, ...(parse(d.visibleFormSections) || {}) });
                if (d.availableYears) {
                    const y = parse(d.availableYears);
                    if (Array.isArray(y)) setYears(y.map(Number).sort((a, b) => a - b));
                }

                // Document Settings
                setDocRet(d.docRetentionPeriod || DEFAULT_DOC_SETTINGS.retentionPeriod);
                setDocAddr(d.docServiceAddress || DEFAULT_DOC_SETTINGS.serviceAddress);
                setDocCity(d.docServiceCity || DEFAULT_DOC_SETTINGS.serviceCity);
                setDocPhone(d.docServicePhone || DEFAULT_DOC_SETTINGS.servicePhone);
                setDocFooter(d.docFooterText || DEFAULT_DOC_SETTINGS.footerText);
                setDocRgpdTitle(d.docRgpdTitle || DEFAULT_DOC_SETTINGS.rgpdTitle);
                const parsedRgpdSecs = parse(d.docRgpdSections);
                if (parsedRgpdSecs) setDocRgpdSecs({ ...DEFAULT_DOC_SETTINGS.rgpdSections, ...parsedRgpdSecs });
                const parsedUserSecs = parse(d.docUserProfileSections);
                if (parsedUserSecs) setDocUserSecs({ ...DEFAULT_DOC_SETTINGS.userProfileSections, ...parsedUserSecs });
                const parsedAnt = parse(d.docAntenneAddresses);
                if (parsedAnt) setDocAnt({ ...DEFAULT_DOC_SETTINGS.antenneAddresses, ...parsedAnt });
            }
        } catch { } finally { setLoading(false); }
    }, []);

    useEffect(() => { if (status === 'authenticated') fetchS(); }, [status, fetchS, serviceId]);

    const save = async (overrides?: any) => {
        const body = {
            serviceName: overrides?.serviceName ?? sName,
            logoUrl: overrides?.logoUrl ?? lUrl,
            primaryColor: overrides?.primaryColor ?? pCol,
            headerSubtitle: overrides?.headerSubtitle ?? hSub,
            showCommunalLogo: overrides?.showCommunalLogo ?? sLog,
            absenceNotificationEmail: overrides?.absenceNotificationEmail ?? absEmail,
            sharepointUrl: overrides?.sharepointUrl ?? spUrl,
            sharepointUrlAdmin: overrides?.sharepointUrlAdmin ?? spAdminUrl,
            requiredFields: JSON.stringify(overrides?.requiredFields ?? rFld),
            enableBirthdays: overrides?.enableBirthdays ?? eBdy,
            colleagueBirthdays: JSON.stringify(overrides?.colleagueBirthdays ?? cBdy),
            activeHolidayTheme: overrides?.activeHolidayTheme ?? hThm,
            availableYears: JSON.stringify(overrides?.availableYears ?? years),
            enabledModules: JSON.stringify(overrides?.enabledModules ?? mods),
            visibleColumns: JSON.stringify(overrides?.visibleColumns ?? cols),
            visibleFormSections: JSON.stringify(overrides?.visibleFormSections ?? secs),
            // Document Settings
            docRetentionPeriod: overrides?.docRetentionPeriod ?? docRet,
            docServiceAddress: overrides?.docServiceAddress ?? docAddr,
            docServiceCity: overrides?.docServiceCity ?? docCity,
            docServicePhone: overrides?.docServicePhone ?? docPhone,
            docFooterText: overrides?.docFooterText ?? docFooter,
            docRgpdTitle: overrides?.docRgpdTitle ?? docRgpdTitle,
            docRgpdSections: JSON.stringify(overrides?.docRgpdSections ?? docRgpdSecs),
            docUserProfileSections: JSON.stringify(overrides?.docUserProfileSections ?? docUserSecs),
            docAntenneAddresses: JSON.stringify(overrides?.docAntenneAddresses ?? docAnt)
        };
        const res = await fetch('/api/settings', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
        if (!res.ok) throw new Error('Save failed');
        return res.json();
    };

    return {
        sName, setSName, lUrl, setLUrl, pCol, setPCol, hSub, setHSub, sLog, setSLog, absEmail, setAbsEmail,
        spUrl, setSpUrl,
        spAdminUrl, setSpAdminUrl,
        rFld, setRFld, eBdy, setEBdy,
        cBdy, setCBdy, hThm, setHThm, mods, setMods, cols, setCols, secs, setSecs, years, setYears, loading, save,
        docRet, setDocRet, docAddr, setDocAddr, docCity, setDocCity, docPhone, setDocPhone, docFooter, setDocFooter,
        docRgpdTitle, setDocRgpdTitle, docRgpdSecs, setDocRgpdSecs, docUserSecs, setDocUserSecs, docAnt, setDocAnt
    };
}

