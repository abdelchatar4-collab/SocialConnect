/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect est un logiciel libre : vous pouvez le redistribuer et/ou le modifier selon les termes de la Licence Publique Générale GNU telle que publiée par la Free Software Foundation, soit la version 3 de la licence, soit (à votre convenance) toute version ultérieure.

Ce programme est distribué dans l'espoir qu'il sera utile, mais SANS AUCUNE GARANTIE ; sans même la garantie implicite de COMMERCIALISATION ou d'ADÉQUATION À UN USAGE PARTICULIER. Voir la Licence Publique Générale GNU pour plus de détails.
*/

"use client";

import { SessionProvider } from "next-auth/react";
import { AdminProvider } from "@/contexts/AdminContext"; // Assuming path, verify if different
import Header from "@/components/Header"; // Assuming path, verify if different
import React from "react";

interface ProvidersProps {
  children: React.ReactNode;
}

import { HolidayOverlay } from "@/components/HolidayOverlay";
import { FloatingHomeButton } from "@/components/ui/FloatingHomeButton";

export default function Providers({ children }: ProvidersProps) {
  return (
    <SessionProvider>
      <AdminProvider>
        <HolidayOverlay />
        <div className="min-h-screen flex flex-col">
          <Header />
          <main className="flex-grow">{children}</main>

          <footer className="bg-white border-t border-gray-200 mt-auto py-4">
            <div className="container mx-auto px-4 md:px-8">
              <div className="flex flex-col md:flex-row justify-between items-center text-sm text-gray-500">
                <div className="mb-2 md:mb-0">
                  &copy; 2025 <span className="font-semibold text-gray-700">AC</span>. Tous droits réservés.
                </div>
                <div className="flex items-center gap-3">
                  <span className="bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded-full font-medium">GNU GPL v3</span>
                  <span>Version 1.0.0</span>
                </div>
              </div>
            </div>
          </footer>
        </div>
        <FloatingHomeButton />
      </AdminProvider>
    </SessionProvider>
  );
}
