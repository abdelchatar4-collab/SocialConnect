/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect - Header Branding Component
*/

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { YearSelector } from "@/components/YearSelector";

interface HeaderBrandingProps {
    primaryColor: string;
    serviceName?: string;
    headerSubtitle?: string;
    showCommunalLogo: boolean;
}

export const HeaderBranding: React.FC<HeaderBrandingProps> = ({
    primaryColor,
    serviceName,
    headerSubtitle,
    showCommunalLogo
}) => {
    return (
        <div className="flex items-center gap-6">
            {/* SocialConnect Branding */}
            <div className="flex items-center gap-2 shrink-0">
                <Link href="/">
                    <img
                        src="/socialconnect-trimmed.png"
                        alt="SocialConnect Logo"
                        className="object-contain h-12 w-auto hover:opacity-90 transition-opacity"
                    />
                </Link>
            </div>

            {/* Separator */}
            <div className="h-12 w-px bg-slate-200 hidden md:block"></div>

            {/* Service Title */}
            <div className="flex flex-col justify-center hidden md:flex">
                <h1 className="text-xl font-bold uppercase leading-tight tracking-tight antialiased" style={{ color: primaryColor }}>
                    {serviceName || "LE PÔLE ACCUEIL SOCIAL DES QUARTIERS"}
                </h1>
                <span className="text-sm font-semibold uppercase tracking-widest antialiased" style={{ color: '#475569' }}>
                    {headerSubtitle}
                </span>
            </div>

            {/* Communal Logo */}
            {showCommunalLogo && (
                <div className="hidden lg:block ml-4 opacity-80 bg-blend-multiply">
                    <Image
                        src="/logo-accueil-social.png"
                        alt="Logo Accueil Social"
                        width={100}
                        height={40}
                        className="object-contain h-8 w-auto"
                    />
                </div>
            )}

            {/* Year Selector */}
            <div className="hidden xl:block ml-4">
                <YearSelector />
            </div>
        </div>
    );
};
