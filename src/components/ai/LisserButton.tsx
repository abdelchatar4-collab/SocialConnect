/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect est un logiciel libre : vous pouvez le redistribuer et/ou le modifier selon les termes de la Licence Publique Générale GNU telle que publiée par la Free Software Foundation, soit la version 3 de la licence, soit (à votre convenance) toute version ultérieure.

Ce programme est distribué dans l'espoir qu'il sera utile, mais SANS AUCUNE GARANTIE ; sans même la garantie implicite de COMMERCIALISATION ou d'ADÉQUATION À UN USAGE PARTICULIER. Voir la Licence Publique Générale GNU pour plus de détails.
*/

'use client';

import React, { useState } from 'react';
import { PencilSquareIcon, ArrowPathIcon, CheckIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { aiClient } from '@/lib/ai-client';
import { getShortGlossaryPromptText } from '@/constants/belgianSocialWorkGlossary';

interface LisserButtonProps {
    text: string;
    onAccept: (reformulatedText: string) => void;
    disabled?: boolean;
    colorScheme?: 'amber' | 'emerald' | 'blue' | 'purple' | 'teal';
    size?: 'sm' | 'md';
}

const colorClasses = {
    amber: {
        button: 'bg-amber-500 hover:bg-amber-600',
        buttonLoading: 'bg-amber-300',
        preview: 'bg-amber-50 border-amber-300',
        previewText: 'text-amber-800',
        previewBorder: 'border-amber-200',
    },
    emerald: {
        button: 'bg-emerald-500 hover:bg-emerald-600',
        buttonLoading: 'bg-emerald-300',
        preview: 'bg-emerald-50 border-emerald-300',
        previewText: 'text-emerald-800',
        previewBorder: 'border-emerald-200',
    },
    blue: {
        button: 'bg-blue-500 hover:bg-blue-600',
        buttonLoading: 'bg-blue-300',
        preview: 'bg-blue-50 border-blue-300',
        previewText: 'text-blue-800',
        previewBorder: 'border-blue-200',
    },
    purple: {
        button: 'bg-purple-500 hover:bg-purple-600',
        buttonLoading: 'bg-purple-300',
        preview: 'bg-purple-50 border-purple-300',
        previewText: 'text-purple-800',
        previewBorder: 'border-purple-200',
    },
    teal: {
        button: 'bg-teal-500 hover:bg-teal-600',
        buttonLoading: 'bg-teal-300',
        preview: 'bg-teal-50 border-teal-300',
        previewText: 'text-teal-800',
        previewBorder: 'border-teal-200',
    },
};

export function LisserButton({
    text,
    onAccept,
    disabled = false,
    colorScheme = 'amber',
    size = 'sm',
}: LisserButtonProps) {
    const [isReformulating, setIsReformulating] = useState(false);
    const [reformulatedText, setReformulatedText] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const colors = colorClasses[colorScheme];

    const handleLisser = async () => {
        if (!text || !text.trim()) {
            setError("Aucun texte à reformuler.");
            return;
        }

        setIsReformulating(true);
        setError(null);
        setReformulatedText(null);

        const glossary = getShortGlossaryPromptText();

        const systemPrompt = `
Tu es un assistant social professionnel belge. Reformule cette note de manière claire et professionnelle.

${glossary}

RÈGLES STRICTES :
1. NE JAMAIS RÉSUMER - Garder ABSOLUMENT TOUTES les informations
2. Corriger l'orthographe et la grammaire
3. Utiliser un style formel et neutre
4. Conserver les dates, noms propres et acronymes tels quels
5. Structurer en paragraphes si nécessaire
6. Ne rien inventer ni ajouter
7. Utiliser le vocabulaire professionnel belge ci-dessus

Réponds UNIQUEMENT avec le texte reformulé, sans commentaire ni introduction.

NOTE ORIGINALE :
${text}

TEXTE REFORMULÉ :
    `;

        try {
            const response = await aiClient.complete(text, systemPrompt);

            if (response.error) {
                throw new Error(response.error);
            }

            // Clean up the response
            let cleanText = response.content
                .replace(/^["'`]+|["'`]+$/g, '')
                .replace(/^(TEXTE REFORMULÉ|Reformulation)\s*:\s*/i, '')
                .trim();

            setReformulatedText(cleanText);

        } catch (e: any) {
            console.error("Erreur de reformulation :", e);
            setError("Impossible de reformuler. Vérifiez que l'IA est active.");
        } finally {
            setIsReformulating(false);
        }
    };

    const handleAccept = () => {
        if (reformulatedText) {
            onAccept(reformulatedText);
            setReformulatedText(null);
        }
    };

    const handleReject = () => {
        setReformulatedText(null);
    };

    // Don't show button if no text
    if (!text || !text.trim()) {
        return null;
    }

    return (
        <>
            {/* Lisser Button */}
            <button
                type="button"
                onClick={handleLisser}
                disabled={disabled || isReformulating}
                className={`inline-flex items-center px-3 py-1 rounded-lg font-medium text-white transition-all shadow-sm
          ${size === 'sm' ? 'text-xs' : 'text-sm'}
          ${isReformulating ? colors.buttonLoading + ' cursor-wait' : colors.button}`}
            >
                {isReformulating ? (
                    <>
                        <ArrowPathIcon className="w-3 h-3 mr-1 animate-spin" />
                        Lissage...
                    </>
                ) : (
                    <>
                        <PencilSquareIcon className="w-3 h-3 mr-1" />
                        ✨ Lisser
                    </>
                )}
            </button>

            {/* Error Message */}
            {error && (
                <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-red-700 text-xs">
                    {error}
                </div>
            )}

            {/* Reformulation Preview */}
            {reformulatedText && (
                <div className={`mt-3 p-3 ${colors.preview} border rounded-lg animate-fade-in`}>
                    <h5 className={`text-xs font-semibold ${colors.previewText} mb-2 flex items-center`}>
                        <PencilSquareIcon className="w-3 h-3 mr-1" />
                        Proposition de reformulation
                    </h5>
                    <p className={`text-xs text-gray-800 whitespace-pre-wrap bg-white p-2 rounded border ${colors.previewBorder}`}>
                        {reformulatedText}
                    </p>
                    <div className="flex justify-end gap-2 mt-2">
                        <button
                            type="button"
                            onClick={handleReject}
                            className="px-2 py-1 text-xs font-medium text-gray-600 hover:text-gray-800"
                        >
                            <XMarkIcon className="w-3 h-3 inline mr-0.5" />
                            Rejeter
                        </button>
                        <button
                            type="button"
                            onClick={handleAccept}
                            className="px-2 py-1 rounded text-xs font-medium bg-green-600 text-white hover:bg-green-700"
                        >
                            <CheckIcon className="w-3 h-3 inline mr-0.5" />
                            Accepter
                        </button>
                    </div>
                </div>
            )}
        </>
    );
}

// Hook to check AI availability
export function useAiAvailable() {
    const [isAvailable, setIsAvailable] = React.useState(false);

    React.useEffect(() => {
        const check = async () => {
            const available = await aiClient.checkAvailability();
            setIsAvailable(available);
        };
        check();
    }, []);

    return isAvailable;
}
