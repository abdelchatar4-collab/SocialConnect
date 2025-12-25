/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect - Options Editor (Detail)
*/

import React, { useState } from 'react';
import { Plus, X, Loader2, Save, Pencil, Trash2, RefreshCw, LayoutList } from 'lucide-react';
import { DropdownOptionAPI, DropdownOptionSetAPI } from '@/services/optionsServiceAPI';

interface OptionsEditorProps {
    set: DropdownOptionSetAPI | null;
    options: DropdownOptionAPI[];
    loading: boolean;
    onAdd: (val: string) => Promise<void>;
    onUpdate: (id: string, val: string) => Promise<void>;
    onDelete: (id: string, label: string) => Promise<void>;
    onReset: () => Promise<void>;
}

export const OptionsEditor: React.FC<OptionsEditorProps> = ({ set, options, loading, onAdd, onUpdate, onDelete, onReset }) => {
    const [isAdding, setIsAdding] = useState(false);
    const [newVal, setNewVal] = useState('');
    const [editing, setEditing] = useState<{ id: string, val: string } | null>(null);

    if (!set) return <div className="md:w-2/3 flex flex-col border border-gray-200 rounded-xl items-center justify-center p-8 text-gray-400"><LayoutList className="w-12 h-12 mb-3 opacity-20" /><p>Sélectionnez une catégorie</p></div>;

    return (
        <div className="md:w-2/3 flex flex-col border border-gray-200 rounded-xl overflow-hidden bg-white shadow-sm">
            <div className="p-4 border-b border-gray-200 flex justify-between bg-gray-50/50">
                <div><h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">{set.name}{set.isSystem && <span className="bg-blue-100 text-blue-700 text-[10px] px-2 py-0.5 rounded-full">SYSTEM</span>}</h3><p className="text-sm text-gray-500">{set.description}</p></div>
                <button onClick={() => setIsAdding(true)} className="btn btn-sm bg-blue-600 text-white hover:bg-blue-700 px-3 py-1.5 rounded-lg text-sm flex items-center gap-2"><Plus className="w-4 h-4" />Ajouter</button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 bg-gray-50/30">
                {loading && options.length === 0 ? <div className="flex justify-center p-8"><Loader2 className="animate-spin text-blue-500" /></div> : (
                    <div className="space-y-4">
                        {isAdding && <div className="p-3 bg-white rounded-lg border border-blue-200 flex gap-2"><input type="text" value={newVal} onChange={e => setNewVal(e.target.value)} className="flex-1 px-3 py-2 border rounded text-sm" placeholder="Nouvelle option..." onKeyPress={e => e.key === 'Enter' && onAdd(newVal).then(() => { setIsAdding(false); setNewVal(''); })} /><button onClick={() => onAdd(newVal).then(() => { setIsAdding(false); setNewVal(''); })} className="p-2 bg-blue-600 text-white rounded"><Plus className="w-4 h-4" /></button><button onClick={() => setIsAdding(false)} className="p-2 text-gray-500"><X className="w-4 h-4" /></button></div>}
                        <div className="bg-white rounded-lg border divide-y shadow-sm">
                            {options.length === 0 ? <div className="p-8 text-center text-gray-400 italic">Vide</div> : options.map(o => (
                                <div key={o.id} className="p-3 flex items-center justify-between group">
                                    {editing?.id === o.id ? <div className="flex-1 flex gap-2"><input type="text" value={editing.val} onChange={e => setEditing({ ...editing, val: e.target.value })} className="flex-1 px-2 py-1 border rounded text-sm" onKeyPress={e => e.key === 'Enter' && onUpdate(o.id, editing.val).then(() => setEditing(null))} /><button onClick={() => onUpdate(o.id, editing.val).then(() => setEditing(null))} className="text-green-600"><Save className="w-4 h-4" /></button><button onClick={() => setEditing(null)}><X className="w-4 h-4" /></button></div> : <>
                                        <span className="text-sm font-medium ml-2">{o.label}</span>
                                        <div className="flex gap-1 opacity-0 group-hover:opacity-100"><button onClick={() => setEditing({ id: o.id, val: o.label })} className="p-1.5 text-gray-400 hover:text-blue-600"><Pencil className="w-3.5 h-3.5" /></button><button onClick={() => onDelete(o.id, o.label)} className="p-1.5 text-gray-400 hover:text-red-600"><Trash2 className="w-3.5 h-3.5" /></button></div>
                                    </>}
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
            <div className="p-3 bg-gray-50 border-t flex justify-end"><button onClick={onReset} className="text-xs text-red-500 flex items-center gap-1"><RefreshCw className="w-3 h-3" />Réinitialiser</button></div>
        </div>
    );
};
