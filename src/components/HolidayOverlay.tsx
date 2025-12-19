/*
Copyright (C) 2025 ABDEL KADER CHATAR
SocialConnect est un logiciel libre : vous pouvez le redistribuer et/ou le modifier selon les termes de la Licence Publique Générale GNU telle que publiée par la Free Software Foundation, soit la version 3 de la licence, soit (à votre convenance) toute version ultérieure.

Ce programme est distribué dans l'espoir qu'il sera utile, mais SANS AUCUNE GARANTIE ; sans même la garantie implicite de COMMERCIALISATION ou d'ADÉQUATION À UN USAGE PARTICULIER. Voir la Licence Publique Générale GNU pour plus de détails.
*/

"use client";

import React, { useEffect, useState } from 'react';
import Snowfall from 'react-snowfall';
import { Fireworks } from '@fireworks-js/react';
import { useAdmin } from '@/contexts/AdminContext';

export const HolidayOverlay: React.FC = () => {
    const { activeHolidayTheme } = useAdmin();
    const [timeLeft, setTimeLeft] = useState<{ days: number, hours: number, minutes: number, seconds: number }>({ days: 0, hours: 0, minutes: 0, seconds: 0 });

    useEffect(() => {
        if (activeHolidayTheme === 'NEW_YEAR') {
            const targetDate = new Date('2026-01-01T00:00:00');
            const interval = setInterval(() => {
                const now = new Date();
                const difference = targetDate.getTime() - now.getTime();

                if (difference > 0) {
                    setTimeLeft({
                        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
                        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
                        minutes: Math.floor((difference / 1000 / 60) % 60),
                        seconds: Math.floor((difference / 1000) % 60)
                    });
                } else {
                    setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
                    clearInterval(interval);
                }
            }, 1000);
            return () => clearInterval(interval);
        }
    }, [activeHolidayTheme]);

    if (activeHolidayTheme === 'CHRISTMAS') {
        return (
            <div className="fixed inset-0 z-[9000] pointer-events-none overflow-hidden print:hidden">
                {/* 1. SNOWFALL */}
                <Snowfall
                    snowflakeCount={200}
                    style={{ position: 'fixed', width: '100vw', height: '100vh', zIndex: 9001 }}
                    radius={[0.5, 3.0]}
                />

                {/* 2. REALISTIC GARLAND (Top) */}
                <div className="absolute top-0 left-0 right-0 h-32 z-[9002]">
                    {/* Pine Needles Texture (Simulated with repeated SVG pattern) */}
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
                        {/* Left Garland Swag (0% - 40%) */}
                        <path d="M0,0 Q240,90 480,0 V-20 H0 Z" fill="url(#pineGradient)" filter="url(#dropShadow)" />
                        <path d="M0,-10 Q240,70 480,-10" fill="none" stroke="#1a5d3a" strokeWidth="20" strokeLinecap="round" strokeDasharray="1,5" />

                        {/* Right Garland Swag (60% - 100%) */}
                        <path d="M720,0 Q960,90 1200,0 V-20 H1200 Z" fill="url(#pineGradient)" filter="url(#dropShadow)" />
                        <path d="M720,-10 Q960,70 1200,-10" fill="none" stroke="#1a5d3a" strokeWidth="20" strokeLinecap="round" strokeDasharray="1,5" />
                    </svg>

                    {/* Hanging Stockings & Ornaments */}
                    <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
                        {/* Left Group */}
                        <div className="absolute top-0 left-[5%] md:left-[15%] flex gap-8 md:gap-16 pt-4">
                            {/* Stocking 1 (Red) */}
                            <div className="relative animate-swing origin-top mt-8">
                                <svg width="60" height="80" viewBox="0 0 100 140" className="drop-shadow-xl">
                                    <path d="M20,0 L80,0 L80,20 L20,20 Z" fill="#f0f0f0" /> {/* Cuff */}
                                    <path d="M25,20 L75,20 L70,90 Q70,110 50,110 L30,110 Q10,110 10,90 L25,20 Z" fill="#dc2626" /> {/* Leg */}
                                    <path d="M10,90 Q10,130 50,130 L70,130 Q90,130 90,110 Q90,90 70,90" fill="#dc2626" /> {/* Foot */}
                                    <path d="M10,90 Q10,130 50,130 L70,130 Q90,130 90,110 Q90,90 70,90" fill="none" stroke="#b91c1c" strokeWidth="2" />
                                    <circle cx="50" cy="50" r="15" fill="#f0f0f0" opacity="0.8" /> {/* Pattern */}
                                </svg>
                            </div>

                            {/* Ornament 1 (Yellow) */}
                            <div className="relative animate-swing-delayed origin-top mt-12">
                                <div className="w-1 h-8 bg-yellow-500 mx-auto"></div>
                                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-yellow-300 to-yellow-600 shadow-lg border border-yellow-200"></div>
                            </div>
                        </div>

                        {/* Right Group */}
                        <div className="absolute top-0 right-[5%] md:right-[15%] flex gap-8 md:gap-16 pt-4">
                            {/* Ornament 2 (Red) - Moved to be first (closer to center) */}
                            <div className="relative animate-swing-delayed origin-top mt-10">
                                <div className="w-1 h-12 bg-gray-400 mx-auto"></div>
                                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-red-400 to-red-800 shadow-lg border border-red-300"></div>
                            </div>

                            {/* Stocking 2 (Green) - Moved to be second (closer to edge) */}
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

                {/* 3. CHRISTMAS TREE (Bottom Right) */}
                <div className="absolute bottom-0 right-0 z-[9003] w-64 h-80 pointer-events-none">
                    <svg viewBox="0 0 200 300" className="w-full h-full drop-shadow-2xl">
                        {/* Tree Layers */}
                        <path d="M100,20 L140,80 H60 Z" fill="#166534" />
                        <path d="M100,60 L150,140 H50 Z" fill="#15803d" />
                        <path d="M100,120 L160,220 H40 Z" fill="#16a34a" />
                        <rect x="90" y="220" width="20" height="40" fill="#5c3a21" />

                        {/* Lights */}
                        <circle cx="100" cy="50" r="3" fill="yellow" className="animate-blink" />
                        <circle cx="80" cy="100" r="3" fill="red" className="animate-blink animation-delay-200" />
                        <circle cx="120" cy="100" r="3" fill="blue" className="animate-blink animation-delay-400" />
                        <circle cx="70" cy="180" r="3" fill="orange" className="animate-blink animation-delay-600" />
                        <circle cx="130" cy="180" r="3" fill="white" className="animate-blink animation-delay-800" />
                        <circle cx="100" cy="150" r="3" fill="pink" className="animate-blink animation-delay-1000" />

                        {/* Star */}
                        <path d="M100,10 L105,25 L120,25 L108,35 L112,50 L100,40 L88,50 L92,35 L80,25 L95,25 Z" fill="#fbbf24" className="animate-pulse" />
                    </svg>
                </div>

                {/* 4. ANIMATED SNOWMAN (Bottom Left - Kept) */}
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
    }

    if (activeHolidayTheme === 'NEW_YEAR') {
        return (
            <div className="fixed inset-0 z-[9000] pointer-events-none overflow-hidden print:hidden">
                {/* 1. FESTIVE FIREWORKS (Colorful & Vibrant) */}
                <div className="absolute inset-0 opacity-50">
                    <Fireworks
                        options={{
                            hue: { min: 0, max: 360 }, // MULTICOLOR IS BACK!
                            acceleration: 1.02,
                            brightness: { min: 50, max: 80 },
                            decay: { min: 0.015, max: 0.03 },
                            delay: { min: 30, max: 60 },
                            explosion: 6,
                            flickering: 50,
                            intensity: 20, // More intense
                            friction: 0.97,
                            gravity: 1.2,
                            opacity: 0.5,
                            particles: 60,
                            traceLength: 3,
                            traceSpeed: 8,
                            rocketsPoint: { min: 0, max: 100 },
                            lineWidth: { explosion: { min: 1, max: 3 }, trace: { min: 1, max: 2 } },
                            lineStyle: 'round',
                            sound: { enabled: false }
                        }}
                        style={{ top: 0, left: 0, width: '100%', height: '100%', position: 'fixed', background: 'transparent' }}
                    />
                </div>

                {/* 2. FESTIVE HEADER BANNER (Restored from V1) */}
                <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-purple-900 via-pink-600 to-purple-900 text-white py-3 shadow-xl z-[9001] opacity-95">
                    <div className="container mx-auto flex justify-center items-center gap-6 animate-pulse">
                        <span className="text-3xl animate-bounce">🥂</span>
                        <h1 className="text-3xl md:text-4xl font-extrabold tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-white to-yellow-300 drop-shadow-md">
                            BONNE ANNÉE 2026 !
                        </h1>
                        <span className="text-3xl animate-bounce">🎉</span>
                    </div>
                </div>

                {/* 3. FLOATING CONFETTI (CSS Animation) */}
                <div className="absolute inset-0 overflow-hidden">
                    {[...Array(20)].map((_, i) => (
                        <div
                            key={i}
                            className="absolute rounded-sm animate-fall"
                            style={{
                                width: '10px', height: '10px',
                                backgroundColor: ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff'][i % 5],
                                left: `${Math.random() * 100}%`,
                                top: '-20px',
                                animationDuration: `${5 + Math.random() * 5}s`,
                                animationDelay: `${Math.random() * 5}s`,
                                transform: `rotate(${Math.random() * 360}deg)`
                            }}
                        ></div>
                    ))}
                </div>

                <style jsx>{`
                    @keyframes fall {
                        0% { transform: translateY(0) rotate(0deg); opacity: 1; }
                        100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
                    }
                    .animate-fall { animation: fall linear infinite; }
                `}</style>
            </div>
        );
    }

    if (activeHolidayTheme === 'HALLOWEEN') {
        return (
            <div className="fixed inset-0 z-[9000] pointer-events-none overflow-hidden print:hidden">
                {/* 1. SPOOKY VIGNETTE (Orange/Purple glow at edges) */}
                <div className="absolute inset-0 z-[9001]" style={{
                    background: 'radial-gradient(circle at center, transparent 60%, rgba(76, 29, 149, 0.2) 100%)'
                }}></div>

                {/* 2. HALLOWEEN BANNER */}
                <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-orange-900 via-purple-900 to-orange-900 text-white py-3 shadow-xl z-[9002] opacity-95 border-b-4 border-orange-600">
                    <div className="container mx-auto flex justify-center items-center gap-6 animate-pulse">
                        <span className="text-3xl animate-bounce">🦇</span>
                        <h1 className="text-3xl md:text-4xl font-extrabold tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-purple-300 to-orange-400 drop-shadow-md font-serif">
                            JOYEUX HALLOWEEN
                        </h1>
                        <span className="text-3xl animate-bounce">🕸️</span>
                    </div>
                </div>

                {/* 3. SPIDERWEBS (Corners) */}
                <div className="absolute top-12 left-0 w-48 h-48 z-[9002] opacity-80">
                    <svg viewBox="0 0 100 100" className="w-full h-full fill-none stroke-gray-400/50 stroke-1">
                        <path d="M0,0 L100,0 L0,100 Z" fill="none" />
                        <path d="M0,0 L50,50 M0,0 L80,20 M0,0 L20,80 M0,0 L100,0 M0,0 L0,100" />
                        <path d="M10,90 Q20,80 30,70 Q40,60 50,50" strokeOpacity="0.5" />
                        <path d="M20,80 Q30,60 50,40" strokeOpacity="0.5" />
                        <path d="M5,95 Q40,60 95,5" strokeOpacity="0.3" />
                    </svg>
                </div>
                <div className="absolute top-12 right-0 w-48 h-48 z-[9002] opacity-80 transform scale-x-[-1]">
                    <svg viewBox="0 0 100 100" className="w-full h-full fill-none stroke-gray-400/50 stroke-1">
                        <path d="M0,0 L100,0 L0,100 Z" fill="none" />
                        <path d="M0,0 L50,50 M0,0 L80,20 M0,0 L20,80 M0,0 L100,0 M0,0 L0,100" />
                        <path d="M10,90 Q20,80 30,70 Q40,60 50,50" strokeOpacity="0.5" />
                        <path d="M20,80 Q30,60 50,40" strokeOpacity="0.5" />
                    </svg>
                </div>

                {/* 4. FLYING BATS (Animated) */}
                <div className="absolute inset-0 overflow-hidden z-[9003]">
                    {[...Array(5)].map((_, i) => (
                        <div key={i} className="absolute animate-fly-bat" style={{
                            top: `${Math.random() * 40 + 10}%`,
                            left: '-100px',
                            animationDuration: `${10 + Math.random() * 10}s`,
                            animationDelay: `${Math.random() * 10}s`,
                            transform: `scale(${0.5 + Math.random() * 0.5})`
                        }}>
                            <svg width="60" height="40" viewBox="0 0 100 60" fill="black">
                                <path d="M50,30 Q70,5 90,20 Q100,30 90,40 Q70,60 50,40 Q30,60 10,40 Q0,30 10,20 Q30,5 50,30 Z" />
                            </svg>
                        </div>
                    ))}
                </div>

                {/* 5. FLOATING GHOSTS */}
                <div className="absolute inset-0 overflow-hidden z-[9003]">
                    {[...Array(3)].map((_, i) => (
                        <div key={i} className="absolute animate-float-ghost opacity-60" style={{
                            bottom: '-100px',
                            left: `${20 + Math.random() * 60}%`,
                            animationDuration: `${15 + Math.random() * 5}s`,
                            animationDelay: `${Math.random() * 5}s`
                        }}>
                            <svg width="60" height="80" viewBox="0 0 100 120" fill="white">
                                <path d="M10,120 Q10,100 0,80 Q0,0 50,0 Q100,0 100,80 Q90,100 90,120 L80,110 L70,120 L60,110 L50,120 L40,110 L30,120 L20,110 L10,120 Z" />
                                <circle cx="35" cy="40" r="5" fill="black" />
                                <circle cx="65" cy="40" r="5" fill="black" />
                                <ellipse cx="50" cy="55" rx="5" ry="8" fill="black" />
                            </svg>
                        </div>
                    ))}
                </div>

                {/* 6. PUMPKINS (Bottom Corners) */}
                <div className="absolute bottom-0 left-4 w-32 h-32 z-[9003] animate-bounce-slow">
                    <svg viewBox="0 0 100 100">
                        <path d="M50,10 L55,25 L45,25 Z" fill="#166534" /> {/* Stem */}
                        <ellipse cx="50" cy="60" rx="45" ry="35" fill="#ea580c" />
                        <ellipse cx="50" cy="60" rx="35" ry="35" fill="#f97316" />
                        <ellipse cx="50" cy="60" rx="15" ry="35" fill="#fb923c" />
                        {/* Eyes */}
                        <path d="M30,50 L40,50 L35,40 Z" fill="#4a0404" />
                        <path d="M60,50 L70,50 L65,40 Z" fill="#4a0404" />
                        {/* Mouth */}
                        <path d="M30,70 Q50,85 70,70 L65,80 Q50,90 35,80 Z" fill="#4a0404" />
                    </svg>
                </div>
                <div className="absolute bottom-0 right-4 w-24 h-24 z-[9003] animate-bounce-slow animation-delay-1000">
                    <svg viewBox="0 0 100 100">
                        <path d="M50,10 L55,25 L45,25 Z" fill="#166534" />
                        <ellipse cx="50" cy="60" rx="45" ry="35" fill="#ea580c" />
                        <ellipse cx="50" cy="60" rx="35" ry="35" fill="#f97316" />
                        <path d="M30,50 L40,50 L35,40 Z" fill="#4a0404" />
                        <path d="M60,50 L70,50 L65,40 Z" fill="#4a0404" />
                        <path d="M30,70 Q50,85 70,70 L65,80 Q50,90 35,80 Z" fill="#4a0404" />
                    </svg>
                </div>

                <style jsx>{`
                    @keyframes fly-bat {
                        0% { left: -100px; transform: translateY(0) scale(0.5); }
                        25% { transform: translateY(-50px) scale(0.6); }
                        50% { transform: translateY(0) scale(0.7); }
                        75% { transform: translateY(50px) scale(0.6); }
                        100% { left: 110vw; transform: translateY(0) scale(0.5); }
                    }
                    .animate-fly-bat { animation: fly-bat linear infinite; }
                    @keyframes float-ghost {
                        0% { transform: translateY(0) translateX(0); opacity: 0; }
                        20% { opacity: 0.6; }
                        80% { opacity: 0.6; }
                        100% { transform: translateY(-80vh) translateX(50px); opacity: 0; }
                    }
                    .animate-float-ghost { animation: float-ghost linear infinite; }
                    @keyframes bounce-slow { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-5px); } }
                    .animate-bounce-slow { animation: bounce-slow 3s ease-in-out infinite; }
                    .animation-delay-1000 { animation-delay: 1s; }
                `}</style>
            </div>
        );
    }

    if (activeHolidayTheme === 'RAMADAN') {
        return (
            <div className="fixed inset-0 z-[9000] pointer-events-none overflow-hidden print:hidden">
                {/* 1. NIGHT SKY VIGNETTE (Deep Blue/Emerald) */}
                <div className="absolute inset-0 z-[9001]" style={{
                    background: 'radial-gradient(circle at center, transparent 60%, rgba(6, 78, 59, 0.3) 100%)'
                }}></div>

                {/* 2. RAMADAN BANNER */}
                <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-emerald-900 via-emerald-600 to-emerald-900 text-white py-3 shadow-xl z-[9002] opacity-95 border-b-2 border-yellow-500">
                    <div className="container mx-auto flex justify-center items-center gap-6 animate-pulse">
                        <span className="text-3xl animate-bounce-slow">🌙</span>
                        <h1 className="text-3xl md:text-4xl font-extrabold tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 via-yellow-400 to-yellow-200 drop-shadow-md font-serif">
                            RAMADAN MUBARAK
                        </h1>
                        <span className="text-3xl animate-bounce-slow">✨</span>
                    </div>
                </div>

                {/* 3. HANGING LANTERNS (FANOUS) - Animated */}
                <div className="absolute top-0 left-0 w-full h-64 z-[9002] pointer-events-none">
                    {/* Lantern 1 (Left) */}
                    <div className="absolute top-0 left-[10%] animate-swing origin-top">
                        <div className="w-0.5 h-32 bg-yellow-500/50 mx-auto"></div>
                        <svg width="60" height="100" viewBox="0 0 60 100" className="drop-shadow-lg">
                            <path d="M20,0 L40,0 L50,20 L10,20 Z" fill="#fbbf24" /> {/* Top */}
                            <path d="M10,20 L50,20 L60,60 L0,60 Z" fill="#f59e0b" /> {/* Body */}
                            <path d="M0,60 L60,60 L40,90 L20,90 Z" fill="#fbbf24" /> {/* Bottom */}
                            <rect x="20" y="30" width="20" height="30" fill="#fef3c7" className="animate-pulse" /> {/* Light */}
                        </svg>
                    </div>

                    {/* Lantern 2 (Right) */}
                    <div className="absolute top-0 right-[10%] animate-swing-delayed origin-top">
                        <div className="w-0.5 h-40 bg-yellow-500/50 mx-auto"></div>
                        <svg width="50" height="80" viewBox="0 0 60 100" className="drop-shadow-lg">
                            <path d="M20,0 L40,0 L50,20 L10,20 Z" fill="#fbbf24" />
                            <path d="M10,20 L50,20 L60,60 L0,60 Z" fill="#d97706" />
                            <path d="M0,60 L60,60 L40,90 L20,90 Z" fill="#fbbf24" />
                            <rect x="20" y="30" width="20" height="30" fill="#fef3c7" className="animate-pulse" />
                        </svg>
                    </div>

                    {/* Lantern 3 (Center-ish) */}
                    <div className="absolute top-0 left-[25%] animate-swing origin-top animation-delay-1000">
                        <div className="w-0.5 h-20 bg-yellow-500/50 mx-auto"></div>
                        <svg width="40" height="70" viewBox="0 0 60 100" className="drop-shadow-lg">
                            <path d="M20,0 L40,0 L50,20 L10,20 Z" fill="#fbbf24" />
                            <path d="M10,20 L50,20 L60,60 L0,60 Z" fill="#b45309" />
                            <path d="M0,60 L60,60 L40,90 L20,90 Z" fill="#fbbf24" />
                            <rect x="20" y="30" width="20" height="30" fill="#fef3c7" className="animate-pulse" />
                        </svg>
                    </div>
                </div>

                {/* 4. CRESCENT MOON & STARS (Background) */}
                <div className="absolute top-20 right-20 z-[9001] opacity-80 animate-pulse-slow">
                    <svg width="100" height="100" viewBox="0 0 100 100">
                        <path d="M50,10 A40,40 0 1,0 90,50 A30,30 0 1,1 50,10 Z" fill="#fbbf24" />
                        <path d="M60,30 L62,35 L67,35 L63,38 L65,43 L60,40 L55,43 L57,38 L53,35 L58,35 Z" fill="#fff" className="animate-twinkle" />
                    </svg>
                </div>

                {/* 5. GEOMETRIC PATTERN (Subtle Overlay) */}
                <div className="absolute inset-0 z-[9000] opacity-5 pointer-events-none" style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%2310b981' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
                }}></div>

                {/* 6. TWINKLING STARS */}
                <div className="absolute inset-0 overflow-hidden z-[9001]">
                    {[...Array(15)].map((_, i) => (
                        <div key={i} className="absolute animate-twinkle" style={{
                            top: `${Math.random() * 50}%`,
                            left: `${Math.random() * 100}%`,
                            animationDuration: `${2 + Math.random() * 3}s`,
                            animationDelay: `${Math.random() * 2}s`
                        }}>
                            <svg width="10" height="10" viewBox="0 0 10 10">
                                <path d="M5,0 L6,4 L10,5 L6,6 L5,10 L4,6 L0,5 L4,4 Z" fill="#fbbf24" />
                            </svg>
                        </div>
                    ))}
                </div>

                <style jsx>{`
                    @keyframes swing { 0%, 100% { transform: rotate(-3deg); } 50% { transform: rotate(3deg); } }
                    .animate-swing { animation: swing 4s ease-in-out infinite; }
                    .animate-swing-delayed { animation: swing 5s ease-in-out infinite reverse; }
                    @keyframes twinkle { 0%, 100% { opacity: 1; transform: scale(1); } 50% { opacity: 0.3; transform: scale(0.5); } }
                    .animate-twinkle { animation: twinkle 3s infinite; }
                    @keyframes bounce-slow { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-5px); } }
                    .animate-bounce-slow { animation: bounce-slow 3s ease-in-out infinite; }
                    .animation-delay-1000 { animation-delay: 1s; }
                `}</style>
            </div>
        );
    }

    return null;
};
