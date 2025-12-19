/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect est un logiciel libre : vous pouvez le redistribuer et/ou le modifier selon les termes de la Licence Publique Générale GNU telle que publiée par la Free Software Foundation, soit la version 3 de la licence, soit (à votre convenance) toute version ultérieure.

Ce programme est distribué dans l'espoir qu'il sera utile, mais SANS AUCUNE GARANTIE ; sans même la garantie implicite de COMMERCIALISATION ou d'ADÉQUATION À UN USAGE PARTICULIER. Voir la Licence Publique Générale GNU pour plus de détails.
*/

'use client';

import React, { useState, useEffect } from 'react';
import { SparklesIcon, ServerIcon, CpuChipIcon, AdjustmentsHorizontalIcon, CheckCircleIcon, XCircleIcon, ArrowPathIcon, CloudIcon, KeyIcon } from '@heroicons/react/24/outline';
import { GROQ_MODELS, DEFAULT_GROQ_MODEL } from '@/lib/ai-client';
import ApiKeyPoolManager from './ApiKeyPoolManager';

// Constants for localStorage keys
const AI_SETTINGS_KEY = 'ai_settings';

// Provider type
type AiProvider = 'ollama' | 'groq';

// Default settings
const DEFAULT_SETTINGS = {
    provider: 'ollama' as AiProvider,
    endpoint: 'http://192.168.2.147:11434',
    model: 'qwen2.5:3b',
    temperature: 0.7,
    enabled: true,
    groqApiKey: '',
    groqModel: DEFAULT_GROQ_MODEL,
    useKeyPool: false,
    customAnalysisPrompt: '',
    analysisTemperature: 0,
    enableAnalysis: true,
};

// Default system prompt for reference and reset
// Default system prompt with semantic rules
const DEFAULT_SYSTEM_PROMPT = `Tu es un assistant social expert en Belgique. Ta mission est de structurer les notes de suivi.

ANALYSE SÉMANTIQUE ET RÈGLES DE CLASSEMENT :

1. [Endettement/Surendettement]
   - Mots-clés : "dettes", "huissier", "saisie", "commandement", "facture impayée", "rappel", "mise en demeure", "plan d'apurement", "médiation", "RCD", "créancier".

2. [Logement]
   - Mots-clés : "bail", "propriétaire", "loyer", "garantie locative", "préavis", "expulsion", "insalubrité", "humidité", "moisissure", "travaux", "AIS".

3. [Santé (physique; handicap; autonomie)]
   - Mots-clés : "médecin", "hôpital", "urgence", "mutuelle", "certificat", "incapacité", "invalidité", "vierge noire", "pension handicap", "traitement", "pharmacie".

4. [Energie (eau;gaz;électricité)]
   - Mots-clés : "Sibelga", "Engie", "TotalEnergies", "compteur", "index", "coupure", "limiteur", "régularisation", "facture".

5. [CPAS]
   - Mots-clés : "CPAS", "RIS", "revenu d'intégration", "aide sociale", "carte médicale", "article 60", "réquisitoire", "enquête sociale".

6. [Juridique]
   - Mots-clés : "avocat", "pro deo", "aide juridique", "tribunal", "justice de paix", "police", "plainte", "audition", "convocation".

7. [Scolarité]
   - Mots-clés : "école", "inscription", "frais scolaires", "cantine", "bulletin", "PMS", "absentéisme".

8. [Fiscalité]
   - Mots-clés : "impôts", "SPF Finances", "taxe", "avertissement-extrait de rôle", "précompte".

9. [ISP] (Insertion Socioprofessionnelle)
   - Mots-clés : "chômage", "ONEM", "CAPAC", "syndicat", "Actiris", "VDAB", "formation", "CV", "recherche emploi".

INSTRUCTIONS DE SORTIE :
- Extrais les ACTIONS et PROBLÉMATIQUES en te basant sur ces règles.
- Réponds UNIQUEMENT avec un objet JSON valide.
- Si un terme correspond à une règle ci-dessus, tu DOIS cocher la catégorie correspondante.

CONTEXTE OBLIGATOIRE (Ne pas changer) :
VOCABULAIRE AUTORISÉ pour les actions: \${validActions}
VOCABULAIRE AUTORISÉ pour les problématiques: \${validProblematiques}`;

