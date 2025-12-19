/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect est un logiciel libre : vous pouvez le redistribuer et/ou le modifier selon les termes de la Licence Publique Générale GNU telle que publiée par la Free Software Foundation, soit la version 3 de la licence, soit (à votre convenance) toute version ultérieure.

Ce programme est distribué dans l'espoir qu'il sera utile, mais SANS AUCUNE GARANTIE ; sans même la garantie implicite de COMMERCIALISATION ou d'ADÉQUATION À UN USAGE PARTICULIER. Voir la Licence Publique Générale GNU pour plus de détails.
*/

import React, { useState, useEffect, useMemo } from 'react';
import { UserFormData, Problematique, ActionSuivi } from '@/types/user';
import { FieldWrapper } from '@/components/shared/FieldWrapper';
import { TextAreaInput } from '@/components/shared/TextAreaInput';
import { aiClient } from '@/lib/ai-client';
import { useDropdownOptionsAPI } from '@/hooks/useDropdownOptionsAPI';
import { DROPDOWN_CATEGORIES } from '@/constants/dropdownCategories';
import { SparklesIcon, ArrowPathIcon, CheckIcon, XMarkIcon, PencilSquareIcon, TrashIcon } from '@heroicons/react/24/outline';

interface NotesStepProps {
  formData: UserFormData;
  onInputChange: (field: keyof UserFormData, value: any) => void;
  disabled?: boolean;
}

interface ProposedItem {
  type: string;
  description?: string;
  date?: string;
  validated: boolean;
}

interface AnalysisResult {
  actions: ProposedItem[];
  problematiques: ProposedItem[];
}

