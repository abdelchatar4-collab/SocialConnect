/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect est un logiciel libre : vous pouvez le redistribuer et/ou le modifier selon les termes de la Licence Publique Générale GNU telle que publiée par la Free Software Foundation, soit la version 3 de la licence, soit (à votre convenance) toute version ultérieure.

Ce programme est distribué dans l'espoir qu'il sera utile, mais SANS AUCUNE GARANTIE ; sans même la garantie implicite de COMMERCIALISATION ou d'ADÉQUATION À UN USAGE PARTICULIER. Voir la Licence Publique Générale GNU pour plus de détails.
*/

import { useState, useEffect, useCallback, useMemo } from 'react';
import { UserFormData, Problematique, ActionSuivi } from '@/types/user';
import { aiClient } from '@/lib/ai-client';
import { useDropdownOptionsAPI } from '@/hooks/useDropdownOptionsAPI';
import { DROPDOWN_CATEGORIES } from '@/constants/dropdownCategories';
import { ProposedItem, AnalysisResult, UseNotesAIProps } from '@/types/notes-ai';
import {
    REFORMULATION_SYSTEM_PROMPT,
    getAnalysisSystemPrompt,
    ANALYSIS_USER_PROMPT,
    findBestMatch,
    detectCategoriesFromRules
} from '@/utils/notesAiUtils';

