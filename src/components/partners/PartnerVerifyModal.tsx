/*
Copyright (C) 2025 AC
SocialConnect - Partner Verification Modal Component
*/

import React from 'react';
import {
    SparklesIcon,
    XCircleIcon,
    ArrowPathIcon,
    CpuChipIcon,
    CheckCircleIcon
} from '@heroicons/react/24/outline';

interface VerificationChange {
    field: string;
    oldValue: string;
    newValue: string;
    reason: string;
}

interface VerificationResult {
    nom: string;
    confidence: 'high' | 'medium' | 'low';
    sources: string[];
    changes: VerificationChange[];
    modelUsed?: string;
}

interface PartnerVerifyModalProps {
    partner: any;
    result: VerificationResult | null;
    loading: boolean;
    error: string | null;
    updateLoading: boolean;
    onClose: () => void;
    onRetry: () => void;
    onApply: () => void;
}

export const PartnerVerifyModal: React.FC<PartnerVerifyModalProps> = ({
    partner,
    result,
    loading,
    error,
    updateLoading,
    onClose,
    onRetry,
    onApply
}) => {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-to-r from-violet-600 to-purple-600 px-6 py-4 text-white">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <SparklesIcon className="w-6 h-6" />
                            <h2 className="text-xl font-bold">Vérification AI</h2>
                        </div>
                        <button onClick={onClose} className="p-1 hover:bg-white/20 rounded-lg transition-colors">
                            <XCircleIcon className="w-6 h-6" />
                        </button>
                    </div>
                    {partner && <p className="mt-2 text-white/80">{partner.nom}</p>}
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto max-h-[60vh]">
                    {loading && (
                        <div className="flex flex-col items-center justify-center py-12">
                            <ArrowPathIcon className="w-12 h-12 text-violet-500 animate-spin mb-4" />
                            <p className="text-slate-600 font-medium">Recherche en cours...</p>
                        </div>
                    )}

                    {error && !loading && (
                        <div className="py-8 px-6 text-center animate-fadeIn">
                            <div className="w-20 h-20 bg-rose-50 rounded-3xl flex items-center justify-center mx-auto mb-6 text-rose-500 ring-4 ring-rose-50">
                                <XCircleIcon className="w-10 h-10" />
                            </div>
                            <h3 className="text-2xl font-black text-slate-800 mb-3 tracking-tight">Erreur</h3>
                            <p className="text-slate-500 mb-8 italic">"{error}"</p>
                            <button onClick={onRetry} className="px-8 py-3 bg-violet-600 text-white rounded-xl font-bold hover:bg-violet-700 transition-all shadow-lg">
                                Réessayer
                            </button>
                        </div>
                    )}

                    {result && !loading && (
                        <div className="space-y-6">
                            <div className="flex flex-col items-center gap-2">
                                <div className="flex items-center gap-2">
                                    <span className={`px-4 py-2 rounded-full text-sm font-bold ${result.confidence === 'high' ? 'bg-green-100 text-green-700' : result.confidence === 'medium' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'}`}>
                                        Confiance: {result.confidence === 'high' ? 'Élevée' : result.confidence === 'medium' ? 'Moyenne' : 'Faible'}
                                    </span>
                                    {result.modelUsed && (
                                        <span className="px-4 py-2 rounded-full text-sm font-bold bg-violet-100 text-violet-700 flex items-center gap-2">
                                            <CpuChipIcon className="w-4 h-4" />
                                            {result.modelUsed}
                                        </span>
                                    )}
                                </div>
                            </div>

                            {result.changes.length > 0 ? (
                                <div className="space-y-4">
                                    <h3 className="font-bold text-slate-800 flex items-center gap-2">
                                        <ArrowPathIcon className="w-5 h-5 text-violet-500" />
                                        Modifications suggérées ({result.changes.length})
                                    </h3>
                                    {result.changes.map((change, idx) => (
                                        <div key={idx} className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                                            <div className="flex items-center gap-2 mb-2">
                                                <span className="px-2 py-1 bg-violet-100 text-violet-700 rounded text-xs font-bold uppercase">{change.field}</span>
                                            </div>
                                            <div className="grid grid-cols-2 gap-4 text-sm">
                                                <div><span className="text-slate-400 text-xs">Actuellement</span><p className="text-red-600 line-through">{change.oldValue || '(vide)'}</p></div>
                                                <div><span className="text-slate-400 text-xs">Suggestion</span><p className="text-green-600 font-medium">{change.newValue}</p></div>
                                            </div>
                                            <p className="text-slate-500 text-xs mt-2 italic">{change.reason}</p>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8">
                                    <CheckCircleIcon className="w-16 h-16 text-green-500 mx-auto mb-4" />
                                    <p className="text-slate-700 font-medium">Informations à jour !</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                <div className="border-t border-slate-200 px-6 py-4 bg-slate-50 flex justify-end gap-3">
                    <button onClick={onClose} className="px-4 py-2 text-slate-600 hover:bg-slate-200 rounded-lg font-medium">Fermer</button>
                    {result && result.changes.length > 0 && (
                        <button onClick={onApply} disabled={updateLoading} className="px-6 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg font-medium disabled:opacity-50 flex items-center gap-2">
                            {updateLoading ? <ArrowPathIcon className="w-4 h-4 animate-spin" /> : <CheckCircleIcon className="w-4 h-4" />}
                            Appliquer les modifications
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};