// Available models for quick selection (Ollama)
const AVAILABLE_MODELS = [
    { value: 'qwen2.5:0.5b', label: 'Qwen2.5 0.5B (Ultra rapide)', ram: '~1 Go' },
    { value: 'qwen2.5:1.5b', label: 'Qwen2.5 1.5B (Rapide)', ram: '~2-3 Go' },
    { value: 'qwen2.5:3b', label: 'Qwen2.5 3B (Recommandé)', ram: '~4-5 Go' },
    { value: 'gemma:2b', label: 'Gemma 2B', ram: '~3-4 Go' },
    { value: 'phi3:mini', label: 'Phi-3 Mini (3.8B)', ram: '~5-6 Go' },
    { value: 'mistral:7b', label: 'Mistral 7B', ram: '~8-10 Go' },
    { value: 'mistral-nemo', label: 'Mistral Nemo 12B ⭐ (Meilleur FR)', ram: '~7-8 Go' },
];

export interface AiSettingsData {
    provider: AiProvider;
    endpoint: string;
    model: string;
    temperature: number;
    enabled: boolean;
    enableAnalysis: boolean;
    groqApiKey: string;
    groqModel: string;
    useKeyPool: boolean;
    customAnalysisPrompt?: string;
    analysisTemperature?: number;
}

// Default settings


// Hook to get/set AI settings with persistence
export function useAiSettings() {
    const [settings, setSettings] = useState<AiSettingsData>(DEFAULT_SETTINGS);
    const [loaded, setLoaded] = useState(false);

    // Load from localStorage on mount
    useEffect(() => {
        try {
            const stored = localStorage.getItem(AI_SETTINGS_KEY);
            if (stored) {
                setSettings({ ...DEFAULT_SETTINGS, ...JSON.parse(stored) });
            }
        } catch (e) {
            console.error('Failed to load AI settings:', e);
        }
        setLoaded(true);
    }, []);

    // Save to localStorage
    const saveSettings = (newSettings: Partial<AiSettingsData>) => {
        const updated = { ...settings, ...newSettings };
        setSettings(updated);
        try {
            localStorage.setItem(AI_SETTINGS_KEY, JSON.stringify(updated));
        } catch (e) {
            console.error('Failed to save AI settings:', e);
        }
        return updated;
    };

    return { settings, saveSettings, loaded };
}

// Get current AI settings (for use outside React components)
export function getAiSettings(): AiSettingsData {
    try {
        const stored = localStorage.getItem(AI_SETTINGS_KEY);
        if (stored) {
            return { ...DEFAULT_SETTINGS, ...JSON.parse(stored) };
        }
    } catch (e) {
        console.error('Failed to get AI settings:', e);
    }
    return DEFAULT_SETTINGS;
}

