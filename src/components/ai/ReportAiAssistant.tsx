/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect est un logiciel libre : vous pouvez le redistribuer et/ou le modifier selon les termes de la Licence Publique Générale GNU telle que publiée par la Free Software Foundation, soit la version 3 de la licence, soit (à votre convenance) toute version ultérieure.

Ce programme est distribué dans l'espoir qu'il sera utile, mais SANS AUCUNE GARANTIE ; sans même la garantie implicite de COMMERCIALISATION ou d'ADÉQUATION À UN USAGE PARTICULIER. Voir la Licence Publique Générale GNU pour plus de détails.
*/

'use client';

import React, { useState, useEffect } from 'react';
import {
    SparklesIcon,
    DocumentTextIcon,
    ChartBarSquareIcon,
    LightBulbIcon,
    ArrowPathIcon,
    CheckIcon,
    PlusIcon,
    PencilSquareIcon
} from '@heroicons/react/24/outline';
import { aiClient } from '@/lib/ai-client';
import { getShortGlossaryPromptText } from '@/constants/belgianSocialWorkGlossary';

interface ReportAiAssistantProps {
    users: any[];
    reportContent: string;
    onInsertText: (text: string) => void;
    onReplaceText: (text: string) => void;
}

interface ReportStats {
    total: number;
    actifs: number;
    clotures: number;
    nouveauxCeMois: number;
    parAntenne: Record<string, number>;
    parProblematique: Record<string, number>;
    parStatutSejour: Record<string, number>;
}

// Compute statistics from users
function computeStats(users: any[]): ReportStats {
    const now = new Date();
    const thisMonth = now.getMonth();
    const thisYear = now.getFullYear();

    const parAntenne: Record<string, number> = {};
    const parProblematique: Record<string, number> = {};
    const parStatutSejour: Record<string, number> = {};

    let actifs = 0;
    let clotures = 0;
    let nouveauxCeMois = 0;

    users.forEach(u => {
        // Status
        if (u.etat === 'Actif') actifs++;
        if (u.etat === 'Cloturé' || u.etat === 'Clôturé') clotures++;

        // New this month
        if (u.dateOuverture) {
            const d = new Date(u.dateOuverture);
            if (d.getMonth() === thisMonth && d.getFullYear() === thisYear) {
                nouveauxCeMois++;
            }
        }

        // By antenna
        const ant = u.antenne || 'Non assignée';
        parAntenne[ant] = (parAntenne[ant] || 0) + 1;

        // By problématique
        if (u.problematiques && Array.isArray(u.problematiques)) {
            u.problematiques.forEach((p: any) => {
                const type = p.type || 'Autre';
                parProblematique[type] = (parProblematique[type] || 0) + 1;
            });
        }

        // By séjour status
        if (u.statutSejour) {
            parStatutSejour[u.statutSejour] = (parStatutSejour[u.statutSejour] || 0) + 1;
        }
    });

    return {
        total: users.length,
        actifs,
        clotures,
        nouveauxCeMois,
        parAntenne,
        parProblematique,
        parStatutSejour,
    };
}

// Format stats for AI prompt
function formatStatsForPrompt(stats: ReportStats): string {
    const antennes = Object.entries(stats.parAntenne)
        .map(([k, v]) => `  - ${k}: ${v}`)
        .join('\n');

    const problematiques = Object.entries(stats.parProblematique)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([k, v]) => `  - ${k}: ${v}`)
        .join('\n');

    return `
STATISTIQUES DU SERVICE (${new Date().toLocaleDateString('fr-FR')}):
- Total dossiers: ${stats.total}
- Dossiers actifs: ${stats.actifs}
- Dossiers clôturés: ${stats.clotures}
- Nouveaux ce mois: ${stats.nouveauxCeMois}

RÉPARTITION PAR ANTENNE:
${antennes}

TOP PROBLÉMATIQUES:
${problematiques}
`;
}

