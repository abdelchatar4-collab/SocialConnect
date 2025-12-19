/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect est un logiciel libre : vous pouvez le redistribuer et/ou le modifier selon les termes de la Licence Publique Générale GNU telle que publiée par la Free Software Foundation, soit la version 3 de la licence, soit (à votre convenance) toute version ultérieure.

Ce programme est distribué dans l'espoir qu'il sera utile, mais SANS AUCUNE GARANTIE ; sans même la garantie implicite de COMMERCIALISATION ou d'ADÉQUATION À UN USAGE PARTICULIER. Voir la Licence Publique Générale GNU pour plus de détails.
*/

"use client";

import React from 'react';
import Navbar from "@/components/Navbar";
import { AdminProvider } from '@/contexts/AdminContext';

// Composant layout côté client qui utilise le contexte AdminProvider
export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <AdminProvider>
        <Navbar />
        <main className="container mx-auto px-4 py-6 sm:px-6 lg:px-8 flex-grow">
          {children}
        </main>

        <footer className="bg-white border-t border-gray-200 mt-auto">
          <div className="container mx-auto px-4 py-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row justify-between items-center text-sm text-gray-500">
              <div>
                &copy; 2025 <span className="font-semibold text-gray-700">ABDEL KADER CHATAR</span>. Tous droits réservés.
              </div>
              <div className="flex items-center gap-4 mt-2 md:mt-0">
                <span className="bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded-full font-medium">GNU GPL v3</span>
                <span>Version 1.0.0</span>
              </div>
            </div>
          </div>
        </footer>
      </AdminProvider>
    </div>
  );
}
