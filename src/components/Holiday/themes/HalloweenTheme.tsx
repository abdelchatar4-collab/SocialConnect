/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect - Halloween Theme Overlay
*/

import React from 'react';

export const HalloweenTheme: React.FC = () => {
    return (
        <div className="fixed inset-0 z-[9000] pointer-events-none overflow-hidden print:hidden">
            <div className="absolute inset-0 z-[9001]" style={{ background: 'radial-gradient(circle at center, transparent 60%, rgba(76, 29, 149, 0.2) 100%)' }}></div>

            <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-orange-900 via-purple-900 to-orange-900 text-white py-3 shadow-xl z-[9002] opacity-95 border-b-4 border-orange-600">
                <div className="container mx-auto flex justify-center items-center gap-6 animate-pulse">
                    <span className="text-3xl animate-bounce">BAT</span>
                    <h1 className="text-3xl md:text-4xl font-extrabold tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-purple-300 to-orange-400 drop-shadow-md font-serif">
                        JOYEUX HALLOWEEN
                    </h1>
                    <span className="text-3xl animate-bounce">WEB</span>
                </div>
            </div>

            <div className="absolute top-12 left-0 w-48 h-48 z-[9002] opacity-80">
                <svg viewBox="0 0 100 100" className="w-full h-full fill-none stroke-gray-400/50 stroke-1">
                    <path d="M0,0 L50,50 M0,0 L80,20 M0,0 L20,80 M0,0 L100,0 M0,0 L0,100" />
                    <path d="M10,90 Q20,80 30,70 Q40,60 50,50" strokeOpacity="0.5" />
                    <path d="M20,80 Q30,60 50,40" strokeOpacity="0.5" />
                    <path d="M5,95 Q40,60 95,5" strokeOpacity="0.3" />
                </svg>
            </div>

            <div className="absolute inset-0 overflow-hidden z-[9003]">
                {[...Array(5)].map((_, i) => (
                    <div key={i} className="absolute animate-fly-bat" style={{
                        top: `${Math.random() * 40 + 10}%`,
                        left: '-100px',
                        animationDuration: `${10 + Math.random() * 10}s`,
                        animationDelay: `${Math.random() * 10}s`,
                        transform: `scale(${0.5 + Math.random() * 0.5})`
                    } as React.CSSProperties}>
                        <svg width="60" height="40" viewBox="0 0 100 60" fill="black">
                            <path d="M50,30 Q70,5 90,20 Q100,30 90,40 Q70,60 50,40 Q30,60 10,40 Q0,30 10,20 Q30,5 50,30 Z" />
                        </svg>
                    </div>
                ))}
            </div>

            <div className="absolute inset-0 overflow-hidden z-[9003]">
                {[...Array(3)].map((_, i) => (
                    <div key={i} className="absolute animate-float-ghost opacity-60" style={{
                        bottom: '-100px',
                        left: `${20 + Math.random() * 60}%`,
                        animationDuration: `${15 + Math.random() * 5}s`,
                        animationDelay: `${Math.random() * 5}s`
                    } as React.CSSProperties}>
                        <svg width="60" height="80" viewBox="0 0 100 120" fill="white">
                            <path d="M10,120 Q10,100 0,80 Q0,0 50,0 Q100,0 100,80 Q90,100 90,120 L80,110 L70,120 L60,110 L50,120 L40,110 L30,120 L20,110 L10,120 Z" />
                            <circle cx="35" cy="40" r="5" fill="black" />
                            <circle cx="65" cy="40" r="5" fill="black" />
                            <ellipse cx="50" cy="55" rx="5" ry="8" fill="black" />
                        </svg>
                    </div>
                ))}
            </div>

            <style jsx>{`
                @keyframes fly-bat {
                    0% { left: -100px; transform: translateY(0) scale(0.5); }
                    100% { left: 110vw; transform: translateY(0) scale(0.5); }
                }
                .animate-fly-bat { animation: fly-bat linear infinite; }
                @keyframes float-ghost {
                    0% { transform: translateY(0) translateX(0); opacity: 0; }
                    100% { transform: translateY(-80vh) translateX(50px); opacity: 0; }
                }
                .animate-float-ghost { animation: float-ghost linear infinite; }
            `}</style>
        </div>
    );
};
