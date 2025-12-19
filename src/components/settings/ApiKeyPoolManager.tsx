/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect est un logiciel libre : vous pouvez le redistribuer et/ou le modifier selon les termes de la Licence Publique Générale GNU telle que publiée par la Free Software Foundation, soit la version 3 de la licence, soit (à votre convenance) toute version ultérieure.

Ce programme est distribué dans l'espoir qu'il sera utile, mais SANS AUCUNE GARANTIE ; sans même la garantie implicite de COMMERCIALISATION ou d'ADÉQUATION À UN USAGE PARTICULIER. Voir la Licence Publique Générale GNU pour plus de détails.
*/

'use client';

import React, { useState, useEffect } from 'react';
import {
    KeyIcon,
    PlusIcon,
    TrashIcon,
    CheckCircleIcon,
    ExclamationTriangleIcon,
    UserGroupIcon,
    ArrowPathIcon
} from '@heroicons/react/24/outline';
import {
    getKeyPool,
    addKeyToPool,
    removeKeyFromPool,
    getKeyPoolStats,
    GroqApiKey,
    KeyPoolStats
} from '@/lib/groq-key-pool';

interface ApiKeyPoolManagerProps {
    onPoolChange?: () => void;
}

export default function ApiKeyPoolManager({ onPoolChange }: ApiKeyPoolManagerProps) {
    const [keys, setKeys] = useState<GroqApiKey[]>([]);
    const [stats, setStats] = useState<KeyPoolStats | null>(null);
    const [newKeyValue, setNewKeyValue] = useState('');
    const [newKeyLabel, setNewKeyLabel] = useState('');
    const [isAdding, setIsAdding] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showAddForm, setShowAddForm] = useState(false);

    // Load keys on mount
    const refreshKeys = () => {
        const pool = getKeyPool();
        setKeys(pool);
        setStats(getKeyPoolStats());
    };

    useEffect(() => {
        refreshKeys();
    }, []);

    // Add new key
    const handleAddKey = () => {
        if (!newKeyValue || !newKeyLabel) {
            setError('Remplissez la clé API et le nom');
            return;
        }

        if (!newKeyValue.startsWith('gsk_')) {
            setError('La clé API Groq doit commencer par "gsk_"');
            return;
        }

        setIsAdding(true);
        setError(null);

        const result = addKeyToPool(newKeyValue, newKeyLabel);

        if (result) {
            setNewKeyValue('');
            setNewKeyLabel('');
            setShowAddForm(false);
            refreshKeys();
            onPoolChange?.();
        } else {
            setError('Cette clé existe déjà dans le pool');
        }

        setIsAdding(false);
    };

    // Remove key
    const handleRemoveKey = (keyId: string) => {
        if (confirm('Êtes-vous sûr de vouloir supprimer cette clé ?')) {
            removeKeyFromPool(keyId);
            refreshKeys();
            onPoolChange?.();
        }
    };

    // Mask API key for display
    const maskKey = (key: string) => {
        if (key.length < 12) return '****';
        return key.substring(0, 8) + '...' + key.substring(key.length - 4);
    };

    return (
        <div className="bg-white p-4 rounded-lg border border-gray-200">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                    <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg flex items-center justify-center mr-3">
                        <KeyIcon className="w-4 h-4 text-white" />
                    </div>
                    <div>
                        <h4 className="font-semibold text-gray-900">Pool de Clés API</h4>
                        <p className="text-xs text-gray-500">Gestion des clés Groq partagées</p>
                    </div>
                </div>
                <button
                    onClick={refreshKeys}
                    className="p-2 text-gray-400 hover:text-gray-600"
                    title="Rafraîchir"
                >
                    <ArrowPathIcon className="w-4 h-4" />
                </button>
            </div>

            {/* Stats */}
            {stats && (
                <div className="grid grid-cols-3 gap-2 mb-4">
                    <div className="bg-gray-50 p-2 rounded text-center">
                        <p className="text-lg font-bold text-gray-900">{stats.totalKeys}</p>
                        <p className="text-xs text-gray-500">Clés</p>
                    </div>
                    <div className="bg-green-50 p-2 rounded text-center">
                        <p className="text-lg font-bold text-green-700">{stats.activeKeys}</p>
                        <p className="text-xs text-green-600">Actives</p>
                    </div>
                    <div className="bg-amber-50 p-2 rounded text-center">
                        <p className="text-lg font-bold text-amber-700">{stats.totalRequestsToday}</p>
                        <p className="text-xs text-amber-600">Requêtes/jour</p>
                    </div>
                </div>
            )}

            {/* Key List */}
            <div className="space-y-2 mb-4">
                {keys.length === 0 ? (
                    <div className="text-center py-6 bg-gray-50 rounded-lg">
                        <UserGroupIcon className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                        <p className="text-sm text-gray-500">Aucune clé dans le pool</p>
                        <p className="text-xs text-gray-400">Ajoutez des clés API de vos collègues</p>
                    </div>
                ) : (
                    keys.map((key) => (
                        <div
                            key={key.id}
                            className={`flex items-center justify-between p-3 rounded-lg border ${key.isRateLimited
                                    ? 'bg-amber-50 border-amber-200'
                                    : 'bg-gray-50 border-gray-200'
                                }`}
                        >
                            <div className="flex items-center">
                                {key.isRateLimited ? (
                                    <ExclamationTriangleIcon className="w-5 h-5 text-amber-500 mr-2" />
                                ) : (
                                    <CheckCircleIcon className="w-5 h-5 text-green-500 mr-2" />
                                )}
                                <div>
                                    <p className="font-medium text-gray-900">{key.label}</p>
                                    <p className="text-xs text-gray-500 font-mono">{maskKey(key.key)}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="text-right">
                                    <p className="text-sm font-medium text-gray-700">{key.requestsToday}</p>
                                    <p className="text-xs text-gray-400">req/jour</p>
                                </div>
                                <button
                                    onClick={() => handleRemoveKey(key.id)}
                                    className="p-1.5 text-gray-400 hover:text-red-500 transition-colors"
                                    title="Supprimer"
                                >
                                    <TrashIcon className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Add Key Form */}
            {showAddForm ? (
                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                    <h5 className="font-medium text-green-800 mb-3">Ajouter une clé API</h5>

                    <div className="space-y-3">
                        <div>
                            <label className="text-xs text-gray-600 mb-1 block">Nom du collègue</label>
                            <input
                                type="text"
                                value={newKeyLabel}
                                onChange={(e) => setNewKeyLabel(e.target.value)}
                                placeholder="Ex: Pauline, Ahmed, Marie..."
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500"
                            />
                        </div>
                        <div>
                            <label className="text-xs text-gray-600 mb-1 block">Clé API Groq</label>
                            <input
                                type="password"
                                value={newKeyValue}
                                onChange={(e) => setNewKeyValue(e.target.value)}
                                placeholder="gsk_..."
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono focus:ring-2 focus:ring-green-500"
                            />
                        </div>

                        {error && (
                            <p className="text-xs text-red-600">{error}</p>
                        )}

                        <div className="flex gap-2">
                            <button
                                onClick={handleAddKey}
                                disabled={isAdding}
                                className="flex-1 flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                            >
                                {isAdding ? (
                                    <ArrowPathIcon className="w-4 h-4 animate-spin mr-2" />
                                ) : (
                                    <PlusIcon className="w-4 h-4 mr-2" />
                                )}
                                Ajouter
                            </button>
                            <button
                                onClick={() => {
                                    setShowAddForm(false);
                                    setError(null);
                                    setNewKeyValue('');
                                    setNewKeyLabel('');
                                }}
                                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                            >
                                Annuler
                            </button>
                        </div>
                    </div>
                </div>
            ) : (
                <button
                    onClick={() => setShowAddForm(true)}
                    className="w-full flex items-center justify-center px-4 py-2 border-2 border-dashed border-green-300 text-green-600 rounded-lg hover:bg-green-50 transition-colors"
                >
                    <PlusIcon className="w-4 h-4 mr-2" />
                    Ajouter une clé API
                </button>
            )}

            {/* Info */}
            <div className="mt-4 pt-3 border-t border-gray-200">
                <p className="text-xs text-gray-500">
                    💡 Chaque clé Groq offre 1000 requêtes/jour gratuites.
                    L'app bascule automatiquement sur la clé suivante si une limite est atteinte.
                </p>
            </div>
        </div>
    );
}
