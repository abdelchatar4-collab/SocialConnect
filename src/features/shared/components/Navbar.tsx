/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect est un logiciel libre : vous pouvez le redistribuer et/ou le modifier selon les termes de la Licence Publique Générale GNU telle que publiée par la Free Software Foundation, soit la version 3 de la licence, soit (à votre convenance) toute version ultérieure.

Ce programme est distribué dans l'espoir qu'il sera utile, mais SANS AUCUNE GARANTIE ; sans même la garantie implicite de COMMERCIALISATION ou d'ADÉQUATION À UN USAGE PARTICULIER. Voir la Licence Publique Générale GNU pour plus de détails.
*/

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAdmin } from "@/contexts/AdminContext";

export default function Navbar() {
  const pathname = usePathname();
  const { isAdmin, toggleAdmin } = useAdmin();

  return (
    <nav className="bg-blue-600 text-white p-4 shadow-md">
      <div className="container mx-auto flex justify-between items-center">
        <div className="navbar-brand text-xl font-bold">Gestion des Usagers</div>

        <div className="navbar-menu flex items-center gap-4">
          <Link
            href="/"
            className={`navbar-item px-3 py-2 rounded hover:bg-blue-500 transition-colors ${pathname === '/' ? 'active bg-blue-700 font-bold' : ''}`}
          >
            Tableau de bord
          </Link>
          <Link
            href="/users"
            className={`navbar-item px-3 py-2 rounded hover:bg-blue-500 transition-colors ${pathname === '/users' ? 'active bg-blue-700 font-bold' : ''}`}
          >
            Liste des usagers
          </Link>
          <Link
            href="/rapports"
            className={`navbar-item px-3 py-2 rounded hover:bg-blue-500 transition-colors ${pathname === '/rapports' ? 'active bg-blue-700 font-bold' : ''}`}
          >
            Documents
          </Link>
          <button
            onClick={toggleAdmin}
            className={`ml-4 px-3 py-1 rounded font-medium transition-colors ${
              isAdmin
                ? "bg-green-500 hover:bg-green-600 text-white"
                : "bg-gray-500 hover:bg-gray-600 text-white"
            }`}
          >
            {isAdmin ? "Mode Admin" : "Mode Standard"}
          </button>
        </div>
      </div>
    </nav>
  );
}
