/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect - AI Reformulation Hook
*/

import { useState } from 'react';
import { aiClient } from '@/lib/ai-client';
import { REFORMULATION_SYSTEM_PROMPT } from '@/utils/notesAiUtils';

export function useAiReformulation(formData: any, onInputChange: any) {
    const [busy, setBusy] = useState(false);
    const [text, setText] = useState<string | null>(null);
    const [field, setField] = useState<'remarques' | 'notesGenerales' | null>(null);
    const [err, setErr] = useState<string | null>(null);

    const lisser = async (f: 'remarques' | 'notesGenerales') => {
        const t = formData[f];
        if (!t?.trim()) return setErr("Aucun texte");
        setBusy(true); setErr(null); setText(null); setField(f);
        try {
            const res = await aiClient.complete(t, `${REFORMULATION_SYSTEM_PROMPT}\nNOTE:\n${t}\nREFORMULÉ:`, { temperature: 0.4 });
            if (res.error) throw new Error(res.error);
            setText(res.content.replace(/^["'`]+|["'`]+$/g, '').replace(/^(TEXTE REFORMULÉ|Reformulation)\s*:\s*/i, '').trim());
        } catch (e: any) { setErr("Erreur reformulation"); }
        finally { setBusy(false); }
    };

    const accept = () => { if (text && field) { onInputChange(field, text); setText(null); setField(null); } };
    const cancel = () => { setText(null); setField(null); };
    const abort = () => { aiClient.abort(); setBusy(false); setErr('Annulé'); setText(null); setField(null); };

    return { busy, text, field, err, lisser, accept, cancel, abort };
}