export default function ReportAiAssistant({ users, reportContent, onInsertText, onReplaceText }: ReportAiAssistantProps) {
    const [isAvailable, setIsAvailable] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [activeAction, setActiveAction] = useState<string | null>(null);
    const [generatedText, setGeneratedText] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const stats = React.useMemo(() => computeStats(users), [users]);
    const statsText = React.useMemo(() => formatStatsForPrompt(stats), [stats]);
    const glossary = getShortGlossaryPromptText();

    // Check LOCAL AI availability on mount (Ollama only for privacy)
    useEffect(() => {
        const check = async () => {
            const available = await aiClient.checkLocalAvailability();
            setIsAvailable(available);
        };
        check();
    }, []);

    // Generate content based on action type
    const generate = async (action: string) => {
        setIsLoading(true);
        setActiveAction(action);
        setError(null);
        setGeneratedText(null);

        let systemPrompt = `Tu es un assistant social professionnel belge qui aide à rédiger des rapports d'activité.
${glossary}

Utilise un style professionnel, formel et factuel.
Ne fais pas de suppositions - base-toi uniquement sur les données fournies.
Réponds en français, de manière structurée et concise.`;

        let userPrompt = '';

        switch (action) {
            case 'contexte':
                userPrompt = `Rédige une section "CONTEXTE" pour un rapport d'activité du service d'aide sociale.

${statsText}

Le texte doit:
- Présenter le service et sa mission
- Mentionner la période concernée
- Donner un aperçu des chiffres clés
- Faire 3-4 paragraphes maximum

Réponds UNIQUEMENT avec le texte de la section, sans titre ni commentaire.`;
                break;

            case 'analyse':
                userPrompt = `Rédige une section "ANALYSE STATISTIQUE" pour un rapport d'activité.

${statsText}

Le texte doit:
- Analyser les tendances observées
- Comparer les différentes antennes si pertinent
- Identifier les problématiques majeures
- Proposer des pistes d'explication
- Faire 4-5 paragraphes descriptifs

Réponds UNIQUEMENT avec le texte de la section, sans titre ni commentaire.`;
                break;

            case 'conclusions':
                userPrompt = `Rédige une section "CONCLUSIONS ET RECOMMANDATIONS" pour un rapport d'activité.

${statsText}

Contenu actuel du rapport:
${reportContent}

Le texte doit:
- Synthétiser les points clés
- Proposer des recommandations concrètes
- Identifier les priorités d'action
- Conclure sur une note constructive
- Faire 3-4 paragraphes

Réponds UNIQUEMENT avec le texte de la section, sans titre ni commentaire.`;
                break;

            case 'ameliorer':
                userPrompt = `Améliore et professionnalise le texte suivant tout en conservant toutes les informations:

TEXTE À AMÉLIORER:
${reportContent}

Règles:
- Garde TOUTES les informations et chiffres
- Améliore le style et la structure
- Corrige les erreurs éventuelles
- Utilise un vocabulaire professionnel
- Structure en paragraphes logiques

Réponds UNIQUEMENT avec le texte amélioré, sans commentaire.`;
                break;

            default:
                setError('Action non reconnue');
                setIsLoading(false);
                return;
        }

        try {
            // IMPORTANT: Use completeLocal to ensure data stays on local Ollama server
            // Report generation uses aggregated data which is privacy-sensitive
            const response = await aiClient.completeLocal(userPrompt, systemPrompt);
            if (response.error) {
                throw new Error(response.error);
            }
            setGeneratedText(response.content.trim());
        } catch (e: any) {
            console.error('AI generation failed:', e);
            setError(e.message || 'Erreur lors de la génération');
        } finally {
            setIsLoading(false);
            setActiveAction(null);
        }
    };

    // Handle inserting generated text
    const handleInsert = () => {
        if (generatedText) {
            onInsertText('\n\n' + generatedText);
            setGeneratedText(null);
        }
    };

    // Handle replacing with generated text
    const handleReplace = () => {
        if (generatedText) {
            onReplaceText(generatedText);
            setGeneratedText(null);
        }
    };

    if (!isAvailable) {
        return (
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <div className="flex items-center text-gray-500">
                    <SparklesIcon className="w-5 h-5 mr-2 text-gray-400" />
                    <div>
                        <p className="text-sm font-medium">IA Locale (Ollama) requise</p>
                        <p className="text-xs">Cette fonctionnalité nécessite Ollama pour la confidentialité des données</p>
                        <p className="text-xs mt-1">Configurez Ollama dans Paramètres → Intelligence Artificielle</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-gradient-to-br from-purple-50 to-indigo-50 p-4 rounded-lg border border-purple-200">
            {/* Header */}
            <div className="flex items-center mb-4">
                <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-lg flex items-center justify-center mr-3">
                    <SparklesIcon className="w-4 h-4 text-white" />
                </div>
                <div>
                    <h4 className="font-semibold text-purple-900">Assistant IA Rapport</h4>
                    <p className="text-xs text-purple-600">🔒 IA Locale uniquement (Ollama)</p>
                </div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-2 mb-4">
                <button
                    onClick={() => generate('contexte')}
                    disabled={isLoading}
                    className={`flex items-center p-2 rounded-lg text-sm font-medium transition-all ${activeAction === 'contexte'
                        ? 'bg-purple-500 text-white'
                        : 'bg-white text-purple-700 hover:bg-purple-100 border border-purple-200'
                        } disabled:opacity-50`}
                >
                    {activeAction === 'contexte' ? (
                        <ArrowPathIcon className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                        <DocumentTextIcon className="w-4 h-4 mr-2" />
                    )}
                    Contexte
                </button>

                <button
                    onClick={() => generate('analyse')}
                    disabled={isLoading}
                    className={`flex items-center p-2 rounded-lg text-sm font-medium transition-all ${activeAction === 'analyse'
                        ? 'bg-purple-500 text-white'
                        : 'bg-white text-purple-700 hover:bg-purple-100 border border-purple-200'
                        } disabled:opacity-50`}
                >
                    {activeAction === 'analyse' ? (
                        <ArrowPathIcon className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                        <ChartBarSquareIcon className="w-4 h-4 mr-2" />
                    )}
                    Analyse
                </button>

                <button
                    onClick={() => generate('conclusions')}
                    disabled={isLoading}
                    className={`flex items-center p-2 rounded-lg text-sm font-medium transition-all ${activeAction === 'conclusions'
                        ? 'bg-purple-500 text-white'
                        : 'bg-white text-purple-700 hover:bg-purple-100 border border-purple-200'
                        } disabled:opacity-50`}
                >
                    {activeAction === 'conclusions' ? (
                        <ArrowPathIcon className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                        <LightBulbIcon className="w-4 h-4 mr-2" />
                    )}
                    Conclusions
                </button>

                <button
                    onClick={() => generate('ameliorer')}
                    disabled={isLoading || !reportContent.trim()}
                    className={`flex items-center p-2 rounded-lg text-sm font-medium transition-all ${activeAction === 'ameliorer'
                        ? 'bg-amber-500 text-white'
                        : 'bg-white text-amber-700 hover:bg-amber-100 border border-amber-200'
                        } disabled:opacity-50`}
                >
                    {activeAction === 'ameliorer' ? (
                        <ArrowPathIcon className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                        <PencilSquareIcon className="w-4 h-4 mr-2" />
                    )}
                    Améliorer
                </button>
            </div>

            {/* Cancel Button - shown when loading */}
            {isLoading && (
                <div className="mb-4">
                    <button
                        onClick={() => {
                            aiClient.abort();
                            setIsLoading(false);
                            setActiveAction(null);
                            setError('Génération annulée');
                        }}
                        className="w-full flex items-center justify-center px-3 py-2 rounded-lg font-medium text-sm bg-red-100 text-red-700 hover:bg-red-200 transition-all border border-red-300"
                    >
                        <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                        Annuler la génération
                    </button>
                </div>
            )}

            {/* Error Display */}
            {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                    <p className="text-sm text-red-700">{error}</p>
                </div>
            )}

            {/* Generated Text Preview */}
            {generatedText && (
                <div className="bg-white rounded-lg border border-purple-300 overflow-hidden">
                    <div className="p-3 bg-purple-50 border-b border-purple-200 flex items-center justify-between">
                        <span className="text-sm font-medium text-purple-800">Texte généré</span>
                        <div className="flex gap-2">
                            <button
                                onClick={handleInsert}
                                className="flex items-center px-2 py-1 text-xs font-medium text-green-700 bg-green-100 rounded hover:bg-green-200"
                            >
                                <PlusIcon className="w-3 h-3 mr-1" />
                                Ajouter
                            </button>
                            <button
                                onClick={handleReplace}
                                className="flex items-center px-2 py-1 text-xs font-medium text-purple-700 bg-purple-100 rounded hover:bg-purple-200"
                            >
                                <CheckIcon className="w-3 h-3 mr-1" />
                                Remplacer
                            </button>
                        </div>
                    </div>
                    <div className="p-3 max-h-48 overflow-y-auto">
                        <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">{generatedText}</p>
                    </div>
                </div>
            )}

            {/* Stats Summary */}
            <div className="mt-4 pt-3 border-t border-purple-200">
                <p className="text-xs text-purple-600 mb-2">Données utilisées :</p>
                <div className="flex flex-wrap gap-2">
                    <span className="px-2 py-1 bg-white rounded text-xs text-gray-600">{stats.total} usagers</span>
                    <span className="px-2 py-1 bg-green-100 rounded text-xs text-green-700">{stats.actifs} actifs</span>
                    <span className="px-2 py-1 bg-blue-100 rounded text-xs text-blue-700">{stats.nouveauxCeMois} nouveaux</span>
                </div>
            </div>
        </div>
    );
}
