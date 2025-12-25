/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect est un logiciel libre : vous pouvez le redistribuer et/ou le modifier selon les termes de la Licence Publique Générale GNU telle que publiée par la Free Software Foundation, soit la version 3 de la licence, soit (à votre convenance) toute version ultérieure.

Ce programme est distribué dans l'espoir qu'il sera utile, mais SANS AUCUNE GARANTIE ; sans même la garantie implicite de COMMERCIALISATION ou d'ADÉQUATION À UN USAGE PARTICULIER. Voir la Licence Publique Générale GNU pour plus de détails.
*/

"use client";

import React, { useState, useEffect } from 'react';
import { InformationCircleIcon } from '@heroicons/react/24/outline';
import SettingsModal from '@/components/SettingsModal';
import { useSession } from "next-auth/react";
import { useAdmin } from '@/contexts/AdminContext';
import { FeatureCards } from '@/features/home/components/FeatureCards';
import { UserManual } from '@/features/home/components/UserManual';
import { QuickHelp } from '@/features/home/components/QuickHelp';

interface SessionUserWithRole {
  id?: string | null;
  name?: string | null;
  email?: string | null;
  role?: string | null;
}

export default function HomePage() {
  const [usersCount, setUsersCount] = useState(0);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const { data: session, status } = useSession();
  const userRole = (session?.user as SessionUserWithRole)?.role;
  const { selectedYear } = useAdmin();

  useEffect(() => {
    const fetchUsersCount = async () => {
      try {
        const response = await fetch(`/api/users/count?annee=${selectedYear}`);
        if (response.ok) {
          const data = await response.json();
          setUsersCount(data.count || 0);
        }
      } catch (error) {
        console.error("Erreur lors du chargement du nombre d'usagers:", error);
      }
    };

    fetchUsersCount();
  }, [selectedYear]);

  const handleOpenSettings = () => {
    if (status === "authenticated" && (userRole === "ADMIN" || userRole === "SUPER_ADMIN")) {
      setIsSettingsOpen(true);
    } else if (status === "authenticated" && userRole !== "ADMIN") {
      alert("Accès refusé. Vous devez avoir les droits administrateur pour accéder aux paramètres.");
    } else {
      alert("Veuillez vous connecter en tant qu'administrateur pour accéder aux paramètres.");
    }
  };

  return (
    <div className="min-h-screen text-slate-800">
      <div className="container mx-auto p-6 animate-fade-in">
        {/* Titre de page "Accueil" */}
        <div className="mb-8">
          <h2 className="text-4xl font-bold text-slate-800">Accueil</h2>
        </div>

        {/* Section "Tableau de bord" */}
        <div className="mb-8">
          <h3 className="text-2xl font-semibold text-slate-800 mb-4">Tableau de bord</h3>
          <p className="mt-2 text-slate-600">
            Bienvenue sur l'application de gestion des usagers. Utilisez les liens ci-dessous pour accéder aux différentes fonctionnalités.
          </p>
        </div>

        {/* Cartes de fonctionnalités */}
        <FeatureCards
          usersCount={usersCount}
          onOpenSettings={handleOpenSettings}
        />

        {/* Carte À propos */}
        <div className="card-glass p-6">
          <div className="flex items-center text-primary-600 mb-3">
            <InformationCircleIcon className="h-7 w-7 mr-2" />
            <h3 className="text-xl font-semibold">À propos de l'application</h3>
          </div>
          <p className="text-slate-600 text-sm">
            Cette application de gestion des usagers permet de suivre les dossiers des personnes accompagnées, de gérer leurs informations et de suivre leur parcours.
          </p>
        </div>

        {/* Manuel d'Utilisation */}
        <UserManual />

        {/* Section d'aide rapide */}
        <QuickHelp />
      </div>

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
    </div>
  );
}
