/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect - Ramadan Theme Overlay
*/

import React from 'react';

export const RamadanTheme: React.FC = () => {
    return (
        <div className="fixed inset-0 z-[9000] pointer-events-none overflow-hidden print:hidden">
            <div className="absolute inset-0 z-[9001]" style={{ background: 'radial-gradient(circle at center, transparent 60%, rgba(6, 78, 59, 0.3) 100%)' }}></div>

            <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-emerald-900 via-emerald-600 to-emerald-900 text-white py-3 shadow-xl z-[9002] opacity-95 border-b-2 border-yellow-500">
                <div className="container mx-auto flex justify-center items-center gap-6 animate-pulse">
                    <span className="text-3xl animate-bounce-slow">🌙</span>
                    <h1 className="text-3xl md:text-4xl font-extrabold tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 via-yellow-400 to-yellow-200 drop-shadow-md font-serif">
                        RAMADAN MUBARAK
                    </h1>
                    <span className="text-3xl animate-bounce-slow">✨</span>
                </div>
            </div>

            <div className="absolute top-0 left-0 w-full h-64 z-[9002] pointer-events-none">
                <div className="absolute top-0 left-[10%] animate-swing origin-top">
                    <div className="w-0.5 h-32 bg-yellow-500/50 mx-auto"></div>
                    <svg width="60" height="100" viewBox="0 0 60 100" className="drop-shadow-lg">
                        <path d="M20,0 L40,0 L50,20 L10,20 Z" fill="#fbbf24" />
                        <path d="M10,20 L50,20 L60,60 L0,60 Z" fill="#f59e0b" />
                        <path d="M0,60 L60,60 L40,90 L20,90 Z" fill="#fbbf24" />
                        <rect x="20" y="30" width="20" height="30" fill="#fef3c7" className="animate-pulse" />
                    </svg>
                </div>
            </div>

            <style jsx>{`
                @keyframes swing { 0%, 100% { transform: rotate(-3deg); } 50% { transform: rotate(3deg); } }
                .animate-swing { animation: swing 4s ease-in-out infinite; }
                @keyframes bounce-slow { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-5px); } }
                .animate-bounce-slow { animation: bounce-slow 3s ease-in-out infinite; }
            `}</style>
        </div>
    );
};
