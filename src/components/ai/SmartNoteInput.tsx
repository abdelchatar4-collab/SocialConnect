/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect est un logiciel libre : vous pouvez le redistribuer et/ou le modifier selon les termes de la Licence Publique Générale GNU telle que publiée par la Free Software Foundation, soit la version 3 de la licence, soit (à votre convenance) toute version ultérieure.

Ce programme est distribué dans l'espoir qu'il sera utile, mais SANS AUCUNE GARANTIE ; sans même la garantie implicite de COMMERCIALISATION ou d'ADÉQUATION À UN USAGE PARTICULIER. Voir la Licence Publique Générale GNU pour plus de détails.
*/

import { useState, useMemo } from 'react';
import { aiClient } from '@/lib/ai-client';
import { SparklesIcon, ArrowPathIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import { useDropdownOptionsAPI } from '@/hooks/useDropdownOptionsAPI';
import { DROPDOWN_CATEGORIES } from '@/constants/dropdownCategories';

interface StructuredNote {
    action?: string;
    problematique?: string;
    resume?: string;
}

export default function SmartNoteInput() {
    const [note, setNote] = useState('');
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [result, setResult] = useState<StructuredNote | null>(null);
    const [error, setError] = useState<string | null>(null);

    // Fetch vocabulary from the App's Database
    const { options: actionOptions } = useDropdownOptionsAPI(DROPDOWN_CATEGORIES.ACTIONS);
    const { options: problematiqueOptions } = useDropdownOptionsAPI(DROPDOWN_CATEGORIES.PROBLEMATIQUES);

    // Prepare lists for the prompt
    const validActions = useMemo(() => actionOptions.map(o => o.label).join(', '), [actionOptions]);
    const validProblematiques = useMemo(() => problematiqueOptions.map(o => o.label).join(', '), [problematiqueOptions]);

    const handleAnalyze = async () => {
        if (!note.trim()) return;

        setIsAnalyzing(true);
        setError(null);
        setResult(null);

        const systemPrompt = `
      Tu es un assistant social. Analyse cette note.
      Réponds en JSON uniquement (FRANÇAIS).

      VOCABULAIRE IMPOSÉ (Choisis parmi ces listes si pertinent) :
      - ACTIONS VALIDES : [${validActions}]
      - PROBLEMATIQUES VALIDES : [${validProblematiques}]

      DICTIONNAIRE ADDITIONNEL :
      - "Rescheduling" => "Report de RDV"
      - "Booking" => "Prise de RDV"
      - "Paperwork" => "Administratif"

      RÈGLES :
      1. Si le terme exact n'existe pas, choisis le plus proche sémantiquement.
      2. Ne jamais inventer de terme hors liste si possible.

      FORMAT :
      {"action": "Action", "problematique": "Domaine", "resume": "Synthèse courte et professionnelle de la situation."}
    `;

        try {
            const response = await aiClient.complete(note, systemPrompt);

            if (response.error) {
                throw new Error(response.error);
            }

            // Tentative de nettoyage du JSON (au cas où le modèle est verbeux)
            const jsonStr = response.content.replace(/```json/g, '').replace(/```/g, '').trim();
            const structuredData = JSON.parse(jsonStr);

            setResult(structuredData);

        } catch (e: any) {
            console.error("Erreur d'analyse:", e);
            setError("Impossible de structurer la note. Vérifiez que Ollama tourne bien.");
        } finally {
            setIsAnalyzing(false);
        }
    };

    return (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="p-4 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
                <h3 className="font-semibold text-gray-800 flex items-center">
                    <SparklesIcon className="w-5 h-5 mr-2 text-purple-600" />
                    Note Intelligente
                </h3>
                <span className="text-xs text-gray-500 uppercase tracking-wider font-medium">Prototype</span>
            </div>

            <div className="p-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Note brute</label>
                <textarea
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 min-h-[100px]"
                    placeholder="Ex: Mme Dupont est passée ce matin. Elle a reçu un courrier d'huissier pour sa dette d'énergie. Je l'ai orientée vers le service médiation de dettes."
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                />

                <div className="mt-3 flex justify-end">
                    <button
                        onClick={handleAnalyze}
                        disabled={isAnalyzing || !note.trim()}
                        className="inline-flex items-center px-4 py-2 bg-purple-600 text-white font-medium rounded-lg hover:bg-purple-700 disabled:opacity-50 transition-colors"
                    >
                        {isAnalyzing ? (
                            <>
                                <ArrowPathIcon className="w-4 h-4 mr-2 animate-spin" />
                                Analyse en cours...
                            </>
                        ) : (
                            <>
                                <SparklesIcon className="w-4 h-4 mr-2" />
                                Structurer
                            </>
                        )}
                    </button>
                </div>

                {error && (
                    <div className="mt-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm border border-red-200">
                        {error}
                    </div>
                )}

                {result && (
                    <div className="mt-6 border-t border-gray-100 pt-4 animate-fade-in">
                        <h4 className="text-sm font-bold text-gray-900 mb-3 flex items-center">
                            <CheckCircleIcon className="w-4 h-4 mr-2 text-green-500" />
                            Résultat Structuré
                        </h4>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="bg-purple-50 p-3 rounded-lg border border-purple-100">
                                <p className="text-xs text-purple-800 font-semibold uppercase">Action Suggérée</p>
                                <p className="text-lg font-bold text-gray-900 mt-1">{result.action || '-'}</p>
                            </div>

                            <div className="bg-blue-50 p-3 rounded-lg border border-blue-100">
                                <p className="text-xs text-blue-800 font-semibold uppercase">Problématique</p>
                                <p className="text-lg font-bold text-gray-900 mt-1">{result.problematique || '-'}</p>
                            </div>
                        </div>

                        <div className="mt-4 bg-gray-50 p-3 rounded-lg border border-gray-200">
                            <p className="text-xs text-gray-500 font-semibold uppercase mb-1">Résumé Professionnel</p>
                            <p className="text-gray-800 italic">"{result.resume}"</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
