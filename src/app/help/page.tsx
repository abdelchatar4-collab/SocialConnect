/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect est un logiciel libre : vous pouvez le redistribuer et/ou le modifier selon les termes de la Licence Publique Générale GNU telle que publiée par la Free Software Foundation, soit la version 3 de la licence, soit (à votre convenance) toute version ultérieure.
*/

"use client";

import React, { useState, useEffect } from 'react';
import { BookOpenIcon, DocumentTextIcon, AcademicCapIcon, QuestionMarkCircleIcon, InformationCircleIcon } from '@heroicons/react/24/outline';
import { useButtonClasses } from '@/hooks/useStyleClasses';
import { HelpManualSection, ShortcutList } from './components/helpComponents';

export default function HelpPage() {
  const [docs, setDocs] = useState<string[]>([]), [loading, setLoading] = useState(true), [err, setErr] = useState<string | null>(null);
  const pBtn = useButtonClasses('primary', 'md'), sBtn = useButtonClasses('secondary', 'sm');

  useEffect(() => {
    fetch('/api/aide/list-documents').then(r => r.ok ? r.json() : Promise.reject(r.statusText)).then(setDocs).catch(e => setErr(e.message)).finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-background p-6 container mx-auto text-text_darker">
      <div className="mb-8"><h1 className="text-4xl font-bold text-primary">Centre d'Aide</h1><p className="mt-2 text-text_dark">Guides et réponses pour SocialConnect.</p></div>
      <HelpManualSection primaryBtn={pBtn} />
      <div className="bg-white p-6 rounded-xl shadow border border-slate-200 space-y-8">
        <div>
          <div className="flex items-center mb-4"><QuestionMarkCircleIcon className="h-6 w-6 mr-2 text-primary" /><h2 className="text-2xl font-semibold border-b pb-2">Aide Générale</h2></div>
          <div className="space-y-6 text-sm text-text_dark">
            <div><h3 className="text-xl font-semibold text-primary">Dossiers</h3><p>Gérez vos usagers, créez des dossiers et suivez les actions.</p></div>
            <div><h3 className="text-xl font-semibold text-primary">Raccourcis</h3><ShortcutList /></div>
          </div>
        </div>
        <div>
          <div className="flex items-center mb-4"><DocumentTextIcon className="h-6 w-6 mr-2 text-primary" /><h2 className="text-2xl font-semibold border-b pb-2">Guides</h2></div>
          {loading ? <p>Chargement...</p> : err ? <p className="text-red-600">{err}</p> : (
            <ul className="list-disc list-inside space-y-1">{docs.map(d => <li key={d}><a href={`/documents_aide/${encodeURIComponent(d)}`} download className="text-blue-600 hover:underline">{d}</a></li>)}</ul>
          )}
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="p-4 bg-blue-50 border rounded-lg"><h3 className="font-bold text-blue-700">Manuel</h3><a href="/documents_aide/MANUEL_UTILISATEUR.html" target="_blank" className={useButtonClasses('primary', 'sm')}>Ouvrir</a></div>
          <div className="p-4 bg-green-50 border rounded-lg"><h3 className="font-bold text-green-700">Technique</h3><a href="/documents_aide/MANUEL_UTILISATEUR.html" target="_blank" className={sBtn}>Voir</a></div>
        </div>
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-3">
          <InformationCircleIcon className="h-6 w-6 text-amber-600" />
          <div><h3 className="font-bold text-amber-700">Support</h3><p className="text-sm">Email: support@pasq.be | L-V 9h-17h</p></div>
        </div>
      </div>
    </div>
  );
}