export const NotesStep: React.FC<NotesStepProps> = ({
  formData,
  onInputChange,
  disabled
}) => {
  // AI State - Analysis
  const [isAiAvailable, setIsAiAvailable] = useState(false);
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

  // Extract text before --- delimiter (for incremental notes)
  const extractRecentText = (text: string | undefined): string => {
    if (!text) return '';
    // Split on common delimiters: ---, ===, ___
    const delimiterRegex = /^[-=_]{3,}$/m;
    const parts = text.split(delimiterRegex);
    // Return only the first part (newest content)
    return parts[0].trim();
  };

  // Combine all notes for analysis (full text)
  const getAllNotesText = () => {
    const parts = [
      formData.remarques,
      formData.notesGenerales,
      formData.informationImportante
    ].filter(Boolean);
    return parts.join('\n\n');
  };

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

      // Clean up the response (remove any leading/trailing quotes or markdown)
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

  // Accept reformulated text
  const acceptReformulation = () => {
    if (reformulatedText && reformulationField) {
      onInputChange(reformulationField, reformulatedText);
      setReformulatedText(null);
      setReformulationField(null);
    }
  };

  // Reject reformulated text
  const rejectReformulation = () => {
    setReformulatedText(null);
    setReformulationField(null);
  };

  // AI Analysis function
  const handleAnalyze = async () => {
    let allNotes = getAllNotesText();

    // Warn if notes are very long (model context limits)
    const WARN_LENGTH = 50000;
    if (allNotes.length > WARN_LENGTH) {
      console.warn(`[AI Debug] Notes très longues: ${allNotes.length} chars - le modèle pourrait tronquer`);
    }
    console.log(`[AI Debug] Analyzing ${allNotes.length} characters of notes`);

    console.log('[AI Debug] Notes to analyze:', allNotes.substring(0, 500));

    // Fuzzy match helper to fix AI inconsistencies (e.g. "Aide CPAS" -> "CPAS")
    const findBestMatch = (candidate: string, options: any[]) => {
      if (!candidate) return null;
      const norm = candidate.toString().toLowerCase().trim();

      // 1. Exact match
      const exact = options.find(o => o.label.toLowerCase() === norm);
      if (exact) return exact.label;

      // 2. Contains match
      const partials = options.filter(o => {
        const l = o.label.toLowerCase();
        return norm.includes(l) || l.includes(norm);
      });

      if (partials.length > 0) {
        // Sort by length desc (match "Logement" before "Log")
        partials.sort((a, b) => b.label.length - a.label.length);
        return partials[0].label;
      }
      return null;
    };

    // 1. Détection déterministe par mots-clés (Système de secours)
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
        // Use findBestMatch to get the REAL label from options, instead of assuming rule.key is perfect
        // We pass rule.key as the "candidate"
        const realLabel = findBestMatch(rule.key, problematiqueOptions);

        if (realLabel && rule.labels.some(l => textLower.includes(l.toLowerCase()))) {
          detected.push({
            type: realLabel, // Use valid label from options
            description: `Détecté via mot-clé ("${rule.labels.find(l => textLower.includes(l.toLowerCase()))}")`,
          });
        }
      });
      return detected;
    };

    const ruleBasedProblematiques = detectCategoriesFromRules(allNotes);
    console.log('[Hybrid AI] Rule based detection:', ruleBasedProblematiques);

    if (!allNotes.trim()) {
      setAnalysisError("Aucune note à analyser. Écrivez d'abord dans les champs ci-dessus.");
      return;
    }

    setIsAnalyzing(true);
    setAnalysisError(null);
    setAnalysisResult(null); // Reset UI

    // Get custom settings
    aiClient.refreshSettings(); // Ensure we have latest from localStorage
    const customPrompt = aiClient.getCustomAnalysisPrompt();
    const analysisTemp = aiClient.getAnalysisTemperature();
    const isAnalysisEnabled = aiClient.isAnalysisEnabled();

    // If AI analysis is disabled, use ONLY rule-based detection
    if (!isAnalysisEnabled) {
      console.log('[AI] Analysis disabled by user. Using rule-based only.');

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
      // Use custom prompt but inject variables
      systemPrompt = customPrompt
        .replace('${validActions}', validActions)
        .replace('${validProblematiques}', validProblematiques);
      console.log('[AI Debug] Using CUSTOM system prompt');
    } else {
      // Default prompt
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
   - Mots-clés : "dettes", "huissier", "saisie", "commandement", "facture impayée", "rappel", "mise en demeure", "plan d'apurement", "médiation de dettes", "RCD", "créancier", "arrêté de saisie", "faillite", "médiation de dettes judiciaire", "médiation de dettes amiable", "Régie Foncière", "recouvrement", "jugement de saisie".

2. [Logement]
   - Mots-clés : "bail", "propriétaire", "loyer", "garantie locative", "préavis", "expulsion", "insalubrité", "humidité", "moisissure", "travaux", "AIS", "logement social", "SLRB", "SISP", "contrat de bail", "Société de logement", "régie de quartier", "bail à loyer modéré", "attestation de résidence", "adresse de référence".

3. [Santé (physique; handicap; autonomie)]
   - Mots-clés : "médecin", "hôpital", "urgence", "mutuelle", "certificat médical", "incapacité", "invalidité", "Vierge Noire", "pension de handicap", "traitement", "pharmacie", "SPF Santé Publique", "aide à domicile", "assistance personnelle", "centre de santé", "maison médicale", "attestation INAMI".

4. [Energie (eau; gaz; électricité)]
   - Mots-clés : "Sibelga", "Engie", "TotalEnergies", "compteur", "index", "coupure", "limiteur", "régularisation", "facture", "eau de Bruxelles", "Vivaqua", "Fonds énergie", "client protégé", "indicateur préventif", "attestation Sibelga", "droit à l'eau", "fournisseur d'énergie", "intervention régionale".

5. [CPAS]
   - Mots-clés : "CPAS", "RIS", "revenu d'intégration", "aide sociale", "carte médicale", "article 60", "article 61", "réquisitoire", "enquête sociale", "aide financière", "aide locative", "aide urgente", "chef de service social", "comité spécial du social", "attestation d'intervention", "dossier CPAS", "avance sur prestations".

6. [Juridique]
   - Mots-clés : "avocat", "pro deo", "aide juridique", "tribunal", "justice de paix", "police", "plainte", "audition", "convocation", "tribunal du travail", "justice de paix d'Anderlecht", "jugement", "officier de police judiciaire", "procès-verbal", "conciliation", "médiateur de quartier", "procédure judiciaire".

7. [Scolarité]
   - Mots-clés : "école", "inscription", "frais scolaires", "cantine", "bulletin", "PMS", "absentéisme", "transport scolaire", "Fédération Wallonie-Bruxelles", "passage de classe", "matériel scolaire", "attestation de fréquentation", "enseignement spécialisé", "échec scolaire".

8. [Fiscalité]
   - Mots-clés : "impôts", "SPF Finances", "taxe", "avertissement-extrait de rôle", "AER", "précompte immobilier", "précompte professionnel", "amendes administratives", "remboursement d'impôt", "déclaration d'impôt", "taxe communale", "taxe régionale", "plan de paiement SPF", "attestation fiscale belge".

9. [ISP] (Insertion Socioprofessionnelle)
   - Mots-clés : "chômage", "ONEM", "CAPAC", "syndicat", "Actiris", "VDAB", "formation", "CV", "recherche emploi", "mission locale", "Bruxelles Formation", "contrat de stage", "insertion", "PIIS", "plan d'action", "jobcoaching", "SINE", "demandeur d'emploi", "attestation ONEM".

INSTRUCTIONS DE SORTIE :
- Extrais les ACTIONS et PROBLÉMATIQUES en te basant sur ces règles.
- Réponds UNIQUEMENT avec un objet JSON valide.
- Si un terme correspond à une règle ci-dessus, tu DOIS cocher la catégorie correspondante.

CONTEXTE OBLIGATOIRE (Ne pas changer) :
VOCABULAIRE AUTORISÉ pour les actions: ${validActions}
VOCABULAIRE AUTORISÉ pour les problématiques: ${validProblematiques}`;
      console.log('[AI Debug] Using DEFAULT system prompt');
    }

    const userPrompt = `Analyse ce texte et extrais les actions et problématiques.
Réponds UNIQUEMENT en JSON avec ce format exact:
{"actions":[{"type":"NomAction","description":"contexte","date":"YYYY-MM-DD"}],"problematiques":[{"type":"NomProbleme","detail":"detail"}]}

TEXTE À ANALYSER:
${allNotes}`;

    try {
      console.log(`[AI Debug] Sending request with temperature=${analysisTemp}...`);
      // Use configured temperature
      const response = await aiClient.complete(userPrompt, systemPrompt, { temperature: analysisTemp });
      console.log('[AI Debug] Response received:', response);

      if (response.error) {
        throw new Error(response.error);
      }

      if (!response.content || response.content.trim() === '') {
        throw new Error("L'IA a renvoyé une réponse vide");
      }

      console.log('[AI Debug] Raw content:', response.content);

      // Parse JSON response - handle common issues
      let jsonStr = response.content
        .replace(/```json\s*/gi, '')
        .replace(/```\s*/g, '')
        .trim();

      // Try to extract JSON object if wrapped in text
      const jsonStartIndex = jsonStr.indexOf('{');
      const jsonEndIndex = jsonStr.lastIndexOf('}');

      if (jsonStartIndex !== -1 && jsonEndIndex !== -1 && jsonEndIndex > jsonStartIndex) {
        jsonStr = jsonStr.substring(jsonStartIndex, jsonEndIndex + 1);
      }

      console.log('[AI Debug] Cleaned JSON:', jsonStr.substring(0, 300));

      // Minimal cleanup - only fix trailing commas
      jsonStr = jsonStr
        .replace(/,\s*}/g, '}')
        .replace(/,\s*]/g, ']');

      // Handle truncated JSON - try to close it properly
      const openBraces = (jsonStr.match(/{/g) || []).length;
      const closeBraces = (jsonStr.match(/}/g) || []).length;
      const openBrackets = (jsonStr.match(/\[/g) || []).length;
      const closeBrackets = (jsonStr.match(/]/g) || []).length;

      if (openBrackets > closeBrackets || openBraces > closeBraces) {
        console.warn('[AI Debug] JSON appears truncated, attempting repair...');
        // Remove last incomplete object if any
        jsonStr = jsonStr.replace(/,\s*{\s*"type"\s*:\s*"[^"]*"\s*,?\s*$/g, '');
        // Close missing brackets
        for (let i = 0; i < openBrackets - closeBrackets; i++) jsonStr += ']';
        // Add missing problematiques if not present
        if (!jsonStr.includes('"problematiques"')) {
          jsonStr = jsonStr.replace(/]\s*$/, '], "problematiques": []');
        }
        // Close missing braces
        for (let i = 0; i < openBraces - closeBraces; i++) jsonStr += '}';
        console.log('[AI Debug] Repaired JSON:', jsonStr.substring(jsonStr.length - 100));
      }

      let parsed: any = {};
      try {
        parsed = JSON.parse(jsonStr);
        console.log('[AI Debug] Parsed successfully:', parsed);

        // Fuzzy match helper to fix AI inconsistencies (e.g. "Aide CPAS" -> "CPAS")
        const findBestMatch = (candidate: string, options: any[]) => {
          if (!candidate) return null;
          const norm = candidate.toString().toLowerCase().trim();

          // 1. Exact match
          const exact = options.find(o => o.label.toLowerCase() === norm);
          if (exact) return exact.label;

          // 2. Contains match
          const partials = options.filter(o => {
            const l = o.label.toLowerCase();
            return norm.includes(l) || l.includes(norm);
          });

          if (partials.length > 0) {
            // Sort by length desc (match "Logement" before "Log")
            partials.sort((a, b) => b.label.length - a.label.length);
            return partials[0].label;
          }
          return null;
        };

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

        // MERGE HYBRID: Add rule-based detections if not present
        ruleBasedProblematiques.forEach(ruleItem => {
          const exists = result.problematiques.find(p => p.type === ruleItem.type);
          if (!exists) {
            result.problematiques.unshift({
              type: ruleItem.type,
              description: ruleItem.description,
              validated: true // Rule based is trusted
            });
          } else {
            // Even if exists from AI, auto-validate it because rule confirms it
            exists.validated = true;
          }
        });

        if (result.problematiques.length === 0 && result.actions.length === 0) {
          setAnalysisError("Aucun élément détecté (ou JSON invalide).");
        } else {
          setAnalysisResult(result);
        }

      } catch (parseError) {
        console.error('JSON Parse Error:', parseError);
        setAnalysisError("Erreur de format de réponse IA. Essayez de simplifier.");
      }

    } catch (e: any) {
      console.error("[AI Debug] Error:", e);
      setAnalysisError(`Erreur : ${e.message || "Vérifiez que l'IA est active."}`);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Toggle validation of a proposed item
  const toggleValidation = (category: 'actions' | 'problematiques', index: number) => {
    if (!analysisResult) return;

    setAnalysisResult(prev => {
      if (!prev) return prev;
      const updated = { ...prev };
      updated[category] = [...prev[category]];
      updated[category][index] = {
        ...updated[category][index],
        validated: !updated[category][index].validated
      };
      return updated;
    });
  };

  // Select all items in a category
  const selectAllItems = (category: 'actions' | 'problematiques') => {
    if (!analysisResult) return;
    setAnalysisResult(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        [category]: prev[category].map(item => ({ ...item, validated: true }))
      };
    });
  };

  // Deselect all items in a category
  const deselectAllItems = (category: 'actions' | 'problematiques') => {
    if (!analysisResult) return;
    setAnalysisResult(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        [category]: prev[category].map(item => ({ ...item, validated: false }))
      };
    });
  };

  // Apply validated items to formData
  const applyValidatedItems = () => {
    if (!analysisResult) return;

    // Get validated actions
    const validatedActions = analysisResult.actions
      .filter(a => a.validated)
      .map(a => ({
        id: `ai-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        type: a.type,
        date: a.date || new Date().toISOString().split('T')[0],
        description: a.description || '',
        partenaire: ''
      } as ActionSuivi));

    // Get validated problematiques
    const validatedProblems = analysisResult.problematiques
      .filter(p => p.validated)
      .map(p => ({
        id: `ai-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        type: p.type,
        description: p.description || '',
        dateSignalement: new Date().toISOString().split('T')[0]
      } as Problematique));

    console.log('[AI Apply] Validated Actions:', validatedActions);
    console.log('[AI Apply] Validated Problematiques:', validatedProblems);

    // Merge with existing
    if (validatedActions.length > 0) {
      const existingActions = formData.actions || [];
      console.log('[AI Apply] Merging Actions with existing:', existingActions.length);
      onInputChange('actions', [...existingActions, ...validatedActions]);
    }

    if (validatedProblems.length > 0) {
      const existingProblems = formData.problematiques || [];
      console.log('[AI Apply] Merging Problematiques with existing:', existingProblems.length);

      // Filter out duplicates (same type)
      const nonDuplicateNewProblems = validatedProblems.filter(newP =>
        !existingProblems.some(existingP => existingP.type === newP.type)
      );

      if (nonDuplicateNewProblems.length < validatedProblems.length) {
        console.log(`[AI Apply] Skipped ${validatedProblems.length - nonDuplicateNewProblems.length} duplicates`);
      }

      const newAll = [...existingProblems, ...nonDuplicateNewProblems];
      console.log('[AI Apply] New Problematiques count:', newAll.length);
      onInputChange('problematiques', newAll);
    }

    // Clear analysis result after applying
    setAnalysisResult(null);
  };

  // Count validated items
  const validatedCount = analysisResult
    ? analysisResult.actions.filter(a => a.validated).length +
    analysisResult.problematiques.filter(p => p.validated).length
    : 0;

  return (
    <div className="space-y-6">
      {/* En-tête avec gradient */}
      <div className="bg-gradient-to-r from-amber-50 to-orange-50 p-4 rounded-lg border border-amber-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-amber-500 rounded-full flex items-center justify-center mr-3">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-amber-900">Notes & Bilan Social</h3>
              <p className="text-sm text-amber-700">Informations complémentaires et observations</p>
            </div>
          </div>

          {/* AI Status Indicator */}
          {isAiAvailable && (
            <div className="flex items-center text-xs text-purple-600 bg-purple-50 px-2 py-1 rounded-full">
              <span className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></span>
              IA Active
            </div>
          )}
        </div>
      </div>

      {/* Section Bilan social */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-200">
        <h4 className="text-md font-semibold text-blue-900 mb-3 flex items-center justify-between">
          <span className="flex items-center">
            <svg className="w-5 h-5 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-1l-4 4z" />
            </svg>
            Bilan social
          </span>

          <div className="flex gap-2">
            {/* CLEANUP BUTTON - Temporary fix for user data */}
            <button
              type="button"
              onClick={() => {
                // 1. Clean Problematiques (Deduplicate)
                const existingProbs = formData.problematiques || [];
                const uniqueProbs = existingProbs.filter((p, index, self) =>
                  index === self.findIndex((t) => (
                    t.type === p.type // Keep first occurrence of each type
                  ))
                );

                // 2. Clean Actions (Fix formats + Deduplicate)
                const existingActions = formData.actions || [];
                const cleanedActions = existingActions.map(a => {
                  // Fix "Rendez-vous2025-..." AND "Email2025-12-07T00..." patterns
                  // Safe type check
                  const typeStr = a.type || '';
                  const isoMatch = typeStr.match(/(\d{4}-\d{2}-\d{2})(T[\d:.]*Z?)?/);

                  if (isoMatch) {
                    const datePart = isoMatch[1]; // Always the YYYY-MM-DD part (ex: 2025-12-07)
                    const fullMatch = isoMatch[0]; // The whole string to remove (ex: 2025-12-07T00...)

                    return {
                      ...a,
                      type: typeStr.replace(fullMatch, '').trim(), // Remove FULL match from title
                      date: datePart // Store as YYYY-MM-DD for the form (HTML date input requirement)
                    };
                  }
                  return a;
                });

                const uniqueActions = cleanedActions.filter((a, index, self) =>
                  index === self.findIndex((t) => (
                    t.type === a.type && t.date === a.date
                  ))
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
              }}
              className="inline-flex items-center px-3 py-1 rounded-lg text-xs font-medium bg-red-100 text-red-700 hover:bg-red-200 transition-colors"
              title="Supprimer les doublons et corriger les dates"
            >
              <ArrowPathIcon className="w-3 h-3 mr-1" />
              Nettoyer
            </button>

            {/* Lisser Button */}
            {isAiAvailable && formData.remarques && formData.remarques.trim() && (
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => handleLisser('remarques')}
                  disabled={disabled || isReformulating}
                  className={`inline-flex items-center px-3 py-1 rounded-lg text-xs font-medium transition-all
                    ${isReformulating && reformulationField === 'remarques'
                      ? 'bg-amber-300 text-white cursor-wait'
                      : 'bg-amber-500 text-white hover:bg-amber-600 shadow-sm'
                    }`}
                >
                  {isReformulating && reformulationField === 'remarques' ? (
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
                {isReformulating && reformulationField === 'remarques' && (
                  <button
                    type="button"
                    onClick={() => {
                      aiClient.abort();
                      setIsReformulating(false);
                      setReformulationError('Reformulation annulée');
                    }}
                    className="inline-flex items-center px-2 py-1 rounded-lg text-xs font-medium bg-red-100 text-red-700 hover:bg-red-200 transition-all"
                  >
                    <XMarkIcon className="w-3 h-3" />
                  </button>
                )}
              </div>
            )}
          </div>
        </h4>
        <FieldWrapper htmlFor="remarques" label="Bilan social">
          <TextAreaInput
            id="remarques"
            value={formData.remarques || ''}
            onChange={(value) => onInputChange('remarques', value)}
            disabled={disabled}
            placeholder="Bilan social de l'usager..."
            rows={4}
          />
        </FieldWrapper>

        {/* Reformulation Preview for Remarques */}
        {reformulatedText && reformulationField === 'remarques' && (
          <div className="mt-4 p-4 bg-amber-50 border border-amber-300 rounded-lg animate-fade-in">
            <h5 className="text-sm font-semibold text-amber-800 mb-2 flex items-center">
              <PencilSquareIcon className="w-4 h-4 mr-2" />
              Proposition de reformulation
            </h5>
            <p className="text-sm text-gray-800 whitespace-pre-wrap bg-white p-3 rounded border border-amber-200">
              {reformulatedText}
            </p>
            <div className="flex justify-end gap-2 mt-3">
              <button
                type="button"
                onClick={rejectReformulation}
                className="px-3 py-1.5 text-sm font-medium text-gray-600 hover:text-gray-800"
              >
                <XMarkIcon className="w-4 h-4 inline mr-1" />
                Rejeter
              </button>
              <button
                type="button"
                onClick={acceptReformulation}
                className="px-3 py-1.5 rounded-lg text-sm font-medium bg-green-600 text-white hover:bg-green-700"
              >
                <CheckIcon className="w-4 h-4 inline mr-1" />
                Accepter
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Section Notes générales */}
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-lg border border-green-200">
        <h4 className="text-md font-semibold text-green-900 mb-3 flex items-center justify-between">
          <span className="flex items-center">
            <svg className="w-5 h-5 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Notes de suivi
          </span>
          {/* Lisser Button */}
          {isAiAvailable && formData.notesGenerales && formData.notesGenerales.trim() && (
            <>
              <button
                type="button"
                onClick={() => handleLisser('notesGenerales')}
                disabled={disabled || isReformulating}
                className={`inline-flex items-center px-3 py-1 rounded-lg text-xs font-medium transition-all
                  ${isReformulating && reformulationField === 'notesGenerales'
                    ? 'bg-emerald-300 text-white cursor-wait'
                    : 'bg-emerald-500 text-white hover:bg-emerald-600 shadow-sm'
                  }`}
              >
                {isReformulating && reformulationField === 'notesGenerales' ? (
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
              {isReformulating && reformulationField === 'notesGenerales' && (
                <button
                  type="button"
                  onClick={() => {
                    aiClient.abort();
                    setIsReformulating(false);
                    setReformulationField(null);
                  }}
                  className="inline-flex items-center px-2 py-1 rounded-lg text-xs font-medium bg-red-100 text-red-700 hover:bg-red-200 transition-all ml-1"
                >
                  <XMarkIcon className="w-3 h-3 mr-1" />
                  Annuler
                </button>
              )}
            </>
          )}
        </h4>
        <FieldWrapper htmlFor="notesGenerales" label="Notes générales">
          <TextAreaInput
            id="notesGenerales"
            value={formData.notesGenerales || ''}
            onChange={(value) => onInputChange('notesGenerales', value)}
            disabled={disabled}
            placeholder="Notes de suivi et observations..."
            rows={4}
          />
        </FieldWrapper>

        {/* Reformulation Preview for Notes Générales */}
        {reformulatedText && reformulationField === 'notesGenerales' && (
          <div className="mt-4 p-4 bg-emerald-50 border border-emerald-300 rounded-lg animate-fade-in">
            <h5 className="text-sm font-semibold text-emerald-800 mb-2 flex items-center">
              <PencilSquareIcon className="w-4 h-4 mr-2" />
              Proposition de reformulation
            </h5>
            <p className="text-sm text-gray-800 whitespace-pre-wrap bg-white p-3 rounded border border-emerald-200">
              {reformulatedText}
            </p>
            <div className="flex justify-end gap-2 mt-3">
              <button
                type="button"
                onClick={rejectReformulation}
                className="px-3 py-1.5 text-sm font-medium text-gray-600 hover:text-gray-800"
              >
                <XMarkIcon className="w-4 h-4 inline mr-1" />
                Rejeter
              </button>
              <button
                type="button"
                onClick={acceptReformulation}
                className="px-3 py-1.5 rounded-lg text-sm font-medium bg-green-600 text-white hover:bg-green-700"
              >
                <CheckIcon className="w-4 h-4 inline mr-1" />
                Accepter
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Section Information importante */}
      <div className="bg-gradient-to-r from-red-50 to-pink-50 p-4 rounded-lg border border-red-200">
        <h4 className="text-md font-semibold text-red-900 mb-3 flex items-center">
          <svg className="w-5 h-5 text-red-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
          Information importante
        </h4>
        <FieldWrapper htmlFor="informationImportante" label="Information importante">
          <TextAreaInput
            id="informationImportante"
            value={formData.informationImportante || ''}
            onChange={(value) => onInputChange('informationImportante', value)}
            disabled={disabled}
            placeholder="Informations importantes à retenir..."
            rows={3}
          />
        </FieldWrapper>
        <p className="text-sm text-red-600 mt-2 italic">
          ⚠️ Cette information sera mise en évidence dans le dossier
        </p>
      </div>

      {/* AI ANALYSIS SECTION */}
      {isAiAvailable && (
        <div className="bg-gradient-to-r from-purple-50 to-indigo-50 p-4 rounded-lg border border-purple-200">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-md font-semibold text-purple-900 flex items-center">
              <SparklesIcon className="w-5 h-5 text-purple-600 mr-2" />
              Extraction IA (optionnel)
            </h4>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleAnalyze}
                disabled={disabled || isAnalyzing}
                className={`inline-flex items-center px-4 py-2 rounded-lg font-medium text-sm transition-all
                  ${isAnalyzing
                    ? 'bg-purple-300 text-white cursor-wait'
                    : 'bg-purple-600 text-white hover:bg-purple-700 shadow-sm'
                  }`}
              >
                {isAnalyzing ? (
                  <>
                    <ArrowPathIcon className="w-4 h-4 mr-2 animate-spin" />
                    Analyse en cours...
                  </>
                ) : (
                  <>
                    <SparklesIcon className="w-4 h-4 mr-2" />
                    Analyser les notes
                  </>
                )}
              </button>
              {isAnalyzing && (
                <button
                  type="button"
                  onClick={() => {
                    aiClient.abort();
                    setIsAnalyzing(false);
                    setAnalysisError('Analyse annulée');
                  }}
                  className="inline-flex items-center px-3 py-2 rounded-lg font-medium text-sm bg-red-100 text-red-700 hover:bg-red-200 transition-all"
                >
                  <XMarkIcon className="w-4 h-4 mr-1" />
                  Annuler
                </button>
              )}
            </div>
          </div>

          <p className="text-sm text-purple-700 mb-4">
            L'IA peut détecter automatiquement les <strong>Actions</strong> et <strong>Problématiques</strong> mentionnées dans vos notes.
            Cliquez sur les éléments détectés pour les valider avant de les ajouter au dossier.
          </p>

          {/* Error Message */}
          {analysisError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm mb-4">
              {analysisError}
            </div>
          )}

          {/* Analysis Results */}
          {analysisResult && (
            <div className="space-y-4 animate-fade-in">
              {/* Problematiques */}
              {analysisResult.problematiques.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h5 className="text-sm font-semibold text-purple-800">
                      Problématiques détectées ({analysisResult.problematiques.filter(p => p.validated).length}/{analysisResult.problematiques.length} sélectionnées)
                    </h5>
                    <button
                      type="button"
                      onClick={() => {
                        const allSelected = analysisResult.problematiques.every(p => p.validated);
                        allSelected ? deselectAllItems('problematiques') : selectAllItems('problematiques');
                      }}
                      className="text-xs px-2 py-1 rounded-md bg-purple-100 text-purple-700 hover:bg-purple-200 transition-colors"
                    >
                      {analysisResult.problematiques.every(p => p.validated) ? '✕ Tout désélectionner' : '✓ Tout sélectionner'}
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {analysisResult.problematiques.map((item, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => toggleValidation('problematiques', index)}
                        className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium transition-all border-2
                          ${item.validated
                            ? 'bg-red-100 text-red-800 border-red-400 ring-2 ring-red-200'
                            : 'bg-white text-gray-700 border-gray-300 hover:border-red-300'
                          }`}
                      >
                        {item.validated ? (
                          <CheckIcon className="w-4 h-4 mr-1 text-red-600" />
                        ) : (
                          <span className="w-4 h-4 mr-1 rounded-full border-2 border-gray-300 inline-block"></span>
                        )}
                        {item.type}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Actions */}
              {analysisResult.actions.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h5 className="text-sm font-semibold text-purple-800">
                      Actions détectées ({analysisResult.actions.filter(a => a.validated).length}/{analysisResult.actions.length} sélectionnées)
                    </h5>
                    <button
                      type="button"
                      onClick={() => {
                        const allSelected = analysisResult.actions.every(a => a.validated);
                        allSelected ? deselectAllItems('actions') : selectAllItems('actions');
                      }}
                      className="text-xs px-2 py-1 rounded-md bg-purple-100 text-purple-700 hover:bg-purple-200 transition-colors"
                    >
                      {analysisResult.actions.every(a => a.validated) ? '✕ Tout désélectionner' : '✓ Tout sélectionner'}
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {analysisResult.actions.map((item, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => toggleValidation('actions', index)}
                        className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium transition-all border-2
                          ${item.validated
                            ? 'bg-blue-100 text-blue-800 border-blue-400 ring-2 ring-blue-200'
                            : 'bg-white text-gray-700 border-gray-300 hover:border-blue-300'
                          }`}
                      >
                        {item.validated ? (
                          <CheckIcon className="w-4 h-4 mr-1 text-blue-600" />
                        ) : (
                          <span className="w-4 h-4 mr-1 rounded-full border-2 border-gray-300 inline-block"></span>
                        )}
                        {item.type}
                        {item.date && !isNaN(new Date(item.date).getTime()) && (
                          <span className="ml-1 text-xs opacity-70">
                            ({new Date(item.date).toLocaleDateString('fr-BE')})
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* SECTION: DONNÉES ENREGISTRÉES (Liste actuelle) */}
              {((formData.problematiques && formData.problematiques.length > 0) || (formData.actions && formData.actions.length > 0)) && (
                <div className="mt-8 pt-6 border-t border-gray-200">
                  <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>
                    Données actuellement enregistrées
                  </h4>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Enregistrés - Problématiques */}
                    {formData.problematiques && formData.problematiques.length > 0 && (
                      <div className="bg-red-50 rounded-lg p-3 border border-red-100">
                        <h6 className="text-xs font-bold text-red-800 uppercase mb-2">Problématiques ({formData.problematiques.length})</h6>
                        <ul className="space-y-1">
                          {formData.problematiques.map((p, idx) => (
                            <li key={idx} className="flex justify-between items-center text-xs bg-white p-2 rounded border border-red-100">
                              <span className="text-gray-800 truncate flex-1 mr-2" title={p.type || ''}>{p.type}</span>
                              <button
                                type="button"
                                onClick={() => {
                                  const newProbs = [...(formData.problematiques || [])];
                                  newProbs.splice(idx, 1);
                                  onInputChange('problematiques', newProbs);
                                }}
                                className="text-red-400 hover:text-red-600 p-1"
                                title="Supprimer"
                              >
                                <TrashIcon className="w-3 h-3" />
                              </button>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Enregistrés - Actions */}
                    {formData.actions && formData.actions.length > 0 && (
                      <div className="bg-blue-50 rounded-lg p-3 border border-blue-100">
                        <h6 className="text-xs font-bold text-blue-800 uppercase mb-2">Actions ({formData.actions.length})</h6>
                        <ul className="space-y-1">
                          {formData.actions.map((a, idx) => (
                            <li key={idx} className="flex justify-between items-center text-xs bg-white p-2 rounded border border-blue-100">
                              <div className="flex-1 min-w-0 mr-2">
                                <div className="font-medium text-gray-800 truncate" title={a.type || ''}>{a.type}</div>
                                {a.date && <div className="text-gray-500 text-[10px]">{new Date(a.date).toLocaleDateString('fr-BE')}</div>}
                              </div>
                              <button
                                type="button"
                                onClick={() => {
                                  const newActions = [...(formData.actions || [])];
                                  newActions.splice(idx, 1);
                                  onInputChange('actions', newActions);
                                }}
                                className="text-red-400 hover:text-red-600 p-1"
                                title="Supprimer"
                              >
                                <TrashIcon className="w-3 h-3" />
                              </button>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* No Results */}
              {analysisResult.actions.length === 0 && analysisResult.problematiques.length === 0 && (
                <p className="text-sm text-gray-500 italic">
                  Aucun élément détecté dans les notes. Essayez d'ajouter plus de détails.
                </p>
              )}

              {/* Apply Button */}
              {(analysisResult.actions.length > 0 || analysisResult.problematiques.length > 0) && (
                <div className="flex justify-end gap-3 pt-2 border-t border-purple-200">
                  <button
                    type="button"
                    onClick={() => setAnalysisResult(null)}
                    className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800"
                  >
                    <XMarkIcon className="w-4 h-4 inline mr-1" />
                    Annuler
                  </button>
                  <button
                    type="button"
                    onClick={applyValidatedItems}
                    disabled={validatedCount === 0}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all
                      ${validatedCount > 0
                        ? 'bg-green-600 text-white hover:bg-green-700'
                        : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                      }`}
                  >
                    <CheckIcon className="w-4 h-4 inline mr-1" />
                    Ajouter {validatedCount} élément{validatedCount > 1 ? 's' : ''} au dossier
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
