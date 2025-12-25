/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect - Help Page Components
*/

import React from 'react';
import { BookOpenIcon, ArrowDownTrayIcon } from '@heroicons/react/24/outline';

export const HelpManualSection = ({ primaryBtn }: { primaryBtn: string }) => (
    <div className="mb-8 bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl shadow border border-blue-200">
        <div className="flex items-center text-blue-700 mb-4"><BookOpenIcon className="h-8 w-8 mr-3" /><h2 className="text-2xl font-bold">Manuel d'Utilisation Complet</h2></div>
        <p className="text-blue-600 mb-4 text-sm leading-relaxed">Guide exhaustif pour toutes les fonctionnalités.</p>
        <div className="bg-white p-4 rounded-lg border border-blue-200 mb-4 grid grid-cols-2 gap-2 text-sm text-slate-600">
            <div>• Connexion</div><div>• Dashboard</div><div>• Gestion usagers</div><div>• Rapports</div><div>• Administration</div><div>• FAQ</div>
        </div>
        <div className="flex gap-3">
            <a href="/documents_aide/MANUEL_UTILISATEUR.html" target="_blank" className={primaryBtn}><BookOpenIcon className="h-5 w-5 mr-2" />Consulter</a>
            <a href="/documents_aide/MANUEL_UTILISATEUR.html" download className={primaryBtn}><ArrowDownTrayIcon className="h-5 w-5 mr-2" />Télécharger</a>
        </div>
    </div>
);

export const ShortcutList = () => (
    <ul className="list-disc list-inside text-sm space-y-1 ml-4 mt-2">
        <li>Alt+A : Accueil</li><li>Alt+D : Dashboard</li><li>Alt+U : Usagers</li><li>Alt+N : Nouveau</li><li>Alt+H : Aide</li>
    </ul>
);
