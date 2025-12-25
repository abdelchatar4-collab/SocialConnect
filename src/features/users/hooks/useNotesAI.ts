/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect est un logiciel libre : vous pouvez le redistribuer et/ou le modifier selon les termes de la Licence Publique Générale GNU telle que publiée par la Free Software Foundation, soit la version 3 de la licence, soit (à votre convenance) toute version ultérieure.
*/

import { useState, useEffect } from 'react';
import { aiClient } from '@/lib/ai-client';
import { UseNotesAIProps } from '@/types/notes-ai';
import { useAiReformulation } from './notes-ai/useAiReformulation';
import { useAiAnalysis } from './notes-ai/useAiAnalysis';

export const useNotesAI = ({ formData, onInputChange }: UseNotesAIProps) => {
    const [isAiAvailable, setIsAiAvailable] = useState(false);
    useEffect(() => { aiClient.checkAvailability().then(setIsAiAvailable); }, []);

    const { busy: isRefor, text: reforT, field: reforF, err: reforE, lisser, accept: acceptR, cancel: rejectR, abort: abortR } = useAiReformulation(formData, onInputChange);
    const { busy: isAnaly, result: analyR, err: analyE, analyze, apply: applyV, abort: abortA, setResult } = useAiAnalysis(formData, onInputChange);

    const handleCleanData = () => {
        const p = formData.problematiques || [], a = formData.actions || [];
        const uP = p.filter((x, i, s) => i === s.findIndex(t => t.type === x.type));
        const cA = a.map(x => {
            const m = x.type?.match(/(\d{4}-\d{2}-\d{2})(T[\d:.]*Z?)?/);
            return (m && x.type) ? { ...x, type: x.type.replace(m[0], '').trim(), date: m[1] } : x;
        });
        const uA = cA.filter((x, i, s) => i === s.findIndex(t => t.type === x.type && t.date === x.date));
        if ((p.length !== uP.length || a.length !== uA.length) && confirm("Nettoyer les doublons ?")) {
            onInputChange('problematiques', uP); onInputChange('actions', uA);
        }
    };

    return {
        isAiAvailable, isAnalyzing: isAnaly, analysisResult: analyR, analysisError: analyE,
        isReformulating: isRefor, reformulatedText: reforT, reformulationField: reforF, reformulationError: reforE,
        handleLisser: lisser, acceptReformulation: acceptR, rejectReformulation: rejectR, abortReformulation: abortR,
        handleAnalyze: analyze, abortAnalysis: abortA, applyValidatedItems: applyV, handleCleanData, setAnalysisResult: setResult,
        toggleValidation: (cat: 'actions' | 'problematiques', idx: number) => setResult(prev => {
            if (!prev) return null;
            const upd = { ...prev, [cat]: [...prev[cat]] };
            upd[cat][idx] = { ...upd[cat][idx], validated: !upd[cat][idx].validated }; return upd;
        }),
        selectAllItems: (cat: 'actions' | 'problematiques') => setResult(prev => prev ? { ...prev, [cat]: prev[cat].map(i => ({ ...i, validated: true })) } : null),
        deselectAllItems: (cat: 'actions' | 'problematiques') => setResult(prev => prev ? { ...prev, [cat]: prev[cat].map(i => ({ ...i, validated: false })) } : null)
    };
};
