/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect - AI Analysis Hook
*/

import { useState, useMemo } from 'react';
import { aiClient } from '@/lib/ai-client';
import { useDropdownOptionsAPI } from '@/hooks/useDropdownOptionsAPI';
import { DROPDOWN_CATEGORIES } from '@/constants/dropdownCategories';
import { AnalysisResult } from '@/types/notes-ai';
import { AiProvider } from '@/lib/ai/ai-types';
import { getAnalysisSystemPrompt, ANALYSIS_USER_PROMPT, findBestMatch, detectCategoriesFromRules } from '@/utils/notesAiUtils';

export function useAiAnalysis(formData: any, onInputChange: any) {
    const [busy, setBusy] = useState(false);
    const [result, setResult] = useState<AnalysisResult | null>(null);
    const [err, setErr] = useState<string | null>(null);

    const { options: actOpt } = useDropdownOptionsAPI(DROPDOWN_CATEGORIES.ACTIONS);
    const { options: probOpt } = useDropdownOptionsAPI(DROPDOWN_CATEGORIES.PROBLEMATIQUES);
    const vActs = useMemo(() => actOpt.map(o => o.label).join(', '), [actOpt]);
    const vProbs = useMemo(() => probOpt.map(o => o.label).join(', '), [probOpt]);

    const analyze = async (forceProvider?: AiProvider) => {
        const t = [formData.remarques, formData.notesGenerales, formData.informationImportante].filter(Boolean).join('\n\n');
        if (!t.trim()) return setErr("Aucune note");
        const rulesProbs = detectCategoriesFromRules(t, probOpt);
        setBusy(true); setErr(null); setResult(null); aiClient.refreshSettings();
        if (!aiClient.isAnalysisEnabled()) {
            setResult({ actions: [], problematiques: rulesProbs.map(p => ({ type: p.type, description: p.description, validated: true })) });
            setBusy(false); return;
        }
        try {
            const res = await aiClient.complete(`${ANALYSIS_USER_PROMPT}\n${t}`, getAnalysisSystemPrompt(vActs, vProbs), { temperature: aiClient.getAnalysisTemperature(), forceProvider });
            if (res.error) throw new Error(res.error);
            const parsed = JSON.parse(res.content.substring(res.content.indexOf('{'), res.content.lastIndexOf('}') + 1));
            const fin: AnalysisResult = {
                problematiques: (parsed.problematiques || []).map((p: any) => ({ type: findBestMatch(p.type, probOpt) || p.type, description: p.description || '', validated: !!findBestMatch(p.type, probOpt) })),
                actions: (parsed.actions || []).map((a: any) => ({ type: findBestMatch(a.type, actOpt) || a.type, description: a.description || '', date: a.date || new Date().toISOString().split('T')[0], validated: false }))
            };
            rulesProbs.forEach(r => { if (!fin.problematiques.find(p => p.type === r.type)) fin.problematiques.unshift({ ...r, validated: true }); else fin.problematiques.find(p => p.type === r.type)!.validated = true; });
            setResult(fin);
        } catch (e: any) { setErr(`Erreur: ${e.message}`); } finally { setBusy(false); }
    };

    const apply = () => {
        if (!result) return;
        const vA = result.actions.filter(a => a.validated).map(a => ({ id: `ai-${Date.now()}-${Math.random()}`, type: a.type, date: a.date, description: a.description, partenaire: '' }));
        const vP = result.problematiques.filter(p => p.validated).map(p => ({ id: `ai-${Date.now()}-${Math.random()}`, type: p.type, description: p.description, dateSignalement: new Date().toISOString().split('T')[0] }));
        if (vA.length) onInputChange('actions', [...(formData.actions || []), ...vA]);
        if (vP.length) onInputChange('problematiques', [...(formData.problematiques || []), ...vP.filter(p => !(formData.problematiques || []).some((e: any) => e.type === p.type))]);
        setResult(null);
    };

    return { busy, result, err, analyze, apply, abort: () => { aiClient.abort(); setBusy(false); setErr('Annulé'); }, setResult };
}
