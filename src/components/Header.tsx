/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect est un logiciel libre : vous pouvez le redistribuer et/ou le modifier selon les termes de la Licence Publique Générale GNU telle que publiée par la Free Software Foundation, soit la version 3 de la licence, soit (à votre convenance) toute version ultérieure.

Ce programme est distribué dans l'espoir qu'il sera utile, mais SANS AUCUNE GARANTIE ; sans même la garantie implicite de COMMERCIALISATION ou d'ADÉQUATION À UN USAGE PARTICULIER. Voir la Licence Publique Générale GNU pour plus de détails.
*/

"use client";

import React, { useEffect, useState } from "react";
import { signIn, signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAdmin } from "@/contexts/AdminContext";
import Image from "next/image";
import SettingsModal from "@/components/SettingsModal";
import { YearSelector } from "@/components/YearSelector";
import { BirthdayBanner } from "@/components/BirthdayBanner";
import { UserMenu } from "@/components/UserMenu";
import { Button } from "@/components/ui";
import { cn } from "@/lib/utils";
import { InformationCircleIcon } from "@heroicons/react/24/outline";
import AboutModal from "@/components/AboutModal";
import ServiceSwitcher from "@/components/layout/ServiceSwitcher";
import { ClockIcon } from "@heroicons/react/24/outline";
import { PrestationReminder } from "@/features/prestations/components/PrestationReminder";
import { usePrestations } from "@/contexts/PrestationContext";

interface SessionUserWithRole {
  id?: string | null;
  name?: string | null;
  email?: string | null;
  role?: string | null;
}

export default function Header() {
  const { data: session, status } = useSession();
  const { isAdmin, toggleAdmin, serviceName, logoUrl, headerSubtitle, showCommunalLogo, primaryColor } = useAdmin();
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [cfUserEmail, setCfUserEmail] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isAboutOpen, setIsAboutOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const IS_DEVELOPMENT = process.env.NODE_ENV === 'development';

    const attemptAutoSignIn = async () => {
      // Désactiver l'auto-connexion Cloudflare en mode développement
      return;

      if (IS_DEVELOPMENT) {
        return;
      }
      let cfUserData = null;
      try {
        const response = await fetch('/api/get-cf-user');
        if (!response.ok) {
          const errorText = await response.text();
          setError(`Erreur Cloudflare: ${response.status} ${errorText || response.statusText}`);
          setIsSigningIn(false);
          return;
        }
        cfUserData = await response.json();
        if (cfUserData && cfUserData.email) {
          setCfUserEmail(cfUserData.email);
        } else {
          setIsSigningIn(false);
          return;
        }
      } catch (e) {
        setError("Exception lors de la récupération de l'utilisateur Cloudflare.");
        setIsSigningIn(false);
        return;
      }
      if (status === 'unauthenticated' && !isSigningIn && cfUserData && cfUserData.email) {
        setIsSigningIn(true);
        setError(null);
        try {
          const signInResult = await signIn("cloudflareverifieduser", {
            email: cfUserData.email,
            redirect: false,
          });

          if (signInResult?.error) {
            setError(signInResult?.error ?? "Erreur inconnue");
          } else if (signInResult && !signInResult?.ok) {
            setError("Tentative de connexion retournée sans succès ni erreur explicite.");
          } else if (!signInResult) {
            setError("Aucune réponse de la tentative de connexion.");
          } else if (signInResult?.error) {
            setError(signInResult?.error ?? "Erreur inconnue");
          } else if (!signInResult?.ok) {
            setError("Tentative de connexion retournée sans succès ni erreur explicite.");
          }
        } catch (e: any) {
          setError(e.message || "Une exception s'est produite lors de la connexion.");
        } finally {
          setIsSigningIn(false);
        }
      }
    };

    if (status === "unauthenticated") {
      if (process.env.NODE_ENV !== 'development') {
        attemptAutoSignIn();
      }
    } else if (status === "authenticated") {
      if (!cfUserEmail && session?.user?.email && process.env.NODE_ENV !== 'development') {
        setCfUserEmail(session.user.email);
      }
    }
  }, [status, session, isSigningIn]);

  const handleSignOut = async () => {
    await signOut({ redirect: true, callbackUrl: '/' });
  };

  const userRole = (session?.user as SessionUserWithRole)?.role;
  const displayName = session?.user?.name || session?.user?.email || cfUserEmail || "Utilisateur";

  const handleOpenSettings = () => {
    setIsSettingsOpen(true);
  };

  // Helper pour les liens de navigation
  const NavLink = ({ href, children, icon: Icon }: { href: string; children: React.ReactNode; icon?: React.ElementType }) => {
    const isActive = pathname === href;

    // Style dynamique pour l'élément actif
    const activeStyle = isActive ? {
      color: primaryColor,
      backgroundColor: `${primaryColor}10`, // 10% d'opacité
    } : {};

    return (
      <Link
        href={href}
        className={cn(
          "flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 relative",
          isActive
            ? "shadow-sm" // On enlève les classes de couleur fixes
            : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
        )}
        style={activeStyle}
      >
        {Icon && <Icon className="w-5 h-5" />}
        <span>{children}</span>
        {/* Active indicator bar */}
        {isActive && (
          <div
            className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full"
            style={{ backgroundColor: primaryColor }}
          />
        )}
      </Link>
    );
  };

  return (
    <>
      {/* Birthday Banner */}
      <BirthdayBanner />

      {/* Prestation Reminder - Shows when user hasn't logged prestations for 3+ days */}
      <PrestationReminder onOpenPrestations={() => {
        // Import and use the prestation context to open the form
        const event = new CustomEvent('openPrestationForm');
        window.dispatchEvent(event);
      }} />

      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-200/50 shadow-sm flex flex-col font-sans">
        {/* MAIN HEADER ROW */}
        <div className="px-4 md:px-8 py-6 flex items-center justify-between gap-4">

          {/* LEFT SECTION: Logo SC | Title | Communal Logo | Year */}
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
                  alt="Logo Commune d'Anderlecht"
                  width={100}
                  height={40}
                  className="object-contain h-8 w-auto"
                />
              </div>
            )}

            {/* Service Switcher (Super Admin) */}
            <div className="block ml-4">
              <ServiceSwitcher />
            </div>

            {/* Year Selector */}
            <div className="hidden xl:block ml-4">
              <YearSelector />
            </div>
          </div>

          {/* RIGHT: User Menu */}
          <div className="flex items-center gap-2">

            <button
              onClick={() => setIsAboutOpen(true)}
              className="p-2 text-slate-500 hover:text-blue-600 transition-colors rounded-full hover:bg-blue-50"
              title="À propos"
            >
              <InformationCircleIcon className="w-6 h-6" />
            </button>

            {status === "authenticated" ? (
              <UserMenu
                user={session?.user || {}}
                onOpenSettings={handleOpenSettings}
              />
            ) : (
              <Button
                onClick={() => signIn()}
                className="bg-blue-600 text-white hover:bg-blue-700"
              >
                Se connecter
              </Button>
            )}
          </div>
        </div>

        <SettingsModal
          isOpen={isSettingsOpen}
          onClose={() => setIsSettingsOpen(false)}
        />
        <AboutModal
          isOpen={isAboutOpen}
          onClose={() => setIsAboutOpen(false)}
        />
      </header>
    </>
  );
}
