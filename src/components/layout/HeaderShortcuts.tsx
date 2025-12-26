/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect - Header Shortcuts Component
*/

import React from 'react';
import Link from 'next/link';
import { CloudIcon, CalendarDaysIcon, InformationCircleIcon } from "@heroicons/react/24/outline";

interface HeaderShortcutsProps {
    status: string;
    sharepointUrl?: string | null;
    sharepointUrlAdmin?: string | null;
    userEmail?: string | null;
    onOpenAbout: () => void;
}

export const HeaderShortcuts: React.FC<HeaderShortcutsProps> = ({
    status,
    sharepointUrl,
    sharepointUrlAdmin,
    userEmail,
    onOpenAbout
}) => {
    const isOwner = userEmail && ['abdelchatar4@gmail.com', 'achatar@anderlecht.brussels'].includes(userEmail);
    const targetUrl = isOwner && sharepointUrlAdmin ? sharepointUrlAdmin : sharepointUrl;

    return (
        <div className="flex items-center gap-2">
            {/* SharePoint Shortcut */}
            {targetUrl && (
                <a
                    href={targetUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 text-slate-400 hover:text-blue-500 transition-colors rounded-full hover:bg-slate-100 flex items-center mr-2"
                    title={isOwner && sharepointUrlAdmin ? "SharePoint (Admin)" : "SharePoint (Équipe)"}
                >
                    <CloudIcon className="w-5 h-5" />
                </a>
            )}

            {/* Mes Absences Button */}
            {status === "authenticated" && (
                <>
                    {/* Partenaires Directory Button */}
                    <Link
                        href="/partenaires"
                        className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium text-purple-700 bg-purple-100 hover:bg-purple-200 shadow-sm transition-all duration-200 hover:shadow-md mr-2"
                        title="Annuaire des Partenaires"
                    >
                        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                            <circle cx="9" cy="7" r="4" />
                            <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                        </svg>
                        <span className="hidden sm:inline">Partenaires</span>
                    </Link>

                    {/* Absences Button */}
                    <Link
                        href="/conges"
                        className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium text-blue-700 bg-blue-100 hover:bg-blue-200 shadow-sm transition-all duration-200 mr-2"
                        title="Mes Absences"
                    >
                        <CalendarDaysIcon className="w-5 h-5" />
                        <span className="hidden sm:inline">Absences</span>
                    </Link>
                </>
            )}

            <button
                onClick={onOpenAbout}
                className="p-2 text-slate-500 hover:text-blue-600 transition-colors rounded-full hover:bg-blue-50"
                title="À propos"
            >
                <InformationCircleIcon className="w-6 h-6" />
            </button>
        </div>
    );
};
