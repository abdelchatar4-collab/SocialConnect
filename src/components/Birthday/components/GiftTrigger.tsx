/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect - Gift Trigger Button
*/

import React from 'react';

interface GiftTriggerProps {
    onTrigger: () => void;
    onDismiss: (e: React.MouseEvent) => void;
}

export const GiftTrigger: React.FC<GiftTriggerProps> = ({ onTrigger, onDismiss }) => {
    return (
        <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-[9050] flex flex-col items-center gap-4 cursor-pointer group">
            <div className="relative" onClick={onTrigger}>
                <div className="text-9xl filter drop-shadow-2xl animate-bounce group-hover:scale-110 transition-transform duration-300">
                    🎁
                </div>
                <div className="absolute -top-4 -right-12 bg-yellow-400 text-purple-900 font-black text-xl px-4 py-2 rounded-full animate-pulse shadow-lg rotate-12 border-4 border-white">
                    CLIC ICI !
                </div>

                {/* DISMISS BUTTON (X) */}
                <button
                    onClick={onDismiss}
                    className="absolute -top-2 -left-2 bg-red-500 hover:bg-red-600 text-white w-8 h-8 rounded-full flex items-center justify-center shadow-lg border-2 border-white transition-colors z-50"
                    title="Masquer le cadeau"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                </button>
            </div>
            <div className="bg-white/90 backdrop-blur-sm px-6 py-3 rounded-full shadow-2xl border-4 border-purple-500 animate-pulse" onClick={onTrigger}>
                <h3 className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600 uppercase tracking-wider">
                    Ouvre ton cadeau !
                </h3>
            </div>
        </div>
    );
};
