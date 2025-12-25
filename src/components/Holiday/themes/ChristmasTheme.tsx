/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect - Christmas Theme Overlay
*/

import React from 'react';
import Snowfall from 'react-snowfall';

export const ChristmasTheme: React.FC = () => {
    return (
        <div className="fixed inset-0 z-[9000] pointer-events-none overflow-hidden print:hidden">
            <Snowfall
                snowflakeCount={200}
                style={{ position: 'fixed', width: '100vw', height: '100vh', zIndex: 9001 }}
                radius={[0.5, 3.0]}
            />

            <div className="absolute top-0 left-0 right-0 h-32 z-[9002]">
                <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 1200 100">
                    <defs>
                        <linearGradient id="pineGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#0f3923" />
                            <stop offset="50%" stopColor="#1a5d3a" />
                            <stop offset="100%" stopColor="#0f3923" />
                        </linearGradient>
                        <filter id="dropShadow">
                            <feDropShadow dx="0" dy="2" stdDeviation="3" floodOpacity="0.5" />
                        </filter>
                    </defs>
                    <path d="M0,0 Q240,90 480,0 V-20 H0 Z" fill="url(#pineGradient)" filter="url(#dropShadow)" />
                    <path d="M0,-10 Q240,70 480,-10" fill="none" stroke="#1a5d3a" strokeWidth="20" strokeLinecap="round" strokeDasharray="1,5" />
                    <path d="M720,0 Q960,90 1200,0 V-20 H1200 Z" fill="url(#pineGradient)" filter="url(#dropShadow)" />
                    <path d="M720,-10 Q960,70 1200,-10" fill="none" stroke="#1a5d3a" strokeWidth="20" strokeLinecap="round" strokeDasharray="1,5" />
                </svg>

                <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
                    <div className="absolute top-0 left-[5%] md:left-[15%] flex gap-8 md:gap-16 pt-4">
                        <div className="relative animate-swing origin-top mt-8">
                            <svg width="60" height="80" viewBox="0 0 100 140" className="drop-shadow-xl">
                                <path d="M20,0 L80,0 L80,20 L20,20 Z" fill="#f0f0f0" />
                                <path d="M25,20 L75,20 L70,90 Q70,110 50,110 L30,110 Q10,110 10,90 L25,20 Z" fill="#dc2626" />
                                <path d="M10,90 Q10,130 50,130 L70,130 Q90,130 90,110 Q90,90 70,90" fill="#dc2626" />
                                <path d="M10,90 Q10,130 50,130 L70,130 Q90,130 90,110 Q90,90 70,90" fill="none" stroke="#b91c1c" strokeWidth="2" />
                                <circle cx="50" cy="50" r="15" fill="#f0f0f0" opacity="0.8" />
                            </svg>
                        </div>
                        <div className="relative animate-swing-delayed origin-top mt-12">
                            <div className="w-1 h-8 bg-yellow-500 mx-auto"></div>
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-yellow-300 to-yellow-600 shadow-lg border border-yellow-200"></div>
                        </div>
                    </div>

                    <div className="absolute top-0 right-[5%] md:right-[15%] flex gap-8 md:gap-16 pt-4">
                        <div className="relative animate-swing-delayed origin-top mt-10">
                            <div className="w-1 h-12 bg-gray-400 mx-auto"></div>
                            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-red-400 to-red-800 shadow-lg border border-red-300"></div>
                        </div>
                        <div className="relative animate-swing origin-top mt-6 animation-delay-1000">
                            <svg width="60" height="80" viewBox="0 0 100 140" className="drop-shadow-xl">
                                <path d="M20,0 L80,0 L80,20 L20,20 Z" fill="#f0f0f0" />
                                <path d="M25,20 L75,20 L70,90 Q70,110 50,110 L30,110 Q10,110 10,90 L25,20 Z" fill="#166534" />
                                <path d="M10,90 Q10,130 50,130 L70,130 Q90,130 90,110 Q90,90 70,90" fill="#166534" />
                                <path d="M25,20 L75,20" stroke="#f0f0f0" strokeWidth="5" strokeDasharray="10,10" />
                            </svg>
                        </div>
                    </div>
                </div>
            </div>

            <div className="absolute bottom-0 right-0 z-[9003] w-64 h-80 pointer-events-none">
                <svg viewBox="0 0 200 300" className="w-full h-full drop-shadow-2xl">
                    <path d="M100,20 L140,80 H60 Z" fill="#166534" />
                    <path d="M100,60 L150,140 H50 Z" fill="#15803d" />
                    <path d="M100,120 L160,220 H40 Z" fill="#16a34a" />
                    <rect x="90" y="220" width="20" height="40" fill="#5c3a21" />
                    <circle cx="100" cy="50" r="3" fill="yellow" className="animate-blink" />
                    <circle cx="80" cy="100" r="3" fill="red" className="animate-blink animation-delay-200" />
                    <circle cx="120" cy="100" r="3" fill="blue" className="animate-blink animation-delay-400" />
                    <circle cx="70" cy="180" r="3" fill="orange" className="animate-blink animation-delay-600" />
                    <circle cx="130" cy="180" r="3" fill="white" className="animate-blink animation-delay-800" />
                    <circle cx="100" cy="150" r="3" fill="pink" className="animate-blink animation-delay-1000" />
                    <path d="M100,10 L105,25 L120,25 L108,35 L112,50 L100,40 L88,50 L92,35 L80,25 L95,25 Z" fill="#fbbf24" className="animate-pulse" />
                </svg>
            </div>

            <div className="absolute bottom-4 left-10 z-[9003] w-48 h-48 animate-bounce-slow">
                <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="100" cy="160" r="35" fill="white" stroke="#e2e8f0" strokeWidth="2" />
                    <circle cx="100" cy="110" r="25" fill="white" stroke="#e2e8f0" strokeWidth="2" />
                    <circle cx="100" cy="70" r="20" fill="white" stroke="#e2e8f0" strokeWidth="2" />
                    <circle cx="93" cy="65" r="2" fill="black" />
                    <circle cx="107" cy="65" r="2" fill="black" />
                    <path d="M100,70 L120,75 L100,80 Z" fill="orange" />
                    <line x1="75" y1="110" x2="40" y2="90" stroke="#8B4513" strokeWidth="3" className="animate-wave-left" />
                    <line x1="125" y1="110" x2="160" y2="90" stroke="#8B4513" strokeWidth="3" className="animate-wave-right" />
                    <path d="M85,90 Q100,100 115,90" stroke="red" strokeWidth="8" fill="none" />
                    <line x1="110" y1="92" x2="120" y2="120" stroke="red" strokeWidth="8" />
                    <rect x="80" y="45" width="40" height="5" fill="black" />
                    <rect x="85" y="25" width="30" height="20" fill="black" />
                </svg>
            </div>

            <style jsx>{`
                @keyframes swing { 0%, 100% { transform: rotate(-3deg); } 50% { transform: rotate(3deg); } }
                .animate-swing { animation: swing 4s ease-in-out infinite; }
                .animate-swing-delayed { animation: swing 5s ease-in-out infinite reverse; }
                @keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }
                .animate-blink { animation: blink 1.5s infinite; }
                .animation-delay-200 { animation-delay: 0.2s; }
                .animation-delay-400 { animation-delay: 0.4s; }
                .animation-delay-600 { animation-delay: 0.6s; }
                .animation-delay-800 { animation-delay: 0.8s; }
                .animation-delay-1000 { animation-delay: 1s; }
                @keyframes wave-left { 0%, 100% { transform: rotate(0deg); transform-origin: 75px 110px; } 50% { transform: rotate(-20deg); transform-origin: 75px 110px; } }
                .animate-wave-left { animation: wave-left 2s ease-in-out infinite; }
                @keyframes wave-right { 0%, 100% { transform: rotate(0deg); transform-origin: 125px 110px; } 50% { transform: rotate(20deg); transform-origin: 125px 110px; } }
                .animate-wave-right { animation: wave-right 2s ease-in-out infinite; }
                @keyframes bounce-slow { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-5px); } }
                .animate-bounce-slow { animation: bounce-slow 3s ease-in-out infinite; }
            `}</style>
        </div>
    );
};