export const useNotesAI = ({ formData, onInputChange }: UseNotesAIProps) => {
    // AI State - Availability
    const [isAiAvailable, setIsAiAvailable] = useState(false);

    // AI State - Analysis
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
    const [analysisError, setAnalysisError] = useState<string | null>(null);

    // AI State - Reformulation (Lisser)
    const [isReformulating, setIsReformulating] = useState(false);
    const [reformulatedText, setReformulatedText] = useState<string | null>(null);
    const [reformulationField, setReformulationField] = useState<'remarques' | 'notesGenerales' | null>(null);
    const [reformulationError, setReformulationError] = useState<string | null>(null);

    // Fetch vocabulary lists for the AI prompt
    const { options: actionOptions } = useDropdownOptionsAPI(DROPDOWN_CATEGORIES.ACTIONS);
    const { options: problematiqueOptions } = useDropdownOptionsAPI(DROPDOWN_CATEGORIES.PROBLEMATIQUES);

    const validActions = useMemo(() => actionOptions.map(o => o.label).join(', '), [actionOptions]);
    const validProblematiques = useMemo(() => problematiqueOptions.map(o => o.label).join(', '), [problematiqueOptions]);

    // Check AI availability on mount
    useEffect(() => {
        const checkAi = async () => {
            const available = await aiClient.checkAvailability();
            setIsAiAvailable(available);
        };
        checkAi();
    }, []);

    // Combine all notes for analysis (full text)
    const getAllNotesText = useCallback(() => {
        const parts = [
            formData.remarques,
            formData.notesGenerales,
            formData.informationImportante
        ].filter(Boolean);
        return parts.join('\n\n');
    }, [formData.remarques, formData.notesGenerales, formData.informationImportante]);

    // AI Reformulation function (Lisser)
    const handleLisser = async (field: 'remarques' | 'notesGenerales') => {
        const text = field === 'remarques' ? formData.remarques : formData.notesGenerales;

        if (!text || !text.trim()) {
            setReformulationError("Aucun texte à reformuler.");
            return;
        }

        setIsReformulating(true);
        setReformulationError(null);
        setReformulatedText(null);
        setReformulationField(field);

        const systemPrompt = REFORMULATION_SYSTEM_PROMPT + `
NOTE ORIGINALE :
${text}

TEXTE REFORMULÉ :
    `;

        // Temperature 0.4 - enough creativity for good phrasing, not too much to hallucinate
        const completionOptions = { temperature: 0.4 };

        try {
            const response = await aiClient.complete(text, systemPrompt, completionOptions);

            if (response.error) {
                throw new Error(response.error);
            }

            let cleanText = response.content
                .replace(/^["'`]+|["'`]+$/g, '')
                .replace(/^(TEXTE REFORMULÉ|Reformulation)\s*:\s*/i, '')
                .trim();

            setReformulatedText(cleanText);

        } catch (e: any) {
            console.error("Erreur de reformulation :", e);
            setReformulationError("Impossible de reformuler. Vérifiez que l'IA est active.");
        } finally {
            setIsReformulating(false);
        }
    };

    const acceptReformulation = () => {
        if (reformulatedText && reformulationField) {
            onInputChange(reformulationField, reformulatedText);
            setReformulatedText(null);
            setReformulationField(null);
        }
    };

    const rejectReformulation = () => {
        setReformulatedText(null);
        setReformulationField(null);
    };

    const abortReformulation = () => {
        aiClient.abort();
        setIsReformulating(false);
        setReformulationError('Reformulation annulée');
        setReformulatedText(null);
        setReformulationField(null);
    };

    const abortAnalysis = () => {
        aiClient.abort();
        setIsAnalyzing(false);
        setAnalysisError('Analyse annulée');
        setAnalysisResult(null);
    };

    // AI Analysis function
    const handleAnalyze = async () => {
        let allNotes = getAllNotesText();

        if (!allNotes.trim()) {
            setAnalysisError("Aucune note à analyser. Écrivez d'abord dans les champs ci-dessus.");
            return;
        }

        const ruleBasedProblematiques = detectCategoriesFromRules(allNotes, problematiqueOptions);

        setIsAnalyzing(true);
        setAnalysisError(null);
        setAnalysisResult(null);

        aiClient.refreshSettings();
        const customPrompt = aiClient.getCustomAnalysisPrompt();
        const analysisTemp = aiClient.getAnalysisTemperature();
        const isAnalysisEnabled = aiClient.isAnalysisEnabled();

        if (!isAnalysisEnabled) {
            const result: AnalysisResult = {
                actions: [],
                problematiques: ruleBasedProblematiques.map(p => ({
                    type: p.type,
                    description: p.description,
                    validated: true
                }))
            };
            if (result.problematiques.length === 0) {
                setAnalysisError("Aucun élément détecté via les mots-clés. Activez l'IA pour une analyse plus approfondie.");
            } else {
                setAnalysisResult(result);
            }
            setIsAnalyzing(false);
            return;
        }

        let systemPrompt = '';
        if (customPrompt && customPrompt.trim()) {
            systemPrompt = customPrompt
                .replace('${validActions}', validActions)
                .replace('${validProblematiques}', validProblematiques);
        } else {
            systemPrompt = getAnalysisSystemPrompt(validActions, validProblematiques);
        }

        const userPrompt = ANALYSIS_USER_PROMPT + `\n\nTEXTE À ANALYSER:\n${allNotes}`;

        try {
            const response = await aiClient.complete(userPrompt, systemPrompt, { temperature: analysisTemp });
            if (response.error) throw new Error(response.error);
            if (!response.content) throw new Error("Réponse vide");

            let jsonStr = response.content.replace(/```json\s * /gi, '').replace(/```\s*/g, '').trim();
            const start = jsonStr.indexOf('{');
            const end = jsonStr.lastIndexOf('}');
            if (start !== -1 && end !== -1) jsonStr = jsonStr.substring(start, end + 1);

            // Simple repair logic
            jsonStr = jsonStr.replace(/,\s*}/g, '}').replace(/,\s*]/g, ']');

            const parsed = JSON.parse(jsonStr);

            const result: AnalysisResult = {
                problematiques: (parsed.problematiques || [])
                    .filter((p: any) => p && p.type)
                    .map((p: any) => {
                        const label = findBestMatch(p.type, problematiqueOptions);
                        return {
                            type: label || p.type,
                            description: p.description || '',
                            validated: !!label
                        };
                    }),
                actions: (parsed.actions || [])
                    .filter((a: any) => a && a.type)
                    .map((a: any) => {
                        const label = findBestMatch(a.type, actionOptions);
                        return {
                            type: label || a.type,
                            description: a.description || '',
                            date: a.date || new Date().toISOString().split('T')[0],
                            validated: false
                        };
                    })
            };

            // Merge hybrid
            ruleBasedProblematiques.forEach(ruleItem => {
                const exists = result.problematiques.find(p => p.type === ruleItem.type);
                if (!exists) {
                    result.problematiques.unshift({ type: ruleItem.type, description: ruleItem.description, validated: true });
                } else {
                    exists.validated = true;
                }
            });

            if (result.problematiques.length === 0 && result.actions.length === 0) {
                setAnalysisError("Aucun élément détecté.");
            } else {
                setAnalysisResult(result);
            }

        } catch (e: any) {
            setAnalysisError(`Erreur: ${e.message} `);
        } finally {
            setIsAnalyzing(false);
        }
    };

    const toggleValidation = (category: 'actions' | 'problematiques', index: number) => {
        setAnalysisResult(prev => {
            if (!prev) return prev;
            const updated = { ...prev };
            updated[category] = [...prev[category]];
            updated[category][index] = { ...updated[category][index], validated: !updated[category][index].validated };
            return updated;
        });
    };

    const selectAllItems = (category: 'actions' | 'problematiques') => {
        setAnalysisResult(prev => {
            if (!prev) return prev;
            return { ...prev, [category]: prev[category].map(item => ({ ...item, validated: true })) };
        });
    };

    const deselectAllItems = (category: 'actions' | 'problematiques') => {
        setAnalysisResult(prev => {
            if (!prev) return prev;
            return { ...prev, [category]: prev[category].map(item => ({ ...item, validated: false })) };
        });
    };

    const applyValidatedItems = () => {
        if (!analysisResult) return;

        const validatedActions = analysisResult.actions
            .filter(a => a.validated)
            .map(a => ({
                id: `ai - ${Date.now()} -${Math.random().toString(36).substr(2, 9)} `,
                type: a.type,
                date: a.date || new Date().toISOString().split('T')[0],
                description: a.description || '',
                partenaire: ''
            } as ActionSuivi));

        const validatedProblems = analysisResult.problematiques
            .filter(p => p.validated)
            .map(p => ({
                id: `ai - ${Date.now()} -${Math.random().toString(36).substr(2, 9)} `,
                type: p.type,
                description: p.description || '',
                dateSignalement: new Date().toISOString().split('T')[0]
            } as Problematique));

        if (validatedActions.length > 0) {
            onInputChange('actions', [...(formData.actions || []), ...validatedActions]);
        }

        if (validatedProblems.length > 0) {
            const existingProblems = formData.problematiques || [];
            const nonDuplicateNewProblems = validatedProblems.filter(newP =>
                !existingProblems.some(existingP => existingP.type === newP.type)
            );
            onInputChange('problematiques', [...existingProblems, ...nonDuplicateNewProblems]);
        }

        setAnalysisResult(null);
    };

    const handleCleanData = () => {
        // 1. Clean Problematiques (Deduplicate)
        const existingProbs = formData.problematiques || [];
        const uniqueProbs = existingProbs.filter((p, index, self) =>
            index === self.findIndex((t) => (t.type === p.type))
        );

        // 2. Clean Actions
        const existingActions = formData.actions || [];
        const cleanedActions = existingActions.map(a => {
            const typeStr = a.type || '';
            const isoMatch = typeStr.match(/(\d{4}-\d{2}-\d{2})(T[\d:.]*Z?)?/);
            if (isoMatch) {
                return { ...a, type: typeStr.replace(isoMatch[0], '').trim(), date: isoMatch[1] };
            }
            return a;
        });

        const uniqueActions = cleanedActions.filter((a, index, self) =>
            index === self.findIndex((t) => (t.type === a.type && t.date === a.date))
        );

        const removedCount = (existingProbs.length - uniqueProbs.length) + (existingActions.length - uniqueActions.length);

        if (removedCount > 0 || existingActions.length !== cleanedActions.length) {
            if (confirm(`J'ai trouvé ${removedCount} doublons et erreurs de format.\n\nVoulez-vous nettoyer les listes ?`)) {
                onInputChange('problematiques', uniqueProbs);
                onInputChange('actions', uniqueActions);
            }
        } else {
            alert("Tout semble correct ! Aucun doublon trouvé.");
        }
    };

    return {
        isAiAvailable,
        isAnalyzing,
        analysisResult,
        analysisError,
        isReformulating,
        reformulatedText,
        reformulationField,
        reformulationError,
        handleLisser,
        acceptReformulation,
        rejectReformulation,
        abortReformulation,
        handleAnalyze,
        abortAnalysis,
        toggleValidation,
        selectAllItems,
        deselectAllItems,
        applyValidatedItems,
        handleCleanData,
        setAnalysisResult
    };
};
