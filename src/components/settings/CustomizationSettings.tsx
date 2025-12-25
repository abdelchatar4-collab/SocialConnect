/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect est un logiciel libre : vous pouvez le redistribuer et/ou le modifier selon les termes de la Licence Publique Générale GNU telle que publiée par la Free Software Foundation, soit la version 3 de la licence, soit (à votre convenance) toute version ultérieure.
*/

'use client';

import { useState } from 'react';
import { useAdmin } from '@/contexts/AdminContext';
import { Type, Eye, ClipboardCheck, RotateCcw, Save, Loader2, Plus, X } from 'lucide-react';
import { ColorPicker } from './Customization/ColorPicker';
import { FIELDS_BY_SECTION } from './Customization/customizationConstants';

export default function CustomizationSettings() {
    const { primaryColor, setPrimaryColor, headerSubtitle, setHeaderSubtitle, showCommunalLogo, setShowCommunalLogo, requiredFields, setRequiredFields, availableYears, setAvailableYears, saveSettings } = useAdmin();
    const [busy, setBusy] = useState(false);
    const [msg, setMsg] = useState('');

    const save = async () => {
        setBusy(true); setMsg('');
        try { await saveSettings(); setMsg('✓ Succès'); setTimeout(() => setMsg(''), 3000); }
        catch { setMsg('✗ Erreur'); setTimeout(() => setMsg(''), 3000); }
        finally { setBusy(false); }
    };

    return (
        <div className="space-y-6">
            <ColorPicker color={primaryColor} onChange={setPrimaryColor} />

            <div className="settings-card">
                <div className="settings-card-header"><div className="settings-card-icon settings-card-icon--blue"><Type className="w-4 h-4" /></div><div><h3 className="settings-card-title">En-tête</h3><p className="settings-card-subtitle">Texte</p></div></div>
                <div className="settings-card-body"><label className="settings-label">Sous-titre</label><input type="text" value={headerSubtitle} onChange={e => setHeaderSubtitle(e.target.value)} className="settings-input" /></div>
            </div>

            <div className="settings-card">
                <div className="settings-card-header"><div className="settings-card-icon settings-card-icon--green"><Eye className="w-4 h-4" /></div><div><h3 className="settings-card-title">Affichage</h3><p className="settings-card-subtitle">Options</p></div></div>
                <div className="settings-card-body"><label className="flex items-center gap-3 cursor-pointer p-3 hover:bg-gray-50 rounded-lg"><input type="checkbox" checked={showCommunalLogo} onChange={e => setShowCommunalLogo(e.target.checked)} className="w-5 h-5 text-cyan-600" /><span className="font-medium">Logo communal</span></label></div>
            </div>

            <div className="settings-card">
                <div className="settings-card-header"><div className="settings-card-icon settings-card-icon--purple"><RotateCcw className="w-4 h-4" /></div><div><h3 className="settings-card-title">Période d'exercice</h3><p className="settings-card-subtitle">Années</p></div></div>
                <div className="settings-card-body">
                    <div className="flex flex-wrap gap-2 mb-4">
                        {availableYears.map(y => <div key={y} className="flex items-center gap-2 bg-purple-50 text-purple-700 px-3 py-1.5 rounded-full border"><span>{y}</span><button onClick={() => setAvailableYears(availableYears.filter(a => a !== y))}><X className="w-3.5 h-3.5" /></button></div>)}
                        <button onClick={() => setAvailableYears([...availableYears, Math.max(...availableYears) + 1].sort())} className="px-3 py-1.5 rounded-full border border-dashed border-purple-300 text-purple-600"><Plus className="w-4 h-4" /></button>
                    </div>
                </div>
            </div>

            <div className="settings-card">
                <div className="settings-card-header"><div className="settings-card-icon settings-card-icon--amber"><ClipboardCheck className="w-4 h-4" /></div><div><h3 className="settings-card-title">Champs obligatoires</h3><p className="settings-card-subtitle">{requiredFields.length} sélectionnés</p></div></div>
                <div className="settings-card-body grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {FIELDS_BY_SECTION.map(s => (
                        <div key={s.section} className="bg-gray-50 rounded-lg p-3">
                            <h4 className="text-xs font-bold text-gray-600 uppercase mb-2">{s.icon} {s.section}</h4>
                            {s.fields.map(f => (
                                <label key={f.id} className="flex items-center gap-2 cursor-pointer p-1 rounded hover:bg-white"><input type="checkbox" checked={requiredFields.includes(f.id)} onChange={() => setRequiredFields(requiredFields.includes(f.id) ? requiredFields.filter(x => x !== f.id) : [...requiredFields, f.id])} className="w-4 h-4" /><span className="text-sm">{f.label}</span></label>
                            ))}
                        </div>
                    ))}
                </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t sticky bottom-0 bg-white py-4 -mx-6 px-6">
                {msg && <span className={`text-sm font-medium ${msg.startsWith('✓') ? 'text-green-600' : 'text-red-600'}`}>{msg}</span>}
                <button onClick={save} disabled={busy} className="settings-btn settings-btn--primary">{busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}{busy ? 'Sauvegarde...' : 'Enregistrer'}</button>
            </div>
        </div>
    );
}
