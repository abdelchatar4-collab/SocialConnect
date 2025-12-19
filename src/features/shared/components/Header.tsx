/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect est un logiciel libre : vous pouvez le redistribuer et/ou le modifier selon les termes de la Licence Publique Générale GNU telle que publiée par la Free Software Foundation, soit la version 3 de la licence, soit (à votre convenance) toute version ultérieure.

Ce programme est distribué dans l'espoir qu'il sera utile, mais SANS AUCUNE GARANTIE ; sans même la garantie implicite de COMMERCIALISATION ou d'ADÉQUATION À UN USAGE PARTICULIER. Voir la Licence Publique Générale GNU pour plus de détails.
*/

"use client";

import React, { useEffect, useState } from "react";
import { signIn, signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { useAdmin } from "@/contexts/AdminContext";
import Image from "next/image";
import {
  ArrowRightOnRectangleIcon,
  UserCircleIcon,
  ShieldCheckIcon,
  AdjustmentsHorizontalIcon,
  HomeIcon, // Importation de l'icône Home
  Squares2X2Icon, // Importation de l'icône Dashboard
  UsersIcon, // Importation de l'icône Users
} from "@heroicons/react/24/outline";

interface SessionUserWithRole {
  id?: string | null;
  name?: string | null;
  email?: string | null;
  role?: string | null;
}

export default function Header() {
  const { data: session, status } = useSession();
  const { isAdmin, toggleAdmin } = useAdmin();
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [cfUserEmail, setCfUserEmail] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const IS_DEVELOPMENT = process.env.NODE_ENV === 'development';
    // Ligne 34, remplacez la fonction attemptAutoSignIn par :
    const attemptAutoSignIn = async () => {
      // CORRECTION : Désactiver l'auto-connexion Cloudflare
      return;
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
  }, [status, session, isSigningIn, cfUserEmail]);

  const handleSignOut = async () => {
    await signOut({ redirect: true, callbackUrl: '/' });
  };

  const userRole = (session?.user as SessionUserWithRole)?.role;
  const displayName = session?.user?.name || session?.user?.email || cfUserEmail || "Utilisateur";

  // Classes pour les liens de navigation principaux
  const navLinkClasses = "flex items-center px-3 py-2 rounded-md text-sm font-medium text-slate-700 hover:bg-slate-200 hover:text-primary transition-colors duration-150 ease-in-out";
  // Classes pour les actions utilisateur dans le header
  const headerActionItemClasses = "flex items-center gap-x-1 px-3 py-2 rounded-md text-sm font-medium text-slate-700 transition-colors duration-150 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1";

  return (
    // Header principal unifié avec fond blanc, padding vertical augmenté et ombre
    <header className="bg-white text-slate-800 px-4 md:px-6 py-4 flex flex-col md:flex-row justify-between items-center border-b border-slate-200 shadow-md">
      {/* Section Logo et Titres */}
      <div className="flex items-center mb-4 md:mb-0">
        <Link href="/" passHref>
          {/* Logo plus grand */}
          <Image src="/logo-accueil-social.png" alt="Logo Accueil Social" width={60} height={60} />
        </Link>
        <div className="ml-3">
          {/* Titre principal plus grand et en couleur primaire */}
          <h1 className="text-2xl lg:text-3xl font-bold tracking-tight text-primary">Gestion des Usagers</h1>
          {/* Sous-titres intégrés, plus petits et en gris moyen */}
          <p className="text-sm text-slate-600 mt-1">Pôle Accueil Social des Quartiers</p>
          <p className="text-sm text-slate-600">Année 2025</p>
        </div>
      </div>

      {/* Navigation principale et Actions utilisateur */}
      <div className="flex flex-col md:flex-row items-center space-y-2 md:space-y-0 md:space-x-4 w-full md:w-auto">
        {status === "authenticated" && session?.user ? (
          <>
            {/* Navigation pour utilisateur authentifié */}
            <nav className="w-full md:w-auto">
              <ul className="flex flex-col md:flex-row items-center space-y-2 md:space-y-0 md:space-x-4">
                <li>
                  <Link href="/" className={navLinkClasses}>
                    <HomeIcon className="h-5 w-5 mr-1" /> Accueil
                  </Link>
                </li>
                <li>
                  <Link href="/dashboard" className={navLinkClasses}>
                    <Squares2X2Icon className="h-5 w-5 mr-1" /> Dashboard
                  </Link>
                </li>
                <li>
                  <Link href="/users" className={navLinkClasses}>
                    <UsersIcon className="h-5 w-5 mr-1" /> Liste des Usagers
                  </Link>
                </li>
                {userRole === "ADMIN" && (
                  <li>
                    <Link href="/admin" className={navLinkClasses}>
                      <ShieldCheckIcon className="h-5 w-5 mr-1 text-primary" /> Administration
                    </Link>
                  </li>
                )}
              </ul>
            </nav>

            {/* Actions utilisateur authentifié */}
            <div className="flex items-center space-x-4 mt-2 md:mt-0 md:ml-auto"> {/* md:ml-auto pousse les actions à droite */}
              <div className="flex items-center text-sm text-slate-600">
                <UserCircleIcon className="h-5 w-5 mr-1 text-slate-500"/>
                <span>{displayName}</span>
              </div>
              <button
                onClick={handleSignOut}
                className={`group ${headerActionItemClasses} hover:bg-red-50 hover:text-red-700 focus-visible:ring-red-500`}
              >
                <ArrowRightOnRectangleIcon className="h-5 w-5 mr-1 text-red-500 group-hover:text-red-600" />
                Déconnexion
              </button>
              {userRole === "ADMIN" && (
                <button
                  onClick={toggleAdmin}
                  className={`group ${headerActionItemClasses} ${
                    isAdmin
                      ? 'hover:bg-amber-50 hover:text-amber-700 focus-visible:ring-amber-500'
                      : 'hover:bg-sky-50 hover:text-sky-700 focus-visible:ring-sky-500'
                  }`}
                >
                  <AdjustmentsHorizontalIcon className={`h-5 w-5 mr-1 ${
                    isAdmin
                      ? 'text-amber-500 group-hover:text-amber-600'
                      : 'text-sky-500 group-hover:text-sky-600'
                  }`} />
                  {isAdmin ? "Mode Normal" : "Mode Admin"}
                </button>
              )}
            </div>
          </>
        ) : status === "loading" ? (
          <span className="text-sm text-slate-400">Chargement...</span>
        ) : isSigningIn ? (
           <span className="text-sm text-sky-500">Connexion...</span>
        ) : error ? (
          <span className="text-sm text-red-500 bg-red-100 px-3 py-1 rounded-md">Erreur: {error}</span>
        ) : (
          // Navigation et action pour utilisateur non authentifié
          <div className="flex items-center space-x-4 w-full md:w-auto md:ml-auto"> {/* md:ml-auto pousse les actions à droite */}
             <nav>
                <Link href="/" className={navLinkClasses}>
                   <HomeIcon className="h-5 w-5 mr-1" /> Accueil
                </Link>
             </nav>
             <Link href="/api/auth/signin" className="text-sky-600 hover:text-sky-500 text-sm font-medium">
               Se connecter
             </Link>
          </div>
        )}
      </div>
    </header>
  );
}
