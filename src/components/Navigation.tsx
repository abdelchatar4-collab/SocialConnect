/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect est un logiciel libre : vous pouvez le redistribuer et/ou le modifier selon les termes de la Licence Publique Générale GNU telle que publiée par la Free Software Foundation, soit la version 3 de la licence, soit (à votre convenance) toute version ultérieure.

Ce programme est distribué dans l'espoir qu'il sera utile, mais SANS AUCUNE GARANTIE ; sans même la garantie implicite de COMMERCIALISATION ou d'ADÉQUATION À UN USAGE PARTICULIER. Voir la Licence Publique Générale GNU pour plus de détails.
*/

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const Navigation = () => {
  const pathname = usePathname();

  return (
    <div className="bg-white border-b border-gray-200 px-4 md:px-6 py-3 shadow-sm">
      <div className="max-w-7xl mx-auto">
        <div className="flex overflow-x-auto space-x-4 py-1">
          <Link
            href="/"
            className={`button-link px-4 py-2 rounded-md ${
              pathname === '/'
                ? 'bg-green-600 text-white'
                : 'text-gray-600 hover:bg-gray-100'
            } transition-colors shadow-sm`}
          >
            Accueil
          </Link>
          <Link
            href="/dashboard"
            className={`button-link px-4 py-2 rounded-md ${
              pathname === '/dashboard'
                ? 'bg-purple-600 text-white'
                : 'text-gray-600 hover:bg-gray-100'
            } transition-colors shadow-sm`}
          >
            Dashboard
          </Link>
          <Link
            href="/users"
            className={`button-link px-4 py-2 rounded-md ${
              pathname === '/users'
                ? 'bg-blue-600 text-white'
                : 'text-gray-600 hover:bg-gray-100'
            } transition-colors shadow-sm`}
          >
            Liste des Usagers
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Navigation;
