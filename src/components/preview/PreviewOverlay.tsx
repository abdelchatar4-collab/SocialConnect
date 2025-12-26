/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect - Shared Document Preview Overlay
*/

import React from 'react';
import { XMarkIcon, NoSymbolIcon } from "@heroicons/react/24/outline";

interface PreviewOverlayProps {
    url: string;
    onClose: () => void;
    fileName?: string;
}

export const PreviewOverlay: React.FC<PreviewOverlayProps> = ({
    url,
    onClose,
    fileName
}) => {
    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/90 backdrop-blur-md p-4 md:p-8">
            <div className="relative w-full h-full max-w-6xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in duration-300">

                {/* Top bar */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                            <NoSymbolIcon className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                            <h3 className="font-bold text-slate-900 leading-tight">Aperçu du document</h3>
                            {fileName && <p className="text-xs text-slate-500 font-medium">{fileName}</p>}
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-slate-100 rounded-full transition-colors group"
                    >
                        <XMarkIcon className="w-6 h-6 text-slate-400 group-hover:text-slate-600" />
                    </button>
                </div>

                {/* Preview Frame */}
                <div className="flex-1 bg-slate-50 relative">
                    <iframe
                        src={url}
                        className="w-full h-full border-none"
                        title="Preview"
                    />
                </div>

                {/* Bottom bar */}
                <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-6 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl font-bold hover:bg-slate-50 transition-all shadow-sm active:scale-95"
                    >
                        Fermer l'aperçu
                    </button>
                </div>
            </div>
        </div>
    );
};
