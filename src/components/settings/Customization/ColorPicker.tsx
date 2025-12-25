/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect - Color Picker Component
*/

import React from 'react';
import { Palette, Check, RotateCcw } from 'lucide-react';
import { PRESET_COLORS } from './customizationConstants';

export const ColorPicker: React.FC<{ color: string; onChange: (c: string) => void }> = ({ color, onChange }) => (
    <div className="settings-card">
        <div className="settings-card-header">
            <div className="settings-card-icon settings-card-icon--purple"><Palette className="w-4 h-4" /></div>
            <div>
                <h3 className="settings-card-title">Couleur principale</h3>
                <p className="settings-card-subtitle">Identité visuelle</p>
            </div>
        </div>
        <div className="settings-card-body">
            <div className="grid grid-cols-6 md:grid-cols-12 gap-2 mb-4">
                {PRESET_COLORS.map(p => (
                    <button key={p.color} onClick={() => onChange(p.color)} className={`aspect-square rounded-lg transition-all relative ${color === p.color ? 'ring-2 ring-offset-2 ring-cyan-500 scale-110' : 'hover:scale-105'}`} style={{ backgroundColor: p.color }} title={p.name}>
                        {color === p.color && <Check className="w-4 h-4 text-white absolute inset-0 m-auto drop-shadow" />}
                    </button>
                ))}
            </div>
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <input type="color" value={color} onChange={e => onChange(e.target.value)} className="h-10 w-14 rounded border-2 border-gray-200 cursor-pointer" />
                <input type="text" value={color} onChange={e => onChange(e.target.value)} className="flex-1 px-3 py-2 border rounded-lg font-mono text-sm" />
                <button onClick={() => onChange('#0891b2')} className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg"><RotateCcw className="w-4 h-4" /></button>
            </div>
        </div>
    </div>
);
