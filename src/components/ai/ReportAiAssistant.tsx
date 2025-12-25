/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect est un logiciel libre : vous pouvez le redistribuer et/ou le modifier selon les termes de la Licence Publique Générale GNU telle que publiée par la Free Software Foundation, soit la version 3 de la licence, soit (à votre convenance) toute version ultérieure.
*/

'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { SparklesIcon, DocumentTextIcon, ChartBarSquareIcon, LightBulbIcon, ArrowPathIcon, CheckIcon, PlusIcon, PencilSquareIcon } from '@heroicons/react/24/outline';
import { aiClient } from '@/lib/ai-client';
import { getShortGlossaryPromptText } from '@/constants/belgianSocialWorkGlossary';
import { computeStats, formatStatsForPrompt } from '@/utils/ai/reportStatsUtils';
import { getSystemPrompt, getUserPrompt } from '@/utils/ai/reportPromptUtils';

interface ReportAiAssistantProps { users: any[]; reportContent: string; onInsertText: (text: string) => void; onReplaceText: (text: string) => void; }

export default function ReportAiAssistant({ users, reportContent, onInsertText, onReplaceText }: ReportAiAssistantProps) {
    const [isAvailable, setIsAvailable] = useState(false); const [isLoading, setIsLoading] = useState(false);
    const [activeAction, setActiveAction] = useState<string | null>(null); const [generatedText, setGeneratedText] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const stats = useMemo(() => computeStats(users), [users]); const statsText = useMemo(() => formatStatsForPrompt(stats), [stats]);
    const glossary = getShortGlossaryPromptText();

    useEffect(() => { const check = async () => setIsAvailable(await aiClient.checkAvailability()); check(); }, []);

    const generate = async (action: string) => {
        setIsLoading(true); setActiveAction(action); setError(null); setGeneratedText(null);
        try {
            const res = await aiClient.completeLocal(getUserPrompt(action, statsText, reportContent), getSystemPrompt(glossary));
            if (res.error) throw new Error(res.error);
            setGeneratedText(res.content.trim());
        } catch (e: any) { setError(e.message || 'Erreur lors de la génération'); } finally { setIsLoading(false); setActiveAction(null); }
    };

    if (!isAvailable) return <div className="bg-gray-50 p-4 rounded-lg border border-gray-200"><div className="flex items-center text-gray-500"><SparklesIcon className="w-5 h-5 mr-2 text-gray-400" /><div><p className="text-sm font-medium">IA Locale (Ollama) requise</p><p className="text-xs">Configurez Ollama dans Paramètres → Intelligence Artificielle</p></div></div></div>;

    return (
        <div className="bg-gradient-to-br from-purple-50 to-indigo-50 p-4 rounded-lg border border-purple-200">
            <div className="flex items-center mb-4"><div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-lg flex items-center justify-center mr-3"><SparklesIcon className="w-4 h-4 text-white" /></div><div><h4 className="font-semibold text-purple-900">Assistant IA Rapport</h4><p className="text-xs text-purple-600">🔒 IA Locale uniquement (Ollama)</p></div></div>
            <div className="grid grid-cols-2 gap-2 mb-4">
                {[{ id: 'contexte', label: 'Contexte', icon: DocumentTextIcon }, { id: 'analyse', label: 'Analyse', icon: ChartBarSquareIcon }, { id: 'conclusions', label: 'Conclusions', icon: LightBulbIcon }, { id: 'ameliorer', label: 'Améliorer', icon: PencilSquareIcon, color: 'amber' }].map(a => (
                    <button key={a.id} onClick={() => generate(a.id)} disabled={isLoading || (a.id === 'ameliorer' && !reportContent.trim())} className={`flex items-center p-2 rounded-lg text-sm font-medium transition-all ${activeAction === a.id ? (a.color === 'amber' ? 'bg-amber-500 text-white' : 'bg-purple-500 text-white') : (a.color === 'amber' ? 'bg-white text-amber-700 hover:bg-amber-100 border border-amber-200' : 'bg-white text-purple-700 hover:bg-purple-100 border border-purple-200')} disabled:opacity-50`}>
                        {activeAction === a.id ? <ArrowPathIcon className="w-4 h-4 mr-2 animate-spin" /> : <a.icon className="w-4 h-4 mr-2" />} {a.label}
                    </button>
                ))}
            </div>
            {isLoading && <button onClick={() => { aiClient.abort(); setIsLoading(false); setActiveAction(null); setError('Annulé'); }} className="w-full flex items-center justify-center px-3 py-2 rounded-lg text-sm bg-red-100 text-red-700 border border-red-300 mb-4 transition-all hover:bg-red-200">Annuler</button>}
            {error && <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4 text-sm text-red-700">{error}</div>}
            {generatedText && (
                <div className="bg-white rounded-lg border border-purple-300 overflow-hidden">
                    <div className="p-3 bg-purple-50 border-b border-purple-200 flex items-center justify-between"><span className="text-sm font-medium text-purple-800">Texte généré</span><div className="flex gap-2"><button onClick={() => { onInsertText('\n\n' + generatedText); setGeneratedText(null); }} className="flex items-center px-2 py-1 text-xs font-medium text-green-700 bg-green-100 rounded hover:bg-green-200"><PlusIcon className="w-3 h-3 mr-1" />Ajouter</button><button onClick={() => { onReplaceText(generatedText!); setGeneratedText(null); }} className="flex items-center px-2 py-1 text-xs font-medium text-purple-700 bg-purple-100 rounded hover:bg-purple-200"><CheckIcon className="w-3 h-3 mr-1" />Remplacer</button></div></div>
                    <div className="p-3 max-h-48 overflow-y-auto text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">{generatedText}</div>
                </div>
            )}
            <div className="mt-4 pt-3 border-t border-purple-200"><p className="text-xs text-purple-600 mb-2">Service : {stats.total} usagers ({stats.actifs} actifs, {stats.nouveauxCeMois} récents)</p></div>
        </div>
    );
}
