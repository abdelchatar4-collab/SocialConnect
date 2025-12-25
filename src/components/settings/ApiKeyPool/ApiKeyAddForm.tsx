/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect - API Key Add Form
*/

import React, { useState } from 'react';
import { PlusIcon, ArrowPathIcon } from '@heroicons/react/24/outline';

export const ApiKeyAddForm: React.FC<{ onAdd: (key: string, label: string) => Promise<void>; onCancel: () => void }> = ({ onAdd, onCancel }) => {
    const [k, setK] = useState(''), [l, setL] = useState(''), [err, setErr] = useState(''), [busy, setBusy] = useState(false);
    const submit = async () => {
        if (!k || !l) return setErr('Remplissez tout');
        setBusy(true); setErr('');
        try { await onAdd(k, l); setK(''); setL(''); } catch (e: any) { setErr(e.message); } finally { setBusy(false); }
    };
    return (
        <div className="bg-green-50 p-4 rounded-lg border border-green-200 space-y-3">
            <h5 className="font-medium text-green-800">Ajouter une clé API</h5>
            <input type="text" value={l} onChange={e => setL(e.target.value)} placeholder="Nom du collègue" className="w-full px-3 py-2 border rounded-lg text-sm" />
            <input type="password" value={k} onChange={e => setK(e.target.value)} placeholder="gsk_..." className="w-full px-3 py-2 border rounded-lg text-sm font-mono" />
            {err && <p className="text-xs text-red-600">{err}</p>}
            <div className="flex gap-2">
                <button onClick={submit} disabled={busy} className="flex-1 flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-lg disabled:opacity-50">
                    {busy ? <ArrowPathIcon className="w-4 h-4 animate-spin mr-2" /> : <PlusIcon className="w-4 h-4 mr-2" />}Ajouter
                </button>
                <button onClick={onCancel} className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg">Annuler</button>
            </div>
        </div>
    );
};
