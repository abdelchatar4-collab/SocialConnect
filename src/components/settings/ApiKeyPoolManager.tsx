/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect est un logiciel libre : vous pouvez le redistribuer et/ou le modifier selon les termes de la Licence Publique Générale GNU telle que publiée par la Free Software Foundation, soit la version 3 de la licence, soit (à votre convenance) toute version ultérieure.
*/

'use client';

import React, { useState } from 'react';
import { KeyIcon, PlusIcon, UserGroupIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import { useApiKeyPool } from './ApiKeyPool/useApiKeyPool';
import { ApiKeyItem } from './ApiKeyPool/ApiKeyItem';
import { ApiKeyAddForm } from './ApiKeyPool/ApiKeyAddForm';

export default function ApiKeyPoolManager({ onPoolChange }: { onPoolChange?: () => void }) {
    const { keys, stats, add, remove, refresh } = useApiKeyPool(onPoolChange);
    const [showAdd, setShowAdd] = useState(false);

    return (
        <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                    <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg flex items-center justify-center mr-3"><KeyIcon className="w-4 h-4 text-white" /></div>
                    <div><h4 className="font-semibold text-gray-900">Pool de Clés API</h4><p className="text-xs text-gray-500">Gestion des clés Groq partagées</p></div>
                </div>
                <button onClick={refresh} className="p-2 text-gray-400 hover:text-gray-600"><ArrowPathIcon className="w-4 h-4" /></button>
            </div>

            {stats && (
                <div className="grid grid-cols-3 gap-2 mb-4">
                    <div className="bg-gray-50 p-2 rounded text-center"><p className="text-lg font-bold text-gray-900">{stats.totalKeys}</p><p className="text-xs text-gray-500">Clés</p></div>
                    <div className="bg-green-50 p-2 rounded text-center"><p className="text-lg font-bold text-green-700">{stats.activeKeys}</p><p className="text-xs text-green-600">Actives</p></div>
                    <div className="bg-amber-50 p-2 rounded text-center"><p className="text-lg font-bold text-amber-700">{stats.totalRequestsToday}</p><p className="text-xs text-amber-600">Req/jour</p></div>
                </div>
            )}

            <div className="space-y-2 mb-4">
                {keys.length === 0 ? (
                    <div className="text-center py-6 bg-gray-50 rounded-lg"><UserGroupIcon className="w-8 h-8 text-gray-300 mx-auto mb-2" /><p className="text-sm text-gray-500">Aucune clé</p></div>
                ) : keys.map(k => <ApiKeyItem key={k.id} apiKey={k} onRemove={remove} />)}
            </div>

            {showAdd ? <ApiKeyAddForm onAdd={add} onCancel={() => setShowAdd(false)} /> : (
                <button onClick={() => setShowAdd(true)} className="w-full flex items-center justify-center px-4 py-2 border-2 border-dashed border-green-300 text-green-600 rounded-lg hover:bg-green-50"><PlusIcon className="w-4 h-4 mr-2" />Ajouter une clé</button>
            )}
            <p className="mt-4 pt-3 border-t text-xs text-gray-500">💡 1000 requêtes gratuites/jour par clé. Basculement automatique.</p>
        </div>
    );
}
