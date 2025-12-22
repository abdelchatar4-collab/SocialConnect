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

export interface ProposedItem {
    type: string;
    description?: string;
    date?: string;
    validated: boolean;
}

export interface AnalysisResult {
    actions: ProposedItem[];
    problematiques: ProposedItem[];
}

interface UseNotesAIProps {
    formData: UserFormData;
    onInputChange: (field: keyof UserFormData, value: any) => void;
}

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

        const systemPrompt = `
Tu es un assistant social professionnel. Reformule cette note de manière claire et professionnelle.

RÈGLES STRICTES :
1. NE JAMAIS RÉSUMER - Garder ABSOLUMENT TOUTES les informations
2. Corriger l'orthographe et la grammaire
3. Utiliser un style formel et neutre
4. Conserver les dates et noms propres tels quels
5. Structurer en paragraphes si nécessaire
6. Ne rien inventer ni ajouter
7. OBLIGATOIRE: Écrire les dates au format jj/mm/aaaa en début de phrase.

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

        // Fuzzy match helper
        const findBestMatch = (candidate: string, options: any[]) => {
            if (!candidate) return null;
            const norm = candidate.toString().toLowerCase().trim();
            const exact = options.find(o => o.label.toLowerCase() === norm);
            if (exact) return exact.label;
            const partials = options.filter(o => {
                const l = o.label.toLowerCase();
                return norm.includes(l) || l.includes(norm);
            });
            if (partials.length > 0) {
                partials.sort((a, b) => b.label.length - a.label.length);
                return partials[0].label;
            }
            return null;
        };

        // Rule-based detection
        const detectCategoriesFromRules = (text: string) => {
            const detected: { type: string, description: string }[] = [];
            const textLower = text.toLowerCase();
            const rules = [
                { key: 'CPAS', labels: ['CPAS', 'RIS', 'revenu d\'intégration', 'aide sociale'] },
                { key: 'Logement', labels: ['loyer', 'bail', 'propriétaire', 'préavis', 'insalubrité'] },
                { key: 'Endettement/Surendettement', labels: ['dette', 'huissier', 'facture impayée', 'rappel', 'mise en demeure'] },
                { key: 'Energie (eau;gaz;électricité)', labels: ['engie', 'sibelga', 'vivaqua', 'totalenergies', 'compteur'] },
                { key: 'Santé (physique; handicap; autonomie)', labels: ['médecin', 'hôpital', 'mutuelle', 'pharmacie', 'traitement'] },
            ];
            rules.forEach(rule => {
                const realLabel = findBestMatch(rule.key, problematiqueOptions);
                if (realLabel && rule.labels.some(l => textLower.includes(l.toLowerCase()))) {
                    detected.push({
                        type: realLabel,
                        description: `Détecté via mot-clé ("${rule.labels.find(l => textLower.includes(l.toLowerCase()))}")`,
                    });
                }
            });
            return detected;
        };

        const ruleBasedProblematiques = detectCategoriesFromRules(allNotes);

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
            systemPrompt = `Tu es un assistant social expert en Belgique, spécialisé dans l'accompagnement social en Région de Bruxelles-Capitale... (Lexique Belge Oubligatoire: AER, RIS, SISP, etc.)`;
            // I'll use the full prompt from the original file to ensure parity
            systemPrompt = `Tu es un assistant social expert en Belgique, spécialisé dans l'accompagnement social en Région de Bruxelles-Capitale. Ta mission est de structurer les notes de suivi dans un contexte institutionnel belge (communes, CPAS, SPF, sociétés de logement social, médiations locales, etc.).

**CORRESPONDANCE LEXICALE BELGE OBLIGATOIRE** (Ne jamais confondre avec les termes français) :
- AER = Avertissement-Extrait de Rôle (SPF Finances Belgique)
- RIF = Relevé d'Identité Fiscale (France uniquement - ignorer en Belgique)
- RIS = Revenu d'Intégration Sociale (CPAS Belgique)
- RCD = Recommandation de Crédit (Belgique)
- AIS = Agence Immobilière Sociale (Belgique)
- SLRB = Société du Logement de la Région de Bruxelles-Capitale
- SISP = Société Immobilière de Service Public
- Vierge Noire = Allocation pour l'aide aux personnes âgées (Belgique)
- ONEM = Office National de l'Emploi (Belgique)
- Actiris = Forem bruxellois (Bruxelles)
- PMS = Psycho-Médico-Social (écoles Belgique)
- SPF = Service Public Fédéral (Belgique)
- Pro deo = Aide juridique gratuite (Belgique)

ANALYSE SÉMANTIQUE ET RÈGLES DE CLASSEMENT :
1. [Endettement/Surendettement]
2. [Logement]
3. [Santé (physique; handicap; autonomie)]
4. [Energie (eau; gaz; électricité)]
5. [CPAS]
6. [Juridique]
7. [Scolarité]
8. [Fiscalité]
9. [ISP]

INSTRUCTIONS DE SORTIE :
- Extrais les ACTIONS et PROBLÉMATIQUES en te basant sur ces règles.
- Réponds UNIQUEMENT avec un objet JSON valide.
- Si un terme correspond à une règle ci-dessus, tu DOIS cocher la catégorie correspondante.

VOCABULAIRE AUTORISÉ pour les actions: ${validActions}
VOCABULAIRE AUTORISÉ pour les problématiques: ${validProblematiques}`;
        }

        const userPrompt = `Analyse ce texte et extrais les actions et problématiques.
Réponds UNIQUEMENT en JSON avec ce format exact:
{"actions":[{"type":"NomAction","description":"contexte","date":"YYYY-MM-DD"}],"problematiques":[{"type":"NomProbleme","detail":"detail"}]}

TEXTE À ANALYSER:
${allNotes}`;

        try {
            const response = await aiClient.complete(userPrompt, systemPrompt, { temperature: analysisTemp });
            if (response.error) throw new Error(response.error);
            if (!response.content) throw new Error("Réponse vide");

            let jsonStr = response.content.replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim();
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
            setAnalysisError(`Erreur : ${e.message}`);
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
                id: `ai-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                type: a.type,
                date: a.date || new Date().toISOString().split('T')[0],
                description: a.description || '',
                partenaire: ''
            } as ActionSuivi));

        const validatedProblems = analysisResult.problematiques
            .filter(p => p.validated)
            .map(p => ({
                id: `ai-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
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