// Main Settings Component
export default function AiSettings() {
    const { settings, saveSettings, loaded } = useAiSettings();
    const [isTestingConnection, setIsTestingConnection] = useState(false);
    const [connectionStatus, setConnectionStatus] = useState<'unknown' | 'connected' | 'error'>('unknown');
    const [availableModels, setAvailableModels] = useState<string[]>([]);
    const [isSaving, setIsSaving] = useState(false);
    const [connectionError, setConnectionError] = useState<string | null>(null);

    // Test connection based on provider
    const testConnection = async () => {
        setIsTestingConnection(true);
        setConnectionStatus('unknown');
        setConnectionError(null);

        if (settings.provider === 'groq') {
            // Test Groq connection
            if (!settings.groqApiKey || settings.groqApiKey.length < 10) {
                setConnectionStatus('error');
                setConnectionError('Clé API Groq invalide ou manquante');
                setIsTestingConnection(false);
                return;
            }

            try {
                const response = await fetch('https://api.groq.com/openai/v1/models', {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${settings.groqApiKey}`,
                    },
                });

                if (response.ok) {
                    const data = await response.json();
                    const models = data.data?.map((m: any) => m.id) || [];
                    setAvailableModels(models);
                    setConnectionStatus('connected');
                } else {
                    setConnectionStatus('error');
                    setConnectionError(`Erreur Groq: ${response.status}`);
                }
            } catch (e: any) {
                setConnectionStatus('error');
                setConnectionError(e.message || 'Erreur de connexion à Groq');
            } finally {
                setIsTestingConnection(false);
            }
            return;
        }

        // Test Ollama connection
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 5000);

            const response = await fetch(`${settings.endpoint}/api/tags`, {
                method: 'GET',
                signal: controller.signal,
            });

            clearTimeout(timeoutId);

            if (response.ok) {
                const data = await response.json();
                const models = data.models?.map((m: any) => m.name) || [];
                setAvailableModels(models);
                setConnectionStatus('connected');
            } else {
                setConnectionStatus('error');
                setConnectionError(`Erreur HTTP: ${response.status} ${response.statusText}`);
            }
        } catch (e: any) {
            console.error('Connection test failed:', e);
            setConnectionStatus('error');
            if (e.name === 'AbortError') {
                setConnectionError('Timeout - Le serveur ne répond pas');
            } else if (e.message?.includes('Failed to fetch') || e.message?.includes('NetworkError')) {
                setConnectionError('CORS/Réseau - Vérifiez que OLLAMA_ORIGINS="*" est configuré');
            } else {
                setConnectionError(e.message || 'Erreur inconnue');
            }
        } finally {
            setIsTestingConnection(false);
        }
    };

    // Test connection on mount or when provider changes
    useEffect(() => {
        if (loaded) {
            testConnection();
        }
    }, [loaded, settings.provider, settings.endpoint, settings.groqApiKey]);

    // Handle field changes with debounced save
    const handleChange = (field: keyof AiSettingsData, value: any) => {
        saveSettings({ [field]: value });
    };

    // Handle explicit save with visual feedback
    const handleSave = () => {
        setIsSaving(true);
        saveSettings(settings);
        setTimeout(() => setIsSaving(false), 500);
    };

    if (!loaded) {
        return (
            <div className="flex items-center justify-center p-8">
                <ArrowPathIcon className="w-6 h-6 animate-spin text-purple-500" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-50 to-indigo-50 p-4 rounded-lg border border-purple-200">
                <div className="flex items-center">
                    <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center mr-3">
                        <SparklesIcon className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-purple-900">Intelligence Artificielle</h3>
                        <p className="text-sm text-purple-700">Configuration du fournisseur et du modèle IA</p>
                    </div>
                </div>
            </div>

            {/* Provider Selection */}
            <div className="bg-white p-4 rounded-lg border border-gray-200">
                <h4 className="font-medium text-gray-900 mb-3">Fournisseur IA</h4>
                <div className="grid grid-cols-2 gap-3">
                    {/* Ollama Option */}
                    <button
                        onClick={() => handleChange('provider', 'ollama')}
                        className={`p-4 rounded-lg border-2 transition-all ${settings.provider === 'ollama'
                            ? 'border-purple-500 bg-purple-50'
                            : 'border-gray-200 hover:border-gray-300'
                            }`}
                    >
                        <ServerIcon className={`w-8 h-8 mx-auto mb-2 ${settings.provider === 'ollama' ? 'text-purple-600' : 'text-gray-400'}`} />
                        <p className={`font-medium ${settings.provider === 'ollama' ? 'text-purple-900' : 'text-gray-700'}`}>Ollama (Local)</p>
                        <p className="text-xs text-gray-500 mt-1">Serveur local, gratuit, privé</p>
                    </button>

                    {/* Groq Option */}
                    <button
                        onClick={() => handleChange('provider', 'groq')}
                        className={`p-4 rounded-lg border-2 transition-all ${settings.provider === 'groq'
                            ? 'border-green-500 bg-green-50'
                            : 'border-gray-200 hover:border-gray-300'
                            }`}
                    >
                        <CloudIcon className={`w-8 h-8 mx-auto mb-2 ${settings.provider === 'groq' ? 'text-green-600' : 'text-gray-400'}`} />
                        <p className={`font-medium ${settings.provider === 'groq' ? 'text-green-900' : 'text-gray-700'}`}>Groq (Cloud)</p>
                        <p className="text-xs text-gray-500 mt-1">Ultra-rapide ⚡, gratuit (1000/jour)</p>
                    </button>
                </div>
            </div>

            {/* Connection Status */}
            <div className={`p-4 rounded-lg border ${connectionStatus === 'connected' ? 'bg-green-50 border-green-200' :
                connectionStatus === 'error' ? 'bg-red-50 border-red-200' :
                    'bg-gray-50 border-gray-200'
                }`}>
                <div className="flex items-center justify-between">
                    <div className="flex items-center">
                        {connectionStatus === 'connected' ? (
                            <CheckCircleIcon className="w-5 h-5 text-green-500 mr-2" />
                        ) : connectionStatus === 'error' ? (
                            <XCircleIcon className="w-5 h-5 text-red-500 mr-2" />
                        ) : (
                            <div className="w-5 h-5 rounded-full bg-gray-300 mr-2" />
                        )}
                        <div>
                            <span className={`font-medium ${connectionStatus === 'connected' ? 'text-green-800' :
                                connectionStatus === 'error' ? 'text-red-800' :
                                    'text-gray-600'
                                }`}>
                                {connectionStatus === 'connected' ? `Connecté à ${settings.provider === 'groq' ? 'Groq' : 'Ollama'}` :
                                    connectionStatus === 'error' ? 'Connexion impossible' :
                                        'Statut inconnu'}
                            </span>
                            {connectionStatus === 'connected' && availableModels.length > 0 && (
                                <p className="text-sm text-green-600">{availableModels.length} modèle(s) disponible(s)</p>
                            )}
                        </div>
                    </div>
                    <button
                        onClick={testConnection}
                        disabled={isTestingConnection}
                        className="px-3 py-1.5 text-sm font-medium text-purple-700 bg-purple-100 rounded-lg hover:bg-purple-200 disabled:opacity-50"
                    >
                        {isTestingConnection ? (
                            <ArrowPathIcon className="w-4 h-4 animate-spin" />
                        ) : (
                            'Tester'
                        )}
                    </button>
                </div>
                {connectionError && (
                    <p className="text-xs text-red-600 mt-2">{connectionError}</p>
                )}
            </div>

            {/* Enable/Disable Toggle */}
            <div className="bg-white p-4 rounded-lg border border-gray-200">
                <div className="flex items-center justify-between">
                    <div>
                        <h4 className="font-medium text-gray-900">Activer l'IA</h4>
                        <p className="text-sm text-gray-500">Active les fonctionnalités d'assistance IA dans l'application</p>
                    </div>
                    <button
                        onClick={() => handleChange('enabled', !settings.enabled)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${settings.enabled ? 'bg-purple-600' : 'bg-gray-300'
                            }`}
                    >
                        <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${settings.enabled ? 'translate-x-6' : 'translate-x-1'
                                }`}
                        />
                    </button>
                </div>
            </div>

            {/* Groq Settings */}
            {settings.provider === 'groq' && (
                <>
                    {/* API Key */}
                    <div className="bg-white p-4 rounded-lg border border-gray-200">
                        <div className="flex items-center mb-3">
                            <KeyIcon className="w-5 h-5 text-gray-400 mr-2" />
                            <h4 className="font-medium text-gray-900">Clé API Groq</h4>
                        </div>
                        <input
                            type="password"
                            value={settings.groqApiKey}
                            onChange={(e) => handleChange('groqApiKey', e.target.value)}
                            placeholder="gsk_..."
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                            Obtenez votre clé sur <a href="https://console.groq.com" target="_blank" rel="noopener noreferrer" className="text-green-600 hover:underline">console.groq.com</a> (gratuit)
                        </p>
                    </div>

                    {/* Groq Model Selection */}
                    <div className="bg-white p-4 rounded-lg border border-gray-200">
                        <div className="flex items-center mb-3">
                            <CpuChipIcon className="w-5 h-5 text-gray-400 mr-2" />
                            <h4 className="font-medium text-gray-900">Modèle Groq</h4>
                        </div>
                        <select
                            value={settings.groqModel}
                            onChange={(e) => handleChange('groqModel', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        >
                            {GROQ_MODELS.map((model) => (
                                <option key={model.value} value={model.value}>
                                    {model.label} ({model.tokens})
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Key Pool Toggle */}
                    <div className="bg-white p-4 rounded-lg border border-gray-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <h4 className="font-medium text-gray-900">Mode Pool de Clés</h4>
                                <p className="text-sm text-gray-500">Utiliser plusieurs clés API avec rotation automatique</p>
                            </div>
                            <button
                                onClick={() => handleChange('useKeyPool', !settings.useKeyPool)}
                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${settings.useKeyPool ? 'bg-green-600' : 'bg-gray-300'
                                    }`}
                            >
                                <span
                                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${settings.useKeyPool ? 'translate-x-6' : 'translate-x-1'
                                        }`}
                                />
                            </button>
                        </div>
                    </div>

                    {/* Key Pool Manager (if enabled) */}
                    {settings.useKeyPool && (
                        <ApiKeyPoolManager onPoolChange={() => testConnection()} />
                    )}
                </>
            )}

            {/* Ollama Settings */}
            {settings.provider === 'ollama' && (
                <>
                    {/* Endpoint Configuration */}
                    <div className="bg-white p-4 rounded-lg border border-gray-200">
                        <div className="flex items-center mb-3">
                            <ServerIcon className="w-5 h-5 text-gray-400 mr-2" />
                            <h4 className="font-medium text-gray-900">Serveur Ollama</h4>
                        </div>
                        <input
                            type="text"
                            value={settings.endpoint}
                            onChange={(e) => handleChange('endpoint', e.target.value)}
                            placeholder="http://192.168.2.147:11434"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                            URL du serveur Ollama (ex: http://192.168.2.147:11434)
                        </p>
                    </div>

                    {/* Model Selection */}
                    <div className="bg-white p-4 rounded-lg border border-gray-200">
                        <div className="flex items-center mb-3">
                            <CpuChipIcon className="w-5 h-5 text-gray-400 mr-2" />
                            <h4 className="font-medium text-gray-900">Modèle</h4>
                        </div>

                        {/* Quick Select */}
                        <select
                            value={settings.model}
                            onChange={(e) => handleChange('model', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 mb-2"
                        >
                            {AVAILABLE_MODELS.map((model) => (
                                <option key={model.value} value={model.value}>
                                    {model.label} ({model.ram})
                                </option>
                            ))}
                            {/* Show installed models from server */}
                            {availableModels.filter(m => !AVAILABLE_MODELS.some(am => am.value === m)).map((model) => (
                                <option key={model} value={model}>
                                    {model} (installé)
                                </option>
                            ))}
                        </select>

                        {/* Manual input */}
                        <input
                            type="text"
                            value={settings.model}
                            onChange={(e) => handleChange('model', e.target.value)}
                            placeholder="Ou entrez un nom de modèle..."
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                        />
                    </div>
                </>
            )}

            {/* Advanced Analysis Configuration */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 mt-6 space-y-6">
                <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                    <div className="p-2 bg-purple-50 rounded-lg">
                        <AdjustmentsHorizontalIcon className="w-6 h-6 text-purple-600" />
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-slate-800">Configuration Avancée de l'Analyse</h3>
                        <p className="text-sm text-slate-500">Personnalisez le comportement de l'IA pour l'analyse des notes</p>
                    </div>
                </div>

                {/* Enable Analysis Toggle */}
                <div className="flex items-center justify-between py-2 border-b border-gray-100 pb-4">
                    <div>
                        <label className="text-sm font-medium text-slate-700">Activer l'extraction automatique</label>
                        <p className="text-xs text-slate-500">Détecte actions et problématiques (si désactivé, seuls les mots-clés prédéfinis fonctionnent)</p>
                    </div>
                    <button
                        onClick={() => handleChange('enableAnalysis', !settings.enableAnalysis)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${settings.enableAnalysis ? 'bg-purple-600' : 'bg-gray-200'}`}
                    >
                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${settings.enableAnalysis ? 'translate-x-6' : 'translate-x-1'}`} />
                    </button>
                </div>

                {/* Analysis Temperature */}
                <div>
                    <div className="flex justify-between items-center mb-2">
                        <label className="text-sm font-medium text-slate-700">
                            Température (Créativité) : {settings.analysisTemperature ?? 0}
                        </label>
                        <span className={`text-xs px-2 py-1 rounded ${(settings.analysisTemperature ?? 0) === 0 ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
                            }`}>
                            {(settings.analysisTemperature ?? 0) === 0 ? 'Strict (Défaut)' : 'Plus créatif'}
                        </span>
                    </div>
                    <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.1"
                        value={settings.analysisTemperature ?? 0}
                        onChange={(e) => handleChange('analysisTemperature', parseFloat(e.target.value))}
                        className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
                    />
                    <div className="flex justify-between mt-1 text-xs text-slate-400">
                        <span>0.0 (Logique pure)</span>
                        <span>0.5 (Équilibré)</span>
                        <span>1.0 (Imaginatif)</span>
                    </div>
                </div>

                {/* Custom System Prompt */}
                <div>
                    <div className="flex justify-between items-center mb-2">
                        <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                            Prompt Système Personnalisé
                            <div className="group relative pointer-events-auto">
                                <span className="cursor-help text-purple-600 font-bold border border-purple-200 bg-purple-50 rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-purple-600 hover:text-white transition-colors">?</span>

                                <div className="absolute left-0 bottom-full mb-2 w-80 p-4 bg-slate-800 text-white text-xs rounded-xl shadow-2xl opacity-0 group-hover:opacity-100 transition-opacity z-50 pointer-events-none">
                                    <div className="font-bold mb-2 text-sm text-purple-300">Guide Prompting</div>
                                    <p className="mb-2">Ce texte définit l'identité (Persona) de l'IA.</p>
                                    <div className="bg-slate-900 p-2 rounded border border-slate-700 mb-2 font-mono text-xs opacity-80">
                                        {'${validActions}'}<br />
                                        {'${validProblematiques}'}
                                    </div>
                                    <p>⚠️ Ces variables sont <strong>OBLIGATOIRES</strong> pour que l'IA connaisse les catégories possibles.</p>
                                </div>
                            </div>
                        </label>
                        <button
                            onClick={() => handleChange('customAnalysisPrompt', '')}
                            className="text-xs text-slate-500 hover:text-red-500 transition-colors underline"
                        >
                            Restaurer le défaut
                        </button>
                    </div>

                    <textarea
                        value={settings.customAnalysisPrompt || DEFAULT_SYSTEM_PROMPT}
                        onChange={(e) => handleChange('customAnalysisPrompt', e.target.value)}
                        rows={12}
                        className="w-full px-4 py-3 text-sm border-2 border-slate-100 rounded-xl focus:border-purple-500 focus:ring-0 font-mono bg-slate-50 text-slate-700 leading-relaxed resize-none"
                        placeholder="Entrez votre prompt système..."
                    />
                    <p className="text-xs text-slate-500 mt-2 italic">
                        Astuce : Donnez des exemples concrets à l'IA. Ex: "Si tu lis 'dettes loyer', coche 'Logement' et 'Dettes'."
                    </p>
                </div>
            </div>

            {/* Save Button */}
            <div className="flex justify-end">
                <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className={`px-6 py-2 rounded-lg font-medium text-white transition-all ${isSaving ? 'bg-green-500' : 'bg-purple-600 hover:bg-purple-700'
                        }`}
                >
                    {isSaving ? (
                        <>
                            <CheckCircleIcon className="w-4 h-4 inline mr-2" />
                            Sauvegardé !
                        </>
                    ) : (
                        'Sauvegarder'
                    )}
                </button>
            </div>
        </div>
    );
}
